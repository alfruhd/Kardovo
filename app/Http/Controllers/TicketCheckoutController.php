<?php

namespace App\Http\Controllers;

use App\Models\DiscountCode;
use App\Models\Event;
use App\Models\FinancialTransaction;
use App\Models\PaymentLedgerEntry;
use App\Models\Ticket;
use App\Models\TicketOrder;
use App\Models\TicketTier;
use App\Services\PhoneNormalizer;
use App\Services\TicketDeliveryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TicketCheckoutController extends Controller
{
    /**
     * Display public event ticketing page.
     */
    public function showEventTickets(Event $event)
    {
        $event->load(['cardTemplate']);
        $tiers = $event->ticketTiers()
            ->whereIn('status', ['active', 'sold_out'])
            ->orderBy('sort_order')
            ->get();

        $isSoldOut = $tiers->isEmpty() || $tiers->every(fn ($t) => $t->is_sold_out || ! $t->is_available);

        return Inertia::render('Public/EventTickets', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'event_type' => $event->event_type,
                'event_date' => $event->event_date?->format('l, d F Y'),
                'event_time' => $event->event_time,
                'venue' => $event->venue,
                'city' => $event->city,
                'cover_photo' => $event->cover_photo,
                'occasion_type' => $event->occasion_type ?: 'event',
                'description' => $event->description,
                'ticket_instructions' => $event->ticket_instructions,
                'ticket_currency' => $event->ticket_currency ?? 'TZS',
                'ticketing_enabled' => (bool) $event->ticketing_enabled,
                'is_sold_out' => $isSoldOut,
            ],
            'tiers' => $tiers,
        ]);
    }

    /**
     * Process checkout for event tickets.
     */
    public function checkout(Request $request, Event $event)
    {
        if (! $event->ticketing_enabled) {
            return response()->json(['error' => 'Ticketing is not active for this event.'], 422);
        }

        $validated = $request->validate([
            'idempotency_key' => 'nullable|string|max:120',
            'buyer_name' => 'required|string|max:150',
            'buyer_phone' => 'required|string|min:9|max:20',
            'payment_phone' => 'nullable|string|min:9|max:20',
            'carrier' => 'nullable|string|max:50',
            'buyer_email' => 'nullable|email|max:150',
            'payment_method' => 'nullable|string|max:50',
            'discount_code' => 'nullable|string|max:64',
            'sales_channel' => 'nullable|string|max:30',
            'items' => 'required|array|min:1',
            'items.*.tier_id' => 'required|exists:ticket_tiers,id',
            'items.*.quantity' => 'required|integer|min:1|max:20',
            'items.*.attendees' => 'nullable|array',
            'items.*.attendees.*.name' => 'nullable|string|max:150',
        ]);

        $rawIdempotencyKey = $request->header('Idempotency-Key') ?: ($validated['idempotency_key'] ?? null);
        $idempotencyKey = ! empty($rawIdempotencyKey) ? trim((string) $rawIdempotencyKey) : null;

        // Fast-path idempotency check before entering transaction
        if ($idempotencyKey) {
            $existingOrder = TicketOrder::with('tickets')->where('idempotency_key', $idempotencyKey)->first();
            if ($existingOrder) {
                if ((int) $existingOrder->event_id !== (int) $event->id) {
                    return response()->json([
                        'error' => 'Idempotency key has already been used for another event order.',
                    ], 409);
                }

                return $this->buildIdempotentOrderResponse($existingOrder, $event);
            }
        }

        $cleanPhone = PhoneNormalizer::cleanForApi($validated['buyer_phone']);
        $cleanPaymentPhone = ! empty($validated['payment_phone'])
            ? PhoneNormalizer::cleanForApi($validated['payment_phone'])
            : $cleanPhone;

        return DB::transaction(function () use ($event, $validated, $cleanPhone, $cleanPaymentPhone, $idempotencyKey, $request) {
            if ($idempotencyKey) {
                $existingInTx = TicketOrder::with('tickets')
                    ->where('idempotency_key', $idempotencyKey)
                    ->lockForUpdate()
                    ->first();

                if ($existingInTx) {
                    if ((int) $existingInTx->event_id !== (int) $event->id) {
                        return response()->json([
                            'error' => 'Idempotency key has already been used for another event order.',
                        ], 409);
                    }

                    return $this->buildIdempotentOrderResponse($existingInTx, $event);
                }
            }

            $subtotal = 0;
            $ticketsToCreate = [];

            // 1. Verify capacity and calculate subtotal
            foreach ($validated['items'] as $item) {
                $tier = TicketTier::where('id', $item['tier_id'])
                    ->where('event_id', $event->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if (! $tier->is_available) {
                    return response()->json([
                        'error' => "Ticket tier '{$tier->name}' is currently unavailable or sold out.",
                    ], 422);
                }

                $qty = (int) $item['quantity'];
                if ($tier->remaining_count < $qty) {
                    return response()->json([
                        'error' => "Only {$tier->remaining_count} ticket(s) remaining for '{$tier->name}'.",
                    ], 422);
                }

                $tierTotal = (float) $tier->price * $qty;
                $subtotal += $tierTotal;

                // Prepare tickets to create
                for ($i = 0; $i < $qty; $i++) {
                    $attendeeName = $item['attendees'][$i]['name'] ?? null;
                    if (empty($attendeeName)) {
                        $attendeeName = ($qty === 1) ? $validated['buyer_name'] : "{$validated['buyer_name']} (Guest ".($i + 1).')';
                    }

                    $ticketsToCreate[] = [
                        'tier' => $tier,
                        'attendee_name' => $attendeeName,
                        'price' => (float) $tier->price,
                    ];
                }
            }

            // 2. Validate and apply discount code if provided
            $appliedDiscount = null;
            $discountAmount = 0.0;
            if (! empty($validated['discount_code'])) {
                $code = strtoupper(trim($validated['discount_code']));
                $appliedDiscount = DiscountCode::where('event_id', $event->id)
                    ->where('code', $code)
                    ->lockForUpdate()
                    ->first();

                if ($appliedDiscount) {
                    $check = $appliedDiscount->checkValidity((float) $subtotal);
                    if ($check['valid']) {
                        $discountAmount = $appliedDiscount->calculateDiscount((float) $subtotal);
                        $appliedDiscount->increment('used_count');
                    } else {
                        return response()->json([
                            'error' => $check['error'] ?: 'Invalid discount code.',
                        ], 422);
                    }
                } else {
                    return response()->json([
                        'error' => "Discount code '{$code}' not found for this event.",
                    ], 422);
                }
            }

            $finalTotal = max(0, round($subtotal - $discountAmount, 2));

            // 3. Create TicketOrder record
            $paymentMethod = $validated['payment_method'] ?? ($finalTotal <= 0 ? 'Free' : 'M-Pesa');
            $isFree = ($finalTotal <= 0);

            // Platform fee is 6% of final paid total; remaining 94% is organizer net amount
            $platformFeePercent = 6.00;
            $platformFee = $isFree ? 0 : round($finalTotal * ($platformFeePercent / 100), 2);
            $organizerNetAmount = $isFree ? 0 : round($finalTotal - $platformFee, 2);

            $paymentStatus = $isFree ? 'paid' : 'pending';
            $paidAt = $isFree ? now() : null;
            $ticketStatus = $isFree ? 'valid' : 'pending';
            $txStatus = $isFree ? 'completed' : 'pending';

            $order = TicketOrder::create([
                'idempotency_key' => $idempotencyKey,
                'event_id' => $event->id,
                'user_id' => $request->user()?->id,
                'buyer_name' => $validated['buyer_name'],
                'buyer_phone' => $cleanPhone,
                'buyer_email' => $validated['buyer_email'] ?? null,
                'subtotal' => $subtotal,
                'discount_code_id' => $appliedDiscount?->id,
                'discount_amount' => $discountAmount,
                'sales_channel' => $validated['sales_channel'] ?? 'web',
                'platform_fee' => $platformFee,
                'platform_fee_percent' => $platformFeePercent,
                'organizer_net_amount' => $organizerNetAmount,
                'total_amount' => $finalTotal,
                'currency' => $event->ticket_currency ?? 'TZS',
                'payment_method' => $paymentMethod,
                'payment_reference' => 'PAY-'.date('ymd').'-'.strtoupper(bin2hex(random_bytes(3))),
                'payment_status' => $paymentStatus,
                'payout_disbursement_status' => 'pending',
                'paid_at' => $paidAt,
                'metadata' => [
                    'payment_phone' => $cleanPaymentPhone,
                    'carrier' => $validated['carrier'] ?? null,
                    'discount_code' => $appliedDiscount?->code,
                    'discount_amount' => $discountAmount,
                    'platform_fee_percent' => $platformFeePercent,
                    'platform_fee_amount' => $platformFee,
                    'organizer_net_amount' => $organizerNetAmount,
                    'payout_method' => $event->payout_method,
                    'payout_provider' => $event->payout_provider,
                    'payout_account_number' => $event->payout_account_number,
                    'payout_account_name' => $event->payout_account_name,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ],
            ]);

            // 3. Issue individual tickets & update tier sold counts
            $issuedTickets = [];
            foreach ($ticketsToCreate as $item) {
                /** @var TicketTier $tier */
                $tier = $item['tier'];

                $ticket = Ticket::create([
                    'ticket_order_id' => $order->id,
                    'event_id' => $event->id,
                    'ticket_tier_id' => $tier->id,
                    'attendee_name' => $item['attendee_name'],
                    'attendee_phone' => $cleanPhone,
                    'attendee_email' => $validated['buyer_email'] ?? null,
                    'price_paid' => $item['price'],
                    'currency' => $order->currency,
                    'status' => $ticketStatus,
                ]);

                $tier->increment('sold_count');
                $tier->refresh();
                if ($tier->remaining_count <= 0) {
                    $tier->update(['status' => 'sold_out']);
                }

                $issuedTickets[] = $ticket;
            }

            // 4. Record to FinancialTransaction ledger & append immutable PaymentLedgerEntry
            $financialTransaction = null;
            if ((float) $order->total_amount > 0) {
                $financialTransaction = FinancialTransaction::create([
                    'transaction_number' => FinancialTransaction::generateTransactionNumber(),
                    'idempotency_key' => $idempotencyKey,
                    'event_id' => $event->id,
                    'user_id' => $event->user_id,
                    'type' => 'income',
                    'category' => 'pass_sales',
                    'title' => "Ticket Order #{$order->order_number} ({$event->title})",
                    'amount' => $order->total_amount,
                    'currency' => $order->currency,
                    'payment_method' => $paymentMethod,
                    'reference' => $order->payment_reference,
                    'status' => $txStatus,
                    'transaction_date' => now(),
                ]);
            }

            // Always write the initial payment intent to the append-only ledger before any gateway call
            PaymentLedgerEntry::appendEntry([
                'ticket_order_id' => $order->id,
                'financial_transaction_id' => $financialTransaction?->id,
                'event_id' => $event->id,
                'idempotency_key' => $idempotencyKey,
                'provider_event_id' => 'intent:'.$order->order_number,
                'state' => PaymentLedgerEntry::STATE_INTENT_CREATED,
                'amount' => $order->total_amount,
                'currency' => $order->currency,
                'payment_method' => $paymentMethod,
                'gateway_reference' => $order->payment_reference,
                'metadata' => [
                    'order_number' => $order->order_number,
                    'buyer_phone' => $cleanPhone,
                    'payment_phone' => $cleanPaymentPhone,
                    'tickets_count' => count($issuedTickets),
                ],
            ]);

            if ($isFree) {
                PaymentLedgerEntry::appendEntry([
                    'ticket_order_id' => $order->id,
                    'financial_transaction_id' => $financialTransaction?->id,
                    'event_id' => $event->id,
                    'idempotency_key' => $idempotencyKey,
                    'provider_event_id' => 'capture:free:'.$order->order_number,
                    'state' => PaymentLedgerEntry::STATE_CAPTURED,
                    'amount' => 0,
                    'currency' => $order->currency,
                    'payment_method' => $paymentMethod,
                    'gateway_reference' => $order->payment_reference,
                    'metadata' => [
                        'order_number' => $order->order_number,
                        'reason' => 'Complimentary / 100% discounted checkout',
                    ],
                ]);
            }

            // 5. Automated dispatches (WhatsApp / SMS / Email) ONLY if payment is already confirmed
            if ($order->isPaid() && ! empty($issuedTickets)) {
                $primaryTicket = $issuedTickets[0];
                try {
                    TicketDeliveryService::sendWhatsApp($primaryTicket, $cleanPhone);
                    TicketDeliveryService::sendSms($primaryTicket, $cleanPhone);
                    if (! empty($validated['buyer_email'])) {
                        TicketDeliveryService::sendEmail($primaryTicket, $validated['buyer_email']);
                    }
                } catch (\Throwable $e) {
                    // Suppress messaging errors so checkout succeeds
                }
            }

            $primaryTicketNumber = $issuedTickets[0]->ticket_number ?? null;
            $packageSummary = collect($ticketsToCreate)->pluck('tier.name')->unique()->implode(', ');

            $responsePayload = [
                'success' => true,
                'idempotency_key' => $idempotencyKey,
                'idempotent_replay' => false,
                'order_number' => $order->order_number,
                'booking_ref' => $order->order_number,
                'event_title' => $event->title,
                'package_name' => $packageSummary ?: 'Standard Tickets',
                'quantity' => count($issuedTickets),
                'service_fee' => 0,
                'subtotal' => $order->subtotal,
                'discount_amount' => $order->discount_amount,
                'total_amount' => $order->total_amount,
                'currency' => $order->currency,
                'status' => $order->isPaid() ? 'CONFIRMED' : 'PENDING',
                'payment_status' => $order->payment_status,
                'is_paid' => $order->isPaid(),
                'tickets_count' => count($issuedTickets),
                'primary_ticket_number' => $primaryTicketNumber,
                'payment_phone' => $cleanPaymentPhone,
                'redirect_url' => count($issuedTickets) === 1
                    ? url("/t/{$primaryTicketNumber}")
                    : url("/tickets/order/{$order->order_number}"),
            ];

            $order->update(['cached_response' => $responsePayload]);

            return response()->json($responsePayload);
        });
    }

    /**
     * Return cached or reconstructed response for an idempotent checkout replay.
     */
    protected function buildIdempotentOrderResponse(TicketOrder $order, Event $event)
    {
        $cached = is_array($order->cached_response) ? $order->cached_response : [];
        $primaryTicket = $order->tickets->first();
        $ticketsCount = $order->tickets->count();

        $payload = array_merge($cached, [
            'success' => true,
            'idempotency_key' => $order->idempotency_key,
            'idempotent_replay' => true,
            'order_number' => $order->order_number,
            'booking_ref' => $order->order_number,
            'event_title' => $cached['event_title'] ?? $event->title,
            'package_name' => $cached['package_name'] ?? 'Standard Tickets',
            'quantity' => $ticketsCount,
            'service_fee' => 0,
            'subtotal' => $order->subtotal,
            'discount_amount' => $order->discount_amount,
            'total_amount' => $order->total_amount,
            'currency' => $order->currency,
            'status' => $order->isPaid() ? 'CONFIRMED' : 'PENDING',
            'payment_status' => $order->payment_status,
            'is_paid' => $order->isPaid(),
            'tickets_count' => $ticketsCount,
            'primary_ticket_number' => $primaryTicket?->ticket_number,
            'payment_phone' => $order->metadata['payment_phone'] ?? $order->buyer_phone,
            'redirect_url' => $ticketsCount === 1
                ? url("/t/{$primaryTicket?->ticket_number}")
                : url("/tickets/order/{$order->order_number}"),
        ]);

        return response()->json($payload);
    }

    /**
     * Live validate discount code and calculate discount preview before checkout.
     */
    public function validateDiscount(Request $request, Event $event)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:64',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $code = strtoupper(trim($validated['code']));
        $discount = DiscountCode::where('event_id', $event->id)
            ->where('code', $code)
            ->first();

        if (! $discount) {
            return response()->json([
                'valid' => false,
                'message' => "Discount code '{$code}' was not found for this event.",
            ], 404);
        }

        $check = $discount->checkValidity((float) $validated['subtotal']);
        if (! $check['valid']) {
            return response()->json([
                'valid' => false,
                'message' => $check['error'],
            ], 422);
        }

        $discountAmount = $discount->calculateDiscount((float) $validated['subtotal']);
        $newTotal = max(0, round((float) $validated['subtotal'] - $discountAmount, 2));

        return response()->json([
            'valid' => true,
            'code' => $discount->code,
            'discount_type' => $discount->discount_type,
            'discount_value' => (float) $discount->discount_value,
            'discount_amount' => $discountAmount,
            'formatted_discount' => $discount->formatted_discount,
            'new_total' => $newTotal,
            'message' => "Discount code '{$discount->code}' applied ({$discount->formatted_discount})!",
        ]);
    }

    /**
     * Show order success page displaying all purchased tickets.
     */
    public function orderSuccess(string $orderNumber)
    {
        $order = TicketOrder::with(['event', 'tickets.ticketTier'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return Inertia::render('Public/TicketOrderSuccess', [
            'order' => $order,
            'event' => $order->event,
            'tickets' => $order->isPaid() ? $order->tickets : [],
            'is_paid' => $order->isPaid(),
        ]);
    }

    /**
     * Check real-time payment status of an order.
     */
    public function checkOrderStatus(string $orderNumber)
    {
        $order = TicketOrder::with(['tickets', 'event'])->where('order_number', $orderNumber)->firstOrFail();
        $isPaid = $order->isPaid();
        $primaryTicket = $order->tickets->first();

        return response()->json([
            'order_number' => $order->order_number,
            'payment_status' => $order->payment_status,
            'is_paid' => $isPaid,
            'status' => $isPaid ? 'CONFIRMED' : strtoupper($order->payment_status),
            'tickets_count' => $order->tickets->count(),
            'primary_ticket_number' => $primaryTicket?->ticket_number,
            'redirect_url' => $order->tickets->count() === 1
                ? url("/t/{$primaryTicket?->ticket_number}")
                : url("/tickets/order/{$order->order_number}"),
        ]);
    }

    /**
     * Verify / confirm payment for a ticket order.
     */
    public function verifyPayment(Request $request, string $orderNumber)
    {
        return DB::transaction(function () use ($request, $orderNumber) {
            $order = TicketOrder::with(['tickets', 'event'])
                ->where('order_number', $orderNumber)
                ->lockForUpdate()
                ->firstOrFail();

            if ($order->isPaid()) {
                $primaryTicket = $order->tickets->first();

                return response()->json([
                    'success' => true,
                    'is_paid' => true,
                    'payment_status' => 'paid',
                    'status' => 'CONFIRMED',
                    'message' => 'Payment has already been confirmed and verified.',
                    'primary_ticket_number' => $primaryTicket?->ticket_number,
                    'redirect_url' => $order->tickets->count() === 1
                        ? url("/t/{$primaryTicket?->ticket_number}")
                        : url("/tickets/order/{$order->order_number}"),
                ]);
            }

            $order->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);

            $order->tickets()->where('status', '!=', 'cancelled')->update(['status' => 'valid']);

            // Update associated financial transaction if pending
            $financialTransaction = FinancialTransaction::where('reference', $order->payment_reference)
                ->orWhere('title', 'like', "%{$order->order_number}%")
                ->first();

            if ($financialTransaction) {
                $financialTransaction->update(['status' => 'completed']);
            }

            $providerEventId = $request->input('provider_event_id') ?: ('capture:'.$order->order_number);

            PaymentLedgerEntry::appendEntry([
                'ticket_order_id' => $order->id,
                'financial_transaction_id' => $financialTransaction?->id,
                'event_id' => $order->event_id,
                'idempotency_key' => $order->idempotency_key,
                'provider_event_id' => $providerEventId,
                'state' => PaymentLedgerEntry::STATE_CAPTURED,
                'amount' => $order->total_amount,
                'currency' => $order->currency,
                'payment_method' => $order->payment_method,
                'gateway_reference' => $request->input('gateway_reference') ?: $order->payment_reference,
                'metadata' => [
                    'order_number' => $order->order_number,
                    'verified_via' => 'verify_payment_endpoint',
                    'ip' => $request->ip(),
                ],
            ]);

            // Dispatch ticket deliveries now that payment is verified
            $primaryTicket = $order->tickets->first();
            if ($primaryTicket && ! empty($order->buyer_phone)) {
                try {
                    TicketDeliveryService::sendWhatsApp($primaryTicket, $order->buyer_phone);
                    TicketDeliveryService::sendSms($primaryTicket, $order->buyer_phone);
                    if (! empty($order->buyer_email)) {
                        TicketDeliveryService::sendEmail($primaryTicket, $order->buyer_email);
                    }
                } catch (\Throwable $e) {
                }
            }

            return response()->json([
                'success' => true,
                'is_paid' => true,
                'payment_status' => 'paid',
                'status' => 'CONFIRMED',
                'message' => 'Payment verified successfully! Your digital passes are unlocked.',
                'primary_ticket_number' => $primaryTicket?->ticket_number,
                'redirect_url' => $order->tickets->count() === 1
                    ? url("/t/{$primaryTicket?->ticket_number}")
                    : url("/tickets/order/{$order->order_number}"),
            ]);
        });
    }
}
