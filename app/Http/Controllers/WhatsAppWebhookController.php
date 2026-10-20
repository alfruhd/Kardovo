<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Message;
use App\Models\PledgePayment;
use App\Models\SystemSetting;
use App\Services\PhoneNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    /**
     * Meta WhatsApp Webhook Verification (GET request)
     */
    public function verify(Request $request)
    {
        $gateway = SystemSetting::get('whatsapp_gateway', []);
        $configuredVerifyToken = $gateway['verify_token'] ?? 'kardovo_verify_token_2026';
        $mode = $request->input('hub_mode', $request->input('hub.mode', $request->input('mode')));
        $token = $request->input('hub_verify_token', $request->input('hub.verify_token', $request->input('token')));
        $challenge = $request->input('hub_challenge', $request->input('hub.challenge', $request->input('challenge')));

        if ($mode === 'subscribe' && $token === $configuredVerifyToken) {
            return response($challenge, 200);
        }

        // Support plain ping check
        if ($request->has('ping') || $request->has('check')) {
            return response()->json(['status' => 'ok', 'message' => 'Kardovo Webhook Active']);
        }

        return response('Forbidden', 403);
    }

    /**
     * Inbound WhatsApp & SMS Webhook Handler (POST/GET request)
     * Automatically handles 1-Tap RSVP Button Replies & text responses from guests across all gateways.
     */
    public function handle(Request $request)
    {
        $payload = $request->all();
        Log::info('Kardovo Inbound Webhook Received:', ['payload' => $payload, 'query' => $request->query()]);

        // 1. Meta Cloud API WhatsApp Format (entry -> changes -> value -> messages / statuses)
        $entries = $payload['entry'] ?? [];
        if (is_array($entries) && ! empty($entries)) {
            foreach ($entries as $entry) {
                $changes = $entry['changes'] ?? [];
                if (! is_array($changes)) {
                    continue;
                }

                foreach ($changes as $changeObj) {
                    $change = $changeObj['value'] ?? [];
                    if (! is_array($change)) {
                        continue;
                    }

                    // 1a. Delivery Receipts / Status updates (sent, delivered, read, failed)
                    $statuses = $change['statuses'] ?? [];
                    if (! empty($statuses) && is_array($statuses)) {
                        foreach ($statuses as $stat) {
                            $recipientPhone = $stat['recipient_id'] ?? '';
                            $statusType = strtolower($stat['status'] ?? ''); // 'sent', 'delivered', 'read', 'failed'
                            $cleanPhone = PhoneNormalizer::cleanForApi($recipientPhone);
                            $last9 = strlen($cleanPhone) >= 9 ? substr($cleanPhone, -9) : $cleanPhone;

                            if ($cleanPhone && in_array($statusType, ['sent', 'delivered', 'read', 'failed'])) {
                                Log::info("WhatsApp Delivery Receipt Webhook: {$cleanPhone} => {$statusType}");

                                $latestMsg = Message::where(function ($q) use ($cleanPhone, $recipientPhone, $last9) {
                                    $q->where('recipient_phone', 'like', "%{$cleanPhone}%")
                                        ->orWhere('recipient_phone', 'like', "%{$recipientPhone}%")
                                        ->orWhere('recipient_phone', 'like', "%{$last9}%");
                                })
                                    ->where('channel', 'whatsapp')
                                    ->latest()
                                    ->first();

                                if ($latestMsg) {
                                    $updateData = ['status' => $statusType];
                                    if ($statusType === 'delivered' && ! $latestMsg->delivered_at) {
                                        $updateData['delivered_at'] = now();
                                    }
                                    if ($statusType === 'read' && ! $latestMsg->read_at) {
                                        $updateData['read_at'] = now();
                                    }
                                    $latestMsg->update($updateData);

                                    if ($latestMsg->guest_id) {
                                        Guest::where('id', $latestMsg->guest_id)->update([
                                            'delivery_status' => $statusType,
                                        ]);
                                    }
                                }

                                // Directly update matching Guest records by phone for instant UI sync
                                Guest::where(function ($q) use ($cleanPhone, $recipientPhone, $last9) {
                                    $q->where('phone', 'like', "%{$cleanPhone}%")
                                        ->orWhere('phone', 'like', "%{$recipientPhone}%")
                                        ->orWhere('phone', 'like', "%{$last9}%");
                                })->update([
                                    'delivery_status' => $statusType,
                                ]);
                            }
                        }
                    }

                    // 1b. Inbound Messages & RSVPs
                    $messages = $change['messages'] ?? [];
                    if (! empty($messages) && is_array($messages)) {
                        foreach ($messages as $msg) {
                            $this->processInboundMessageItem($msg);
                        }
                    }
                }
            }
        }

        // 2. Direct Messages array at root (e.g. some webhooks or test payloads)
        if (! empty($payload['messages']) && is_array($payload['messages'])) {
            foreach ($payload['messages'] as $msg) {
                $this->processInboundMessageItem($msg);
            }
        }

        // 3. UltraMsg / Wasapi / Baileys format (data.from, data.body)
        if (isset($payload['data']) && (isset($payload['data']['from']) || isset($payload['data']['body']))) {
            $data = $payload['data'];
            $fromPhone = $data['from'] ?? '';
            $body = $data['body'] ?? '';
            $this->evaluateAndProcessRsvp($fromPhone, $body);
        }

        // 4. SMS Gateways (NextSMS, Beem, Twilio, AfricasTalking, Generic SMS)
        // Check for common phone / message key combinations in request
        $smsFrom = $payload['from'] ?? $payload['From'] ?? $payload['source_addr'] ?? $payload['sender'] ?? $payload['phone'] ?? $payload['mobile'] ?? $payload['msisdn'] ?? $request->query('from') ?? $request->query('phone') ?? '';
        $smsBody = $payload['text'] ?? $payload['body'] ?? $payload['Body'] ?? $payload['message'] ?? $payload['content'] ?? $payload['msg'] ?? $payload['response'] ?? $payload['rsvp'] ?? $request->query('text') ?? $request->query('message') ?? '';
        $smsPayload = $payload['button_payload'] ?? $payload['payload'] ?? $payload['ButtonPayload'] ?? $payload['id'] ?? '';

        if (! empty($smsFrom) && (! empty($smsBody) || ! empty($smsPayload))) {
            $this->evaluateAndProcessRsvp($smsFrom, $smsBody, $smsPayload);
        }

        return response()->json(['status' => 'success', 'timestamp' => now()->toIso8601String()]);
    }

    /**
     * Dedicated SMS Webhook Endpoint (GET/POST)
     */
    public function handleSms(Request $request)
    {
        return $this->handle($request);
    }

    /**
     * Helper to process an individual Meta-format message item
     */
    protected function processInboundMessageItem(array $msg): void
    {
        $fromPhone = $msg['from'] ?? '';
        $msgType = $msg['type'] ?? '';

        $buttonPayload = null;
        $buttonTitle = '';

        if ($msgType === 'interactive') {
            $buttonPayload = $msg['interactive']['button_reply']['id'] ?? $msg['interactive']['list_reply']['id'] ?? '';
            $buttonTitle = $msg['interactive']['button_reply']['title'] ?? $msg['interactive']['list_reply']['title'] ?? '';
        } elseif ($msgType === 'button') {
            $buttonPayload = $msg['button']['payload'] ?? '';
            $buttonTitle = $msg['button']['text'] ?? '';
        }

        $bodyText = '';
        if ($msgType === 'text') {
            $bodyText = $msg['text']['body'] ?? '';
        }

        $combinedText = trim(($buttonTitle ?: '').' '.($bodyText ?: ''));
        $this->evaluateAndProcessRsvp($fromPhone, $combinedText, $buttonPayload);
    }

    /**
     * Evaluate incoming text/payload for RSVP intent and execute state change.
     */
    protected function evaluateAndProcessRsvp(string $fromPhone, string $rawText = '', ?string $buttonPayload = null): void
    {
        if (empty($fromPhone)) {
            return;
        }

        $isAttending = false;
        $isDeclined = false;

        $normalizedPayload = strtolower(trim($buttonPayload ?: ''));
        $cleanText = strtolower(trim(preg_replace('/[^\p{L}\p{N}\s_]/u', ' ', $rawText)));

        // Check Button Payload
        if (! empty($normalizedPayload)) {
            if (
                str_starts_with($normalizedPayload, 'rsvp_yes') ||
                str_contains($normalizedPayload, 'rsvp_yes') ||
                str_contains($normalizedPayload, 'attend') ||
                str_contains($normalizedPayload, 'yes')
            ) {
                $isAttending = true;
            } elseif (
                str_starts_with($normalizedPayload, 'rsvp_no') ||
                str_contains($normalizedPayload, 'rsvp_no') ||
                str_contains($normalizedPayload, 'decline') ||
                str_contains($normalizedPayload, 'cannot') ||
                str_contains($normalizedPayload, 'no')
            ) {
                $isDeclined = true;
            }
        }

        // Check Text Content (English & Swahili keywords)
        if (! $isAttending && ! $isDeclined && ! empty($cleanText)) {
            $attendingKeywords = [
                'attend', 'attending', 'attends', 'confirmed', 'confirm', 'yes', 'ndio',
                'nitahudhuria', 'nitaudhuria', 'nitafika', 'nitakuja', 'nitakuwepo',
                'niko ndani', 'nipo', 'sawa', 'accept', 'will attend', 'i will attend',
                '1', 'sure', 'tutaonana', 'naja',
            ];

            $declinedKeywords = [
                'decline', 'declined', 'declines', 'cannot', 'cant', 'cannot attend',
                'can t attend', 'no', 'hapana', 'sitahudhuria', 'sitaudhuria',
                'sitafika', 'sitakuja', 'sitakuwepo', 'sitaweza', 'sorry', 'samahani',
                '2', 'reject', 'kataa',
            ];

            foreach ($attendingKeywords as $keyword) {
                if ($cleanText === $keyword || str_contains(" {$cleanText} ", " {$keyword} ")) {
                    $isAttending = true;
                    break;
                }
            }

            if (! $isAttending) {
                foreach ($declinedKeywords as $keyword) {
                    if ($cleanText === $keyword || str_contains(" {$cleanText} ", " {$keyword} ")) {
                        $isDeclined = true;
                        break;
                    }
                }
            }
        }

        if ($isAttending || $isDeclined) {
            $this->processGuestRsvp($fromPhone, $isAttending, $buttonPayload ?: null);
        } else {
            $this->evaluateAndProcessPledgeOrPayment($fromPhone, $rawText, $buttonPayload);
        }
    }

    /**
     * Evaluate incoming text for Pledge commitment, Mobile Money payment forward, or balance inquiry.
     */
    protected function evaluateAndProcessPledgeOrPayment(string $fromPhone, string $rawText = '', ?string $buttonPayload = null): void
    {
        if (empty($fromPhone) || empty(trim($rawText))) {
            return;
        }

        $guest = $this->resolveGuestFromInbound($fromPhone, $buttonPayload);

        if (! $guest) {
            Log::info("Inbound text from unknown guest ({$fromPhone}): \"{$rawText}\"");

            return;
        }

        $event = $guest->event;
        $currency = $event->pledge_currency ?: 'TZS';
        $token = $guest->qr_token ?? $guest->unique_code ?? $guest->card_number ?? $guest->id;
        $passUrl = url("/card/{$token}");

        // 1. Mobile Money Payment Confirmation SMS Forward
        $paymentData = $this->extractMobileMoneyPayment($rawText);
        if ($paymentData && $paymentData['amount'] > 0) {
            $ref = $paymentData['reference_number'];

            $alreadyExists = PledgePayment::where('event_id', $event->id)
                ->where('reference', $ref)
                ->exists();

            if ($alreadyExists) {
                $alreadyText = "Hello {$guest->name}! Payment reference *{$ref}* has already been recorded for *{$event->title}*. Current balance: {$currency} ".number_format($guest->pledge_balance).".\n\nView Pass: {$passUrl}";
                $this->sendAutomatedReply($fromPhone, $alreadyText, $guest);

                return;
            }

            $payment = $guest->pledgePayments()->create([
                'event_id' => $event->id,
                'user_id' => $event->user_id,
                'amount' => $paymentData['amount'],
                'payment_method' => $paymentData['payment_method'],
                'reference' => $ref,
                'payment_date' => now()->toDateString(),
                'notes' => 'Parsed from WhatsApp/SMS: '.mb_substr($paymentData['raw_text'], 0, 120),
            ]);

            $guest->recalculatePledgePaid();
            $fresh = $guest->fresh();

            $balanceLine = $fresh->pledge_balance > 0
                ? "Remaining pledge balance: *{$currency} ".number_format($fresh->pledge_balance).'*'
                : '🎉 Congratulations! Your pledge has been fully completed!';

            $receiptMsg = "Hello {$guest->name}! ✅ Payment of *{$currency} ".number_format($paymentData['amount'])."* (Ref: *{$ref}*) has been confirmed for *{$event->title}*.\n\n{$balanceLine}\n\nView your live pass & digital card:\n{$passUrl}\n\nThank you for your generous support! 🙏";

            $this->sendAutomatedReply($fromPhone, $receiptMsg, $guest);
            Log::info("Recorded payment of {$paymentData['amount']} for guest {$guest->name} via WhatsApp/SMS bot.");

            return;
        }

        // 2. Pledge Commitment (e.g. "Ahadi 100,000", "Pledge 50k", "Naahidi 200000")
        $pledgeAmount = $this->extractPledgeCommitment($rawText);
        if ($pledgeAmount && $pledgeAmount >= 1000) {
            $guest->update([
                'pledge_amount' => $pledgeAmount,
            ]);
            $guest->recalculatePledgePaid();

            $settings = $event->pledge_settings ?? [];
            $lipaNamba = $settings['lipa_namba'] ?? null;
            $accountName = $settings['account_name'] ?? null;
            $bankName = $settings['bank_name'] ?? null;
            $bankAccount = $settings['bank_account'] ?? null;

            $payDetails = '';
            if ($lipaNamba) {
                $payDetails .= "💳 Lipa Namba: *{$lipaNamba}*".($accountName ? " ({$accountName})" : '')."\n";
            }
            if ($bankName && $bankAccount) {
                $payDetails .= "🏦 Bank: *{$bankName}* Acc: *{$bankAccount}*\n";
            }

            $pledgeConfirmMsg = "Hello {$guest->name}! 🤝 Your pledge of *{$currency} ".number_format($pledgeAmount)."* for *{$event->title}* has been successfully recorded!\n\n"
                .(! empty($payDetails) ? "You can send your contribution to:\n{$payDetails}\n" : '')
                ."Once sent, reply here with the payment confirmation message or view your pass:\n{$passUrl}\n\nThank you for your blessing and support!";

            $this->sendAutomatedReply($fromPhone, $pledgeConfirmMsg, $guest);
            Log::info("Recorded pledge of {$pledgeAmount} for guest {$guest->name} via WhatsApp/SMS bot.");

            return;
        }

        // 3. Balance & Contribution Status Inquiry
        if ($this->isBalanceInquiry($rawText)) {
            $statusStr = ucfirst($guest->pledge_status ?? 'unpledged');
            $balanceMsg = "Hello {$guest->name}! 📊 Contribution status for *{$event->title}*:\n"
                ."• Total Pledge: *{$currency} ".number_format((float) ($guest->pledge_amount ?? 0))."*\n"
                ."• Paid Amount: *{$currency} ".number_format((float) ($guest->paid_amount ?? 0))."*\n"
                ."• Remaining Balance: *{$currency} ".number_format((float) ($guest->pledge_balance ?? 0))."*\n"
                ."• Status: *{$statusStr}*\n\n"
                ."View Digital Pass & Payment Details:\n{$passUrl}";

            $this->sendAutomatedReply($fromPhone, $balanceMsg, $guest);

            return;
        }

        Log::info("Inbound message from {$fromPhone} did not match RSVP, Pledge, or Payment keywords: \"{$rawText}\"");
    }

    /**
     * Resolve Guest model from inbound phone or token payload.
     */
    protected function resolveGuestFromInbound(string $rawPhone, ?string $buttonPayload = null): ?Guest
    {
        $cleanPhone = PhoneNormalizer::cleanForApi($rawPhone);
        $guest = null;

        if (! empty($buttonPayload) && str_starts_with($buttonPayload, 'rsvp_')) {
            $parts = explode('_', $buttonPayload, 3);
            if (count($parts) >= 3) {
                $token = $parts[2];
                $guest = Guest::where('qr_token', $token)
                    ->orWhere('unique_code', $token)
                    ->orWhere('card_number', $token)
                    ->orWhere('id', $token)
                    ->first();
            }
        }

        if (! $guest) {
            $last9 = strlen($cleanPhone) >= 9 ? substr($cleanPhone, -9) : $cleanPhone;
            $guest = Guest::where(function ($q) use ($cleanPhone, $rawPhone, $last9) {
                $q->where('phone', 'like', "%{$cleanPhone}%")
                    ->orWhere('phone', 'like', "%{$rawPhone}%")
                    ->orWhere('phone', 'like', "%{$last9}%");
            })->latest()->first();
        }

        // Fallback: match normalized phone or last 9 digits against candidate guests
        if (! $guest && ! empty($cleanPhone)) {
            $last9 = strlen($cleanPhone) >= 9 ? substr($cleanPhone, -9) : $cleanPhone;
            $candidates = Guest::latest()->take(500)->get();
            foreach ($candidates as $c) {
                $cClean = PhoneNormalizer::cleanForApi($c->phone);
                $cLast9 = strlen($cClean) >= 9 ? substr($cClean, -9) : $cClean;
                if ($cClean === $cleanPhone || $cLast9 === $last9) {
                    $guest = $c;
                    break;
                }
            }
        }

        return $guest;
    }

    /**
     * Parse Mobile Money confirmation texts (M-Pesa, Airtel, Tigo, HaloPesa, etc.)
     */
    protected function extractMobileMoneyPayment(string $text): ?array
    {
        $clean = trim($text);

        // Check if message resembles a payment confirmation
        $isPayment = preg_match('/(imethibitishwa|confirmed|umetuma|nimetuma|tumetuma|umelipa|nimelipa|muamala|kumbukumbu|trans(action)?\s*(id|no|namba)?|ref(erence)?|payment|mpesa|m-pesa|airtel|tigopesa|tigo\s*pesa|halopesa)/i', $clean);

        if (! $isPayment) {
            return null;
        }

        // 1. Extract Reference Code
        $refCode = null;
        if (preg_match('/\b([A-Z0-9]{8,12})\s+(?:imethibitishwa|confirmed)/i', $clean, $m)) {
            $refCode = strtoupper($m[1]);
        } elseif (preg_match('/(?:muamala\s+(?:namba|id)?|kumbukumbu\s+(?:namba)?|ref(?:erence)?[:\s#]+|txn\s*(?:id)?[:\s#]+|code[:\s]+)\s*([A-Z0-9.]+)/i', $clean, $m)) {
            $refCode = strtoupper(rtrim($m[1], '.'));
        } elseif (preg_match('/\b([0-9A-Z]{9,12})\b/', $clean, $m)) {
            $refCode = strtoupper($m[1]);
        }

        // 2. Extract Amount
        $amount = null;
        if (preg_match('/(?:tsh|tzs|kes|usd|sh)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,9})(?:\.[0-9]{2})?/i', $clean, $m)) {
            $amount = (float) str_replace(',', '', $m[1]);
        } elseif (preg_match('/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,9})\s*(?:\/=|tsh|tzs|kes)/i', $clean, $m)) {
            $amount = (float) str_replace(',', '', $m[1]);
        } elseif (preg_match('/(?:umetuma|umelipa|sent|paid|nimetuma|kiasi\s+cha)\s*(?:tsh|tzs)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,9})/i', $clean, $m)) {
            $amount = (float) str_replace(',', '', $m[1]);
        }

        // 3. Provider detection
        $method = 'mobile_money';
        $lower = strtolower($clean);
        if (str_contains($lower, 'mpesa') || str_contains($lower, 'm-pesa') || (isset($refCode) && strlen($refCode) === 10 && preg_match('/^[A-Z0-9]{10}$/', $refCode))) {
            $method = 'lipa_namba';
        } elseif (str_contains($lower, 'airtel')) {
            $method = 'mobile_money';
        } elseif (str_contains($lower, 'tigo') || str_contains($lower, 'mixx')) {
            $method = 'mobile_money';
        } elseif (str_contains($lower, 'halo')) {
            $method = 'mobile_money';
        }

        if ($amount && $amount >= 100) {
            return [
                'amount' => $amount,
                'reference_number' => $refCode ?: ('SMS-'.strtoupper(substr(md5($clean), 0, 8))),
                'payment_method' => $method,
                'raw_text' => $clean,
            ];
        }

        return null;
    }

    /**
     * Parse pledge commitment from natural text (English and Swahili).
     */
    protected function extractPledgeCommitment(string $text): ?float
    {
        $lower = strtolower(trim($text));

        $isPledge = preg_match('/(ahadi|naahidi|pledge|mchango|nitachangia|kuchangia|kiwango)/u', $lower);
        if (! $isPledge) {
            return null;
        }

        // Shorthand: 100k, 50k, 1.5m
        if (preg_match('/([0-9]+(?:\.[0-9]+)?)\s*k\b/i', $lower, $m)) {
            return (float) $m[1] * 1000;
        }
        if (preg_match('/([0-9]+(?:\.[0-9]+)?)\s*m\b/i', $lower, $m)) {
            return (float) $m[1] * 1000000;
        }

        // Swahili word amounts
        if (str_contains($lower, 'laki moja')) {
            return 100000.0;
        }
        if (str_contains($lower, 'laki mbili')) {
            return 200000.0;
        }
        if (str_contains($lower, 'laki tatu')) {
            return 300000.0;
        }
        if (str_contains($lower, 'laki nne')) {
            return 400000.0;
        }
        if (str_contains($lower, 'laki tano')) {
            return 500000.0;
        }
        if (str_contains($lower, 'milioni moja')) {
            return 1000000.0;
        }

        // Standard numerical amount: 100,000 or 50000
        if (preg_match('/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,9})/u', $lower, $m)) {
            $val = (float) str_replace(',', '', $m[1]);
            if ($val >= 1000) {
                return $val;
            }
        }

        return null;
    }

    /**
     * Check if inbound message is a balance inquiry.
     */
    protected function isBalanceInquiry(string $text): bool
    {
        $clean = strtolower(trim($text));

        return (bool) preg_match('/^(salio|balance|ahadi\s*yangu|mchango\s*wangu|hali\s*ya\s*ahadi|angalia\s*ahadi|check\s*pledge|check\s*balance)\b/u', $clean);
    }

    /**
     * Send automated WhatsApp reply to recipient and record message in audit log.
     */
    protected function sendAutomatedReply(string $rawPhone, string $messageText, Guest $guest, string $channel = 'whatsapp'): void
    {
        $cleanPhone = PhoneNormalizer::cleanForApi($rawPhone);
        $gateway = SystemSetting::get('whatsapp_gateway', []);
        $accessToken = $gateway['access_token'] ?? '';
        $phoneNumberId = $gateway['phone_number_id'] ?? '';
        $apiVersion = $gateway['api_version'] ?? 'v20.0';
        if (empty($apiVersion)) {
            $apiVersion = 'v20.0';
        }

        $msgStatus = 'sent';
        $deliveredAt = null;
        $errorSuffix = '';

        if (! empty($accessToken) && ! str_starts_with($accessToken, 'EAAG...kdv_prod_token_live') && ! empty($phoneNumberId)) {
            try {
                $response = Http::withoutVerifying()
                    ->withToken($accessToken)
                    ->timeout(8)
                    ->post("https://graph.facebook.com/{$apiVersion}/{$phoneNumberId}/messages", [
                        'messaging_product' => 'whatsapp',
                        'recipient_type' => 'individual',
                        'to' => $cleanPhone,
                        'type' => 'text',
                        'text' => [
                            'preview_url' => false,
                            'body' => $messageText,
                        ],
                    ]);

                if ($response->successful()) {
                    $msgStatus = 'sent';
                    $deliveredAt = now();
                    Log::info("WhatsApp automated reply sent successfully to {$cleanPhone}");
                } else {
                    $msgStatus = 'failed';
                    $err = $response->json('error.message') ?? (! empty($response->body()) ? $response->body() : ('HTTP '.$response->status()));
                    $errorSuffix = " [Error: {$err}]";
                    Log::warning("WhatsApp automated reply failed for {$cleanPhone}: ".$response->body());
                }
            } catch (\Throwable $e) {
                $msgStatus = 'failed';
                $errorSuffix = ' [Error: '.$e->getMessage().']';
                Log::error('Failed to send WhatsApp automated reply: '.$e->getMessage());
            }
        }

        Message::create([
            'event_id' => $guest->event_id,
            'guest_id' => $guest->id,
            'channel' => $channel,
            'recipient_phone' => $cleanPhone ?: $guest->phone,
            'message_body' => $messageText.$errorSuffix,
            'status' => $msgStatus,
            'sent_at' => now(),
            'delivered_at' => $deliveredAt,
        ]);
    }

    /**
     * Process RSVP state change and send automatic WhatsApp confirmation.
     */
    protected function processGuestRsvp(string $rawPhone, bool $isAttending, ?string $buttonPayload = null)
    {
        $guest = $this->resolveGuestFromInbound($rawPhone, $buttonPayload);

        if (! $guest) {
            $cleanPhone = PhoneNormalizer::cleanForApi($rawPhone);
            Log::warning("WhatsApp RSVP received from unknown number: {$cleanPhone} (Raw: {$rawPhone}, Payload: {$buttonPayload})");

            return;
        }

        $event = $guest->event;
        $eventDateStr = $event->event_date ? $event->event_date->format('D, j M Y') : 'Upcoming';
        $newRsvpStatus = $isAttending ? 'attending' : 'declined';

        $guest->update([
            'rsvp_status' => $newRsvpStatus,
            'rsvp_at' => now(),
        ]);

        $autoReplyConfig = $event->rsvp_auto_reply_config ?? [];
        $autoReplyEnabled = $autoReplyConfig['enabled'] ?? true;

        if (! $autoReplyEnabled) {
            Log::info("WhatsApp RSVP recorded for {$guest->name} (Auto-reply disabled by campaign setting)");

            return;
        }

        if ($isAttending) {
            $customTemplate = ! empty($autoReplyConfig['attending_text'])
                ? $autoReplyConfig['attending_text']
                : 'Thank you {{guest_name}}! Your RSVP has been confirmed for {{event_title}}. We look forward to seeing you on {{event_date}}!';
        } else {
            $customTemplate = ! empty($autoReplyConfig['declined_text'])
                ? $autoReplyConfig['declined_text']
                : 'Thank you {{guest_name}} for letting us know. Your RSVP has been recorded: Will Not Attend.';
        }

        $confirmationText = str_ireplace(
            [
                '{{guest_name}}', '{guest_name}',
                '{{event_title}}', '{event_title}',
                '{{event_date}}', '{event_date}',
                '{{venue}}', '{venue}',
            ],
            [
                $guest->name, $guest->name,
                $event->title, $event->title,
                $eventDateStr, $eventDateStr,
                $event->venue ?? '', $event->venue ?? '',
            ],
            $customTemplate
        );

        $this->sendAutomatedReply($rawPhone, $confirmationText, $guest);
    }
}
