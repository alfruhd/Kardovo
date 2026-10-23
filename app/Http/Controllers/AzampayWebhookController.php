<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\PaymentLedgerEntry;
use App\Models\TicketOrder;
use App\Models\VoteOrder;
use App\Models\Wallet;
use App\Services\TicketDeliveryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AzampayWebhookController extends Controller
{
    public function handleCallback(Request $request)
    {
        Log::info('Azampay Webhook Received:', $request->all());

        // 1. Verify cryptographic webhook signature when secret is configured
        if (! $this->hasValidSignature($request)) {
            Log::warning('Azampay Webhook rejected due to invalid signature', [
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid webhook signature',
            ], 401);
        }

        // 2. Basic payload validation
        if (! $request->has('transactionid') || ! $request->has('externalId') || ! $request->has('mnoReference')) {
            return response()->json(['success' => false, 'message' => 'Invalid payload'], 400);
        }

        $externalId = (string) $request->input('externalId');
        $gatewayTxId = (string) $request->input('transactionid');
        $mnoReference = (string) $request->input('mnoReference');
        $statusText = strtolower((string) $request->input('message', ''));
        $isSuccess = str_contains($statusText, 'success') || str_contains($statusText, 'completed');
        $targetState = $isSuccess ? PaymentLedgerEntry::STATE_CAPTURED : PaymentLedgerEntry::STATE_FAILED;

        $providerEventId = $request->input('event_id')
            ? 'azampay:event:'.trim((string) $request->input('event_id'))
            : "azampay:{$gatewayTxId}:{$targetState}";

        // Fast-path deduplication check on provider_event_id
        if (PaymentLedgerEntry::where('provider_event_id', $providerEventId)->exists()) {
            return response()->json([
                'success' => true,
                'message' => 'Already processed',
                'idempotent_replay' => true,
            ], 200);
        }

        return DB::transaction(function () use ($request, $externalId, $gatewayTxId, $mnoReference, $isSuccess, $targetState, $providerEventId) {
            $transaction = FinancialTransaction::where('transaction_number', $externalId)
                ->orWhere('reference', $externalId)
                ->lockForUpdate()
                ->first();

            $ticketOrder = TicketOrder::with('tickets')
                ->where('order_number', $externalId)
                ->orWhere('payment_reference', $externalId)
                ->when($transaction && $transaction->reference, function ($q) use ($transaction) {
                    $q->orWhere('payment_reference', $transaction->reference);
                })
                ->lockForUpdate()
                ->first();

            $voteOrder = VoteOrder::where('order_number', $externalId)
                ->orWhere('payment_reference', $externalId)
                ->lockForUpdate()
                ->first();

            if (! $transaction && ! $ticketOrder && ! $voteOrder) {
                Log::error('Azampay Webhook: Transaction not found', ['externalId' => $externalId]);

                return response()->json(['success' => false, 'message' => 'Transaction not found'], 404);
            }

            // Re-check provider_event_id inside transaction lock
            if (PaymentLedgerEntry::where('provider_event_id', $providerEventId)->exists()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Already processed',
                    'idempotent_replay' => true,
                ], 200);
            }

            if (($transaction && $transaction->status === 'completed' && ($ticketOrder === null || $ticketOrder->isPaid()))
                || ($voteOrder && $voteOrder->status === 'completed')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Already processed',
                    'idempotent_replay' => true,
                ], 200);
            }

            // Append immutable ledger entry for this webhook state transition
            PaymentLedgerEntry::appendEntry([
                'ticket_order_id' => $ticketOrder?->id,
                'financial_transaction_id' => $transaction?->id,
                'event_id' => $ticketOrder?->event_id ?? $transaction?->event_id ?? $voteOrder?->event_id,
                'idempotency_key' => $ticketOrder?->idempotency_key ?? $transaction?->idempotency_key ?? ('vote:'.$voteOrder?->order_number),
                'provider_event_id' => $providerEventId,
                'state' => $targetState,
                'amount' => $ticketOrder?->total_amount ?? $transaction?->amount ?? $voteOrder?->amount ?? 0,
                'currency' => $ticketOrder?->currency ?? $transaction?->currency ?? $voteOrder?->currency ?? 'TZS',
                'payment_method' => $ticketOrder?->payment_method ?? $transaction?->payment_method ?? $voteOrder?->provider ?? 'AzamPay',
                'gateway_reference' => $mnoReference ?: $gatewayTxId,
                'metadata' => [
                    'external_id' => $externalId,
                    'transactionid' => $gatewayTxId,
                    'mno_reference' => $mnoReference,
                    'message' => $request->input('message'),
                    'operator' => $request->input('operator'),
                ],
            ]);

            if ($isSuccess) {
                if ($transaction && $transaction->status !== 'completed') {
                    $existingNotes = $transaction->notes;
                    $meta = is_string($existingNotes) ? json_decode($existingNotes, true) : null;
                    $updatedNotes = is_array($meta)
                        ? json_encode(array_merge($meta, [
                            'azampay_transaction_id' => $gatewayTxId,
                            'azampay_confirmed_at' => now()->toIso8601String(),
                        ]))
                        : 'Azampay transaction ID: '.$gatewayTxId;

                    $transaction->update([
                        'status' => 'completed',
                        'reference' => $mnoReference,
                        'notes' => $updatedNotes,
                    ]);

                    // If package_purchase, credit message quotas (Card packages: 1 WA + 1 SMS per card; Bulk SMS: credit SMS only)
                    if ($transaction->category === 'package_purchase' && $transaction->user) {
                        $isBulkSms = false;
                        $smsCount = 0;
                        $whatsappCount = 0;

                        if (is_array($meta)) {
                            $isBulkSms = ($meta['package_type'] ?? '') === 'bulk_sms' || ! empty($meta['is_bulk_sms']);
                            if ($isBulkSms) {
                                $smsCount = (int) ($meta['sms_count'] ?? $meta['sms_messages_included'] ?? 0);
                            } else {
                                $cardsCount = (int) ($meta['cards_count'] ?? $meta['guests_count'] ?? 0);
                                $whatsappCount = (int) ($meta['whatsapp_messages_included'] ?? $cardsCount);
                                $smsCount = (int) ($meta['sms_messages_included'] ?? $cardsCount);
                            }
                        }

                        // Fallback matching from transaction title if meta not parsed
                        if (! $isBulkSms && $whatsappCount <= 0 && $smsCount <= 0) {
                            if (preg_match('/(\d+)\s+Bulk\s+SMS/i', $transaction->title, $matches)) {
                                $isBulkSms = true;
                                $smsCount = (int) $matches[1];
                            } elseif (preg_match('/\((\d+)\s+cards/i', $transaction->title, $matches)) {
                                $cardsCount = (int) $matches[1];
                                $whatsappCount = $cardsCount;
                                $smsCount = $cardsCount;
                            } elseif (preg_match('/\((\d+)\s+guests\)/i', $transaction->title, $matches)) {
                                $cardsCount = (int) $matches[1];
                                $whatsappCount = $cardsCount;
                                $smsCount = $cardsCount;
                            }
                        }

                        if ($whatsappCount > 0 || $smsCount > 0) {
                            $transaction->user->addMessageQuotas($whatsappCount, $smsCount);
                        }
                    }

                    // Credit the wallet if wallet_id exists
                    if ($transaction->wallet_id) {
                        $wallet = Wallet::lockForUpdate()->find($transaction->wallet_id);
                        if ($wallet) {
                            $wallet->balance += $transaction->amount;
                            $wallet->save();
                        }
                    }
                }

                if ($ticketOrder && ! $ticketOrder->isPaid()) {
                    $ticketOrder->update([
                        'payment_status' => 'paid',
                        'paid_at' => now(),
                    ]);

                    $ticketOrder->tickets()->where('status', '!=', 'cancelled')->update(['status' => 'valid']);

                    $primaryTicket = $ticketOrder->tickets->first();
                    if ($primaryTicket && ! empty($ticketOrder->buyer_phone)) {
                        try {
                            TicketDeliveryService::sendWhatsApp($primaryTicket, $ticketOrder->buyer_phone);
                            TicketDeliveryService::sendSms($primaryTicket, $ticketOrder->buyer_phone);
                            if (! empty($ticketOrder->buyer_email)) {
                                TicketDeliveryService::sendEmail($primaryTicket, $ticketOrder->buyer_email);
                            }
                        } catch (\Throwable $e) {
                        }
                    }
                }

                if ($voteOrder && $voteOrder->status !== 'completed') {
                    $voteOrder->markAsCompleted($gatewayTxId);
                }
            } else {
                if ($transaction && $transaction->status !== 'completed') {
                    $transaction->update([
                        'status' => 'failed',
                        'notes' => 'Azampay transaction failed. '.$request->input('message', ''),
                    ]);
                }

                if ($ticketOrder && ! $ticketOrder->isPaid()) {
                    $ticketOrder->update([
                        'payment_status' => 'failed',
                    ]);
                }

                if ($voteOrder && $voteOrder->status === 'pending') {
                    $voteOrder->update([
                        'status' => 'failed',
                    ]);
                }
            }

            return response()->json(['success' => true]);
        });
    }

    /**
     * Validate webhook HMAC-SHA256 signature when a webhook secret is configured.
     */
    protected function hasValidSignature(Request $request): bool
    {
        $secret = config('services.azampay.webhook_secret');
        if (empty($secret)) {
            return true;
        }

        $providedSignature = $request->header('X-Azampay-Signature')
            ?: $request->header('X-Signature')
            ?: $request->header('X-Webhook-Signature');

        if (empty($providedSignature)) {
            return false;
        }

        $rawContent = $request->getContent();
        $expectedHmac = hash_hmac('sha256', $rawContent, (string) $secret);

        return hash_equals($expectedHmac, (string) $providedSignature)
            || hash_equals((string) $secret, (string) $providedSignature);
    }
}
