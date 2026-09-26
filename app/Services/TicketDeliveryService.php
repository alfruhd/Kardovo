<?php

namespace App\Services;

use App\Models\SystemSetting;
use App\Models\Ticket;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class TicketDeliveryService
{
    /**
     * Dispatch ticket link via WhatsApp.
     */
    public static function sendWhatsApp(Ticket $ticket, ?string $targetPhone = null): array
    {
        $phone = $targetPhone ?: $ticket->attendee_phone;
        if (empty($phone)) {
            return ['success' => false, 'error' => 'No phone number provided for attendee.'];
        }

        $cleanPhone = PhoneNormalizer::cleanForApi($phone);
        $event = $ticket->event;
        $tier = $ticket->ticketTier;
        $passUrl = $ticket->pass_url;

        $messageText = "🎟️ *Your Ticket for {$event->title} is Ready!*\n\n"
            ."*Attendee:* {$ticket->attendee_name}\n"
            ."*Ticket Tier:* {$tier->name}\n"
            ."*Ticket Code:* {$ticket->ticket_number}\n"
            ."*Date & Time:* {$event->event_date?->format('d M Y')}".($event->event_time ? " at {$event->event_time}" : '')."\n"
            ."*Venue:* {$event->venue}, {$event->city}\n\n"
            ."👉 *View & Present Your Gate Pass:*\n{$passUrl}\n\n"
            .'_Please show the QR code on this link at the gate for rapid check-in._';

        $gateway = SystemSetting::get('whatsapp_gateway', []);
        $endpoint = $gateway['api_endpoint'] ?? 'https://graph.facebook.com/v21.0/messages';
        $accessToken = $gateway['access_token'] ?? '';
        $phoneNumberId = $gateway['phone_number_id'] ?? '';

        Log::info("WhatsApp ticket dispatch to {$cleanPhone} for {$ticket->ticket_number}");

        if (app()->environment('testing', 'local') || empty($accessToken) || str_contains($accessToken, 'token')) {
            self::recordDeliveryChannel($ticket, 'whatsapp');

            return [
                'success' => true,
                'simulated' => true,
                'recipient' => $cleanPhone,
                'message' => $messageText,
            ];
        }

        try {
            $targetUrl = str_contains($endpoint, '{phone_number_id}')
                ? str_replace('{phone_number_id}', $phoneNumberId, $endpoint)
                : (rtrim($endpoint, '/')."/{$phoneNumberId}/messages");

            $response = Http::withToken($accessToken)
                ->post($targetUrl, [
                    'messaging_product' => 'whatsapp',
                    'recipient_type' => 'individual',
                    'to' => $cleanPhone,
                    'type' => 'text',
                    'text' => ['body' => $messageText],
                ]);

            if ($response->successful()) {
                self::recordDeliveryChannel($ticket, 'whatsapp');

                return ['success' => true, 'response' => $response->json()];
            }

            return ['success' => false, 'error' => $response->body()];
        } catch (\Throwable $e) {
            Log::error("WhatsApp ticket dispatch failed: {$e->getMessage()}");

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Dispatch ticket short link via SMS.
     */
    public static function sendSms(Ticket $ticket, ?string $targetPhone = null): array
    {
        $phone = $targetPhone ?: $ticket->attendee_phone;
        if (empty($phone)) {
            return ['success' => false, 'error' => 'No phone number provided for attendee.'];
        }

        $event = $ticket->event;
        $tier = $ticket->ticketTier;
        $passUrl = $ticket->pass_url;

        $smsText = "Ticket for {$event->title}: {$ticket->attendee_name} ({$tier->name}). Pass & Gate QR: {$passUrl}";

        $res = SmsService::send($phone, $smsText);
        if ($res['success']) {
            self::recordDeliveryChannel($ticket, 'sms');
        }

        return $res;
    }

    /**
     * Dispatch ticket confirmation via Email with PDF attachment.
     */
    public static function sendEmail(Ticket $ticket, ?string $targetEmail = null): array
    {
        $email = $targetEmail ?: $ticket->attendee_email;
        if (empty($email)) {
            return ['success' => false, 'error' => 'No email address provided for attendee.'];
        }

        $event = $ticket->event;
        $tier = $ticket->ticketTier;
        $qrDataUri = QRCodeGenerator::renderToBase64Png($ticket->qr_token, 260);
        $pdfContent = self::generatePdf($ticket)->output();

        try {
            Mail::send([], [], function ($message) use ($email, $event, $ticket, $tier, $qrDataUri, $pdfContent) {
                $message->to($email, $ticket->attendee_name)
                    ->subject("Your Ticket for {$event->title} (#{$ticket->ticket_number})")
                    ->html(view('emails.ticket_confirmation', [
                        'ticket' => $ticket,
                        'event' => $event,
                        'tier' => $tier,
                        'qrDataUri' => $qrDataUri,
                    ])->render())
                    ->attachData($pdfContent, "Ticket-{$ticket->ticket_number}.pdf", [
                        'mime' => 'application/pdf',
                    ]);
            });

            self::recordDeliveryChannel($ticket, 'email');

            return ['success' => true];
        } catch (\Throwable $e) {
            Log::error("Email ticket dispatch failed: {$e->getMessage()}");

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Generate printable PDF voucher for ticket.
     */
    public static function generatePdf(Ticket $ticket)
    {
        $event = $ticket->event;
        $tier = $ticket->ticketTier;
        $qrDataUri = QRCodeGenerator::renderToBase64Png($ticket->qr_token, 300);

        return Pdf::loadView('pdf.ticket', [
            'ticket' => $ticket,
            'event' => $event,
            'tier' => $tier,
            'qrDataUri' => $qrDataUri,
        ])->setPaper('a5', 'landscape');
    }

    protected static function recordDeliveryChannel(Ticket $ticket, string $channel): void
    {
        $channels = $ticket->delivery_channels ?? [];
        $channels[$channel] = now()->toDateTimeString();
        $ticket->delivery_channels = $channels;
        $ticket->saveQuietly();
    }
}
