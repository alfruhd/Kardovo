<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Message;
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
            Log::info("Inbound message from {$fromPhone} did not match RSVP keywords: \"{$rawText}\" (Payload: \"{$buttonPayload}\")");
        }
    }

    /**
     * Process RSVP state change and send automatic WhatsApp confirmation.
     */
    protected function processGuestRsvp(string $rawPhone, bool $isAttending, ?string $buttonPayload = null)
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

        if (! $guest) {
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

        // If auto-reply is disabled by the organizer, do not send confirmation message
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

        // If active Meta WhatsApp Cloud API credentials are configured, dispatch the live auto-reply
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
                            'body' => $confirmationText,
                        ],
                    ]);

                if ($response->successful()) {
                    $msgStatus = 'sent';
                    $deliveredAt = now();
                    Log::info("WhatsApp auto-confirmation reply delivered successfully to {$cleanPhone}");
                } else {
                    $msgStatus = 'failed';
                    $err = $response->json('error.message') ?? (! empty($response->body()) ? $response->body() : ('HTTP '.$response->status()));
                    $errorSuffix = " [Error: {$err}]";
                    Log::warning("WhatsApp auto-confirmation reply failed for {$cleanPhone}: ".$response->body());
                }
            } catch (\Throwable $e) {
                $msgStatus = 'failed';
                $errorSuffix = ' [Error: '.$e->getMessage().']';
                Log::error('Failed to send WhatsApp auto-confirmation reply: '.$e->getMessage());
            }
        }

        // Log confirmation reply message in Kardovo audit logs with accurate status
        Message::create([
            'event_id' => $event->id,
            'guest_id' => $guest->id,
            'channel' => 'whatsapp',
            'recipient_phone' => $cleanPhone,
            'message_body' => $confirmationText.$errorSuffix,
            'status' => $msgStatus,
            'sent_at' => now(),
            'delivered_at' => $deliveredAt,
        ]);
    }
}
