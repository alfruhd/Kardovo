<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\Guest;
use App\Models\Message;
use App\Models\SystemSetting;
use App\Services\PhoneNormalizer;

class WhatsAppWebhookController extends Controller
{
    /**
     * Meta WhatsApp Webhook Verification (GET request)
     */
    public function verify(Request $request)
    {
        $gateway = SystemSetting::get('whatsapp_gateway', []);
        $configuredVerifyToken = $gateway['verify_token'] ?? 'kardovo_verify_token_2026';

        $mode = $request->input('hub_mode', $request->input('hub.mode'));
        $token = $request->input('hub_verify_token', $request->input('hub.verify_token'));
        $challenge = $request->input('hub_challenge', $request->input('hub.challenge'));

        if ($mode === 'subscribe' && $token === $configuredVerifyToken) {
            return response($challenge, 200);
        }

        return response('Forbidden', 403);
    }

    /**
     * Inbound WhatsApp Webhook Handler (POST request)
     * Automatically handles 1-Tap RSVP Button Replies & text responses from guests.
     */
    public function handle(Request $request)
    {
        $payload = $request->all();
        Log::info('WhatsApp Webhook Inbound:', ['payload' => $payload]);

        // 1. Check for Meta Cloud API Format
        $entry = $payload['entry'][0] ?? null;
        $change = $entry['changes'][0]['value'] ?? null;
        $messages = $change['messages'] ?? [];

        if (!empty($messages)) {
            foreach ($messages as $msg) {
                $fromPhone = $msg['from'] ?? '';
                $msgType = $msg['type'] ?? '';

                $replyText = '';
                $isAttending = false;
                $isDeclined = false;

                if ($msgType === 'button' || $msgType === 'interactive') {
                    $buttonPayload = $msg['button']['payload'] ?? $msg['interactive']['button_reply']['id'] ?? '';
                    $buttonTitle = $msg['button']['text'] ?? $msg['interactive']['button_reply']['title'] ?? '';
                    
                    $normalizedButton = strtolower($buttonPayload . ' ' . $buttonTitle);
                    if (str_contains($normalizedButton, 'attend') || str_contains($normalizedButton, 'will_attend') || str_contains($normalizedButton, 'yes') || str_contains($normalizedButton, 'ndio')) {
                        $isAttending = true;
                    } elseif (str_contains($normalizedButton, 'decline') || str_contains($normalizedButton, 'cannot') || str_contains($normalizedButton, 'no') || str_contains($normalizedButton, 'hapana')) {
                        $isDeclined = true;
                    }
                } elseif ($msgType === 'text') {
                    $body = strtolower(trim($msg['text']['body'] ?? ''));
                    if (in_array($body, ['1', 'yes', 'ndio', 'attend', 'will attend', 'i will attend', 'confirmed', 'accept'])) {
                        $isAttending = true;
                    } elseif (in_array($body, ['2', 'no', 'hapana', 'cannot attend', 'decline', 'declined', 'reject'])) {
                        $isDeclined = true;
                    }
                }

                if ($fromPhone && ($isAttending || $isDeclined)) {
                    $this->processGuestRsvp($fromPhone, $isAttending);
                }
            }
        }

        // 2. Check for UltraMsg / NextSMS / Custom Webhook format
        if (isset($payload['data']) && isset($payload['event_type'])) {
            $data = $payload['data'];
            $fromPhone = $data['from'] ?? '';
            $body = strtolower(trim($data['body'] ?? ''));

            $isAttending = in_array($body, ['1', 'yes', 'ndio', 'attend', 'will attend', 'i will attend']);
            $isDeclined = in_array($body, ['2', 'no', 'hapana', 'cannot attend', 'decline', 'declined']);

            if ($fromPhone && ($isAttending || $isDeclined)) {
                $this->processGuestRsvp($fromPhone, $isAttending);
            }
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Process RSVP state change and send automatic WhatsApp confirmation.
     */
    protected function processGuestRsvp(string $rawPhone, bool $isAttending)
    {
        $cleanPhone = PhoneNormalizer::cleanForApi($rawPhone);

        // Find matching guest
        $guest = Guest::where(function ($q) use ($cleanPhone, $rawPhone) {
            $q->where('phone', 'like', "%{$cleanPhone}%")
              ->orWhere('phone', 'like', "%{$rawPhone}%");
        })->latest()->first();

        if (!$guest) {
            Log::warning("WhatsApp RSVP received from unknown number: {$cleanPhone}");
            return;
        }

        $event = $guest->event;
        $eventDateStr = $event->event_date ? $event->event_date->format('D, j M Y') : 'Upcoming';
        $newRsvpStatus = $isAttending ? 'attending' : 'declined';

        $guest->update([
            'rsvp_status' => $newRsvpStatus,
        ]);

        $autoReplyConfig = $event->rsvp_auto_reply_config ?? [];
        $autoReplyEnabled = $autoReplyConfig['enabled'] ?? true;

        // If auto-reply is disabled by the organizer, do not send confirmation message
        if (!$autoReplyEnabled) {
            Log::info("WhatsApp RSVP recorded for {$guest->name} (Auto-reply disabled by campaign setting)");
            return;
        }

        if ($isAttending) {
            $customTemplate = !empty($autoReplyConfig['attending_text']) 
                ? $autoReplyConfig['attending_text'] 
                : "Thank you {{guest_name}}! Your RSVP has been confirmed for {{event_title}}. We look forward to seeing you on {{event_date}}!";
        } else {
            $customTemplate = !empty($autoReplyConfig['declined_text']) 
                ? $autoReplyConfig['declined_text'] 
                : "Thank you {{guest_name}} for letting us know. Your RSVP has been recorded: Will Not Attend.";
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

        // Log confirmation reply message in Kardovo audit logs
        Message::create([
            'event_id' => $event->id,
            'guest_id' => $guest->id,
            'channel' => 'whatsapp',
            'recipient_phone' => $cleanPhone,
            'message_body' => $confirmationText,
            'status' => 'delivered',
            'sent_at' => now(),
            'delivered_at' => now(),
        ]);

        // If active Meta WhatsApp Cloud API credentials are configured, dispatch the live auto-reply
        $gateway = SystemSetting::get('whatsapp_gateway', []);
        $accessToken = $gateway['access_token'] ?? '';
        $phoneNumberId = $gateway['phone_number_id'] ?? '';

        if (!empty($accessToken) && !str_starts_with($accessToken, 'EAAG...kdv_prod_token_live') && !empty($phoneNumberId)) {
            try {
                Http::withToken($accessToken)
                    ->post("https://graph.facebook.com/v20.0/{$phoneNumberId}/messages", [
                        'messaging_product' => 'whatsapp',
                        'recipient_type' => 'individual',
                        'to' => $cleanPhone,
                        'type' => 'text',
                        'text' => [
                            'preview_url' => false,
                            'body' => $confirmationText,
                        ],
                    ]);
            } catch (\Throwable $e) {
                Log::error("Failed to send WhatsApp auto-confirmation reply: " . $e->getMessage());
            }
        }
    }
}
