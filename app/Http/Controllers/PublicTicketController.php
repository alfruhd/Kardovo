<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Services\QRCodeGenerator;
use App\Services\TicketDeliveryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicTicketController extends Controller
{
    /**
     * Display the Live Digital Pass Hub for an individual ticket.
     */
    public function show(string $ticketNumber)
    {
        $ticket = Ticket::with(['event', 'ticketTier', 'ticketOrder.tickets.ticketTier'])
            ->where('ticket_number', $ticketNumber)
            ->orWhere('unique_code', $ticketNumber)
            ->orWhere('qr_token', $ticketNumber)
            ->firstOrFail();

        // Enforce payment integrity: digital pass and QR code cannot be viewed until payment is verified
        if (! $ticket->isPaid()) {
            $order = $ticket->ticketOrder;
            $event = $ticket->event;
            $tier = $ticket->ticketTier;

            return Inertia::render('Public/TicketPaymentPending', [
                'ticket' => [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'attendee_name' => $ticket->attendee_name,
                    'price_paid' => (float) $ticket->price_paid,
                    'formatted_price' => $ticket->formatted_price,
                    'currency' => $ticket->currency,
                    'status' => $ticket->status,
                    'order_number' => $order?->order_number,
                    'tier_name' => $tier?->name,
                ],
                'order' => $order ? [
                    'order_number' => $order->order_number,
                    'buyer_name' => $order->buyer_name,
                    'buyer_phone' => ! empty($order->buyer_phone) ? (substr($order->buyer_phone, 0, 4).'••••'.substr($order->buyer_phone, -3)) : null,
                    'total_amount' => (float) $order->total_amount,
                    'formatted_total' => $order->formatted_total,
                    'currency' => $order->currency,
                    'payment_method' => $order->payment_method,
                    'payment_status' => $order->payment_status,
                    'payment_reference' => $order->payment_reference,
                ] : null,
                'event' => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'event_type' => $event->event_type,
                    'event_date' => $event->event_date?->format('l, d F Y'),
                    'event_time' => $event->event_time,
                    'venue' => $event->venue,
                    'city' => $event->city,
                    'cover_photo' => $event->cover_photo,
                ],
                'tier' => [
                    'id' => $tier?->id,
                    'name' => $tier?->name,
                    'description' => $tier?->description,
                    'color' => $tier?->color,
                ],
            ]);
        }

        $event = $ticket->event;
        $tier = $ticket->ticketTier;

        // Render QR data URI
        $qrDataUri = QRCodeGenerator::renderToBase64Png($ticket->qr_token, 320);

        // Fetch sibling tickets from the same order for easy group navigation
        $siblingTickets = $ticket->ticketOrder?->tickets
            ? $ticket->ticketOrder->tickets->map(function ($t) use ($ticket, $qrDataUri) {
                return [
                    'id' => $t->id,
                    'ticket_number' => $t->ticket_number,
                    'unique_code' => $t->unique_code,
                    'qr_token' => $t->qr_token,
                    'qr_data_uri' => $t->id === $ticket->id ? $qrDataUri : QRCodeGenerator::renderToBase64Png($t->qr_token, 320),
                    'attendee_name' => $t->attendee_name,
                    'attendee_phone' => ! empty($t->attendee_phone) ? (substr($t->attendee_phone, 0, 4).'••••'.substr($t->attendee_phone, -3)) : null,
                    'attendee_email' => ! empty($t->attendee_email) ? (substr($t->attendee_email, 0, 2).'••••@'.explode('@', $t->attendee_email)[1] ?? '•••') : null,
                    'price_paid' => (float) $t->price_paid,
                    'formatted_price' => $t->formatted_price,
                    'currency' => $t->currency,
                    'status' => $t->status,
                    'is_checked_in' => $t->is_checked_in,
                    'checked_in_at' => $t->checked_in_at?->format('h:i A - d M Y'),
                    'gate_label' => $t->gate_label,
                    'pass_url' => $t->pass_url,
                    'order_number' => $t->ticketOrder?->order_number,
                    'tier_name' => $t->ticketTier?->name,
                    'tier' => [
                        'id' => $t->ticketTier?->id,
                        'name' => $t->ticketTier?->name,
                        'description' => $t->ticketTier?->description,
                        'color' => $t->ticketTier?->color,
                    ],
                ];
            })->values()
            : [];

        return Inertia::render('Public/DigitalTicketPass', [
            'ticket' => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'unique_code' => $ticket->unique_code,
                'qr_token' => $ticket->qr_token,
                'attendee_name' => $ticket->attendee_name,
                'attendee_phone' => ! empty($ticket->attendee_phone) ? (substr($ticket->attendee_phone, 0, 4).'••••'.substr($ticket->attendee_phone, -3)) : null,
                'attendee_email' => ! empty($ticket->attendee_email) ? (substr($ticket->attendee_email, 0, 2).'••••@'.explode('@', $ticket->attendee_email)[1] ?? '•••') : null,
                'price_paid' => (float) $ticket->price_paid,
                'formatted_price' => $ticket->formatted_price,
                'currency' => $ticket->currency,
                'status' => $ticket->status,
                'is_checked_in' => $ticket->is_checked_in,
                'checked_in_at' => $ticket->checked_in_at?->format('h:i A - d M Y'),
                'gate_label' => $ticket->gate_label,
                'pass_url' => $ticket->pass_url,
                'order_number' => $ticket->ticketOrder?->order_number,
            ],
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'event_type' => $event->event_type,
                'event_date' => $event->event_date?->format('l, d F Y'),
                'event_time' => $event->event_time,
                'venue' => $event->venue,
                'city' => $event->city,
                'cover_photo' => $event->cover_photo,
                'description' => $event->description,
                'ticket_instructions' => $event->ticket_instructions,
                'ticket_template_config' => $event->ticket_template_config ?? [
                    'accent_color' => '#FABF24',
                    'right_bg_color' => '#FFFFFF',
                    'right_overlay' => 'none',
                    'left_design_mode' => 'default',
                    'left_bg_color' => '#241645',
                    'left_bg_image' => null,
                    'badge_text' => null,
                    'show_confetti' => true,
                    'show_barcode' => true,
                ],
            ],
            'tier' => [
                'id' => $tier->id,
                'name' => $tier->name,
                'description' => $tier->description,
                'color' => $tier->color,
            ],
            'qrDataUri' => $qrDataUri,
            'siblingTickets' => $siblingTickets,
        ]);
    }

    /**
     * Download the official printable PDF voucher.
     */
    public function downloadPdf(string $ticketNumber)
    {
        $ticket = Ticket::with(['event', 'ticketTier', 'ticketOrder'])
            ->where('ticket_number', $ticketNumber)
            ->firstOrFail();

        if (! $ticket->isPaid()) {
            abort(403, 'Ticket voucher cannot be downloaded until payment is confirmed and verified.');
        }

        $pdf = TicketDeliveryService::generatePdf($ticket);

        return $pdf->download("Ticket-{$ticket->ticket_number}.pdf");
    }

    /**
     * Send or re-send ticket via WhatsApp.
     */
    public function sendWhatsApp(Request $request, string $ticketNumber)
    {
        $ticket = Ticket::with(['event', 'ticketTier', 'ticketOrder'])
            ->where('ticket_number', $ticketNumber)
            ->firstOrFail();

        if (! $ticket->isPaid()) {
            return response()->json(['error' => 'Ticket cannot be sent until payment is confirmed and verified.'], 403);
        }

        $targetPhone = $ticket->attendee_phone;
        if (empty($targetPhone)) {
            return response()->json(['error' => 'No phone number registered for this ticket attendee.'], 422);
        }

        $result = TicketDeliveryService::sendWhatsApp($ticket, $targetPhone);

        if ($result['success']) {
            return response()->json(['success' => true, 'message' => 'Ticket sent to WhatsApp successfully!']);
        }

        return response()->json(['error' => $result['error'] ?? 'Failed to send WhatsApp message.'], 500);
    }

    /**
     * Send or re-send ticket via SMS.
     */
    public function sendSms(Request $request, string $ticketNumber)
    {
        $ticket = Ticket::with(['event', 'ticketTier', 'ticketOrder'])
            ->where('ticket_number', $ticketNumber)
            ->firstOrFail();

        if (! $ticket->isPaid()) {
            return response()->json(['error' => 'Ticket cannot be sent until payment is confirmed and verified.'], 403);
        }

        $targetPhone = $ticket->attendee_phone;
        if (empty($targetPhone)) {
            return response()->json(['error' => 'No phone number registered for this ticket attendee.'], 422);
        }

        $result = TicketDeliveryService::sendSms($ticket, $targetPhone);

        if ($result['success']) {
            return response()->json(['success' => true, 'message' => 'Ticket sent via SMS successfully!']);
        }

        return response()->json(['error' => $result['error'] ?? 'Failed to send SMS.'], 500);
    }

    /**
     * Send or re-send ticket via Email.
     */
    public function sendEmail(Request $request, string $ticketNumber)
    {
        $ticket = Ticket::with(['event', 'ticketTier', 'ticketOrder'])
            ->where('ticket_number', $ticketNumber)
            ->firstOrFail();

        if (! $ticket->isPaid()) {
            return response()->json(['error' => 'Ticket cannot be sent until payment is confirmed and verified.'], 403);
        }

        $targetEmail = $ticket->attendee_email;
        if (empty($targetEmail)) {
            return response()->json(['error' => 'No email address registered for this ticket attendee.'], 422);
        }

        $result = TicketDeliveryService::sendEmail($ticket, $targetEmail);

        if ($result['success']) {
            return response()->json(['success' => true, 'message' => 'Ticket voucher emailed successfully!']);
        }

        return response()->json(['error' => $result['error'] ?? 'Failed to email ticket.'], 500);
    }
}
