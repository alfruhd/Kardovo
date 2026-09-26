<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\FinancialTransaction;
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
            'buyer_name' => 'required|string|max:150',
            'buyer_phone' => 'required|string|min:9|max:20',
            'payment_phone' => 'nullable|string|min:9|max:20',
            'carrier' => 'nullable|string|max:50',
            'buyer_email' => 'nullable|email|max:150',
            'payment_method' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.tier_id' => 'required|exists:ticket_tiers,id',
            'items.*.quantity' => 'required|integer|min:1|max:20',
            'items.*.attendees' => 'nullable|array',
            'items.*.attendees.*.name' => 'nullable|string|max:150',
        ]);

        $cleanPhone = PhoneNormalizer::cleanForApi($validated['buyer_phone']);
        $cleanPaymentPhone = ! empty($validated['payment_phone'])
            ? PhoneNormalizer::cleanForApi($validated['payment_phone'])
            : $cleanPhone;

        return DB::transaction(function () use ($event, $validated, $cleanPhone, $cleanPaymentPhone, $request) {
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

            // 2. Create TicketOrder record
            $paymentMethod = $validated['payment_method'] ?? ($subtotal <= 0 ? 'Free' : 'M-Pesa');
            $isFree = ($subtotal <= 0);

            $order = TicketOrder::create([
                'event_id' => $event->id,
                'user_id' => $request->user()?->id,
                'buyer_name' => $validated['buyer_name'],
                'buyer_phone' => $cleanPhone,
                'buyer_email' => $validated['buyer_email'] ?? null,
                'subtotal' => $subtotal,
                'platform_fee' => 0,
                'total_amount' => $subtotal,
                'currency' => $event->ticket_currency ?? 'TZS',
                'payment_method' => $paymentMethod,
                'payment_reference' => 'PAY-'.date('ymd').'-'.strtoupper(bin2hex(random_bytes(3))),
                'payment_status' => 'paid', // Auto-fulfill checkout
                'paid_at' => now(),
                'metadata' => [
                    'payment_phone' => $cleanPaymentPhone,
                    'carrier' => $validated['carrier'] ?? null,
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
                    'status' => 'valid',
                ]);

                $tier->increment('sold_count');
                $tier->refresh();
                if ($tier->remaining_count <= 0) {
                    $tier->update(['status' => 'sold_out']);
                }

                $issuedTickets[] = $ticket;
            }

            // 4. Record to FinancialTransaction ledger if paid
            if ($subtotal > 0) {
                FinancialTransaction::create([
                    'transaction_number' => FinancialTransaction::generateTransactionNumber(),
                    'event_id' => $event->id,
                    'user_id' => $event->user_id,
                    'type' => 'income',
                    'category' => 'pass_sales',
                    'title' => "Ticket Order #{$order->order_number} ({$event->title})",
                    'amount' => $subtotal,
                    'currency' => $order->currency,
                    'payment_method' => $paymentMethod,
                    'reference' => $order->payment_reference,
                    'status' => 'completed',
                    'transaction_date' => now(),
                ]);
            }

            // 5. Automated dispatches (WhatsApp / SMS / Email) for first ticket
            if (! empty($issuedTickets)) {
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

            return response()->json([
                'success' => true,
                'order_number' => $order->order_number,
                'booking_ref' => $order->order_number,
                'event_title' => $event->title,
                'package_name' => $packageSummary ?: 'Standard Tickets',
                'quantity' => count($issuedTickets),
                'service_fee' => 0,
                'total_amount' => $order->total_amount,
                'currency' => $order->currency,
                'status' => 'PENDING',
                'tickets_count' => count($issuedTickets),
                'primary_ticket_number' => $primaryTicketNumber,
                'redirect_url' => count($issuedTickets) === 1
                    ? url("/t/{$primaryTicketNumber}")
                    : url("/tickets/order/{$order->order_number}"),
            ]);
        });
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
            'tickets' => $order->tickets,
        ]);
    }
}
