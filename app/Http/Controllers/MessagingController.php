<?php

namespace App\Http\Controllers;

use App\Models\CardTemplate;
use App\Models\Event;
use App\Models\Guest;
use App\Models\Message;
use App\Models\SystemSetting;
use App\Services\PassImageGeneratorService;
use App\Services\PhoneNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MessagingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Enforce broadcast messaging permission for organizers
        if ($user && ! $user->isAdmin() && ! $user->isSubAdmin() && ! $user->isScanner()) {
            if (! $user->canSendBroadcasts() || $user->status === 'suspended') {
                return redirect()->route('dashboard')->with('error', 'Access Restricted: Your organizer account is not permitted to access Broadcast Messaging. Contact platform administration.');
            }
        }

        $eventsQuery = Event::accessibleBy($user)->withCount(['guests', 'messages'])->with(['user']);
        $events = $eventsQuery->latest('event_date')->get();

        $selectedEventId = $request->input('event_id', $events->first()?->id);
        $selectedEvent = null;

        if ($selectedEventId) {
            $selectedEventQuery = Event::accessibleBy($user)->with(['cardTemplate', 'guests', 'user']);
            $selectedEvent = $selectedEventQuery->find($selectedEventId) ?: ($events->first() ? Event::accessibleBy($user)->with(['cardTemplate', 'guests', 'user'])->find($events->first()->id) : null);
        }

        $messagesQuery = Message::with(['guest', 'event', 'event.user'])->latest();
        if (! $user->isAdmin()) {
            $messagesQuery->whereHas('event', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }
        $recentMessages = $messagesQuery->limit(50)->get();

        $whatsappGateway = SystemSetting::get('whatsapp_gateway', [
            'provider' => 'Meta WhatsApp Cloud API',
            'phone_number_id' => '108492019482910',
            'waba_id' => '94820194820184',
            'api_version' => 'v20.0',
            'access_token' => 'EAAG...kdv_prod_token_live',
            'sender_number' => '+255 700 000 000',
            'webhook_url' => url('/api/webhooks/whatsapp'),
            'verify_token' => 'kardovo_verify_token_2026',
            'status' => 'Connected (Operational)',
        ]);

        $smsGateway = SystemSetting::get('sms_gateway', [
            'provider' => 'NextSMS Tanzania',
            'sender_id' => 'KARDOVO',
            'api_key' => 'nextsms_live_api_key',
            'api_secret' => '••••••••••••••••',
            'api_endpoint' => 'https://messaging-service.co.tz/api/sms/v1/text/single',
            'balance' => '12,450 TZS',
            'country_code' => '+255',
            'status' => 'Active',
        ]);

        $templatesQuery = CardTemplate::query();
        if ($user) {
            $templatesQuery->where(function ($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            });
        } else {
            $templatesQuery->whereNull('user_id');
        }
        $templates = $templatesQuery
            ->orderByRaw('CASE WHEN user_id IS NOT NULL THEN 0 ELSE 1 END, id ASC')
            ->get();

        return Inertia::render('Customer/Messaging', [
            'events' => $events,
            'selectedEvent' => $selectedEvent,
            'templates' => $templates,
            'recentMessages' => $recentMessages,
            'quotas' => $user ? $user->getMessageQuotaStats() : null,
            'gateways' => [
                'whatsapp' => $whatsappGateway,
                'sms' => $smsGateway,
            ],
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    public function updateEventTemplate(Request $request, Event $event)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403, 'Unauthorized to modify this event.');
        }

        $validated = $request->validate([
            'card_template_id' => 'required|exists:card_templates,id',
        ]);

        $event->update(['card_template_id' => $validated['card_template_id']]);

        return back()->with('success', 'Pass template updated for this event.');
    }

    public function sendBroadcast(Request $request)
    {
        set_time_limit(300); // Allow up to 5 minutes for bulk broadcasts
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->canSendBroadcasts()) {
            return back()->with('error', 'Broadcast permissions disabled.');
        }

        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'card_template_id' => 'nullable|exists:card_templates,id',
            'channel' => 'required|in:whatsapp,sms',
            'campaign_type' => 'nullable|in:pass_invitation,pass_only,text_only,text_rsvp',
            'include_pass_link' => 'nullable|boolean',
            'target_filter' => 'required|in:all,draft,failed,pending_rsvp,custom',
            'selected_guest_ids' => 'nullable|array',
            'selected_guest_ids.*' => 'integer|exists:guests,id',
            'custom_caption' => 'nullable|string|max:1000',
            'enable_auto_reply' => 'nullable|boolean',
            'rsvp_attending_text' => 'nullable|string|max:500',
            'rsvp_declined_text' => 'nullable|string|max:500',
        ]);

        $event = Event::findOrFail($validated['event_id']);
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403);
        }

        if (! empty($validated['card_template_id']) && $event->card_template_id != $validated['card_template_id']) {
            $event->update(['card_template_id' => $validated['card_template_id']]);
        }

        // Save customized RSVP confirmation reply settings onto the event
        if ($request->has('enable_auto_reply') || $request->has('rsvp_attending_text')) {
            $event->update([
                'rsvp_auto_reply_config' => [
                    'enabled' => $request->boolean('enable_auto_reply', true),
                    'attending_text' => $request->input('rsvp_attending_text'),
                    'declined_text' => $request->input('rsvp_declined_text'),
                ],
            ]);
        }

        $campaignType = $validated['campaign_type'] ?? 'pass_invitation';
        $includePassLink = $request->boolean('include_pass_link', false);

        $guestsQuery = $event->guests();

        if ($validated['target_filter'] === 'custom' || (! empty($validated['selected_guest_ids']) && $validated['target_filter'] !== 'all' && $validated['target_filter'] !== 'draft' && $validated['target_filter'] !== 'failed' && $validated['target_filter'] !== 'pending_rsvp')) {
            $selectedIds = $validated['selected_guest_ids'] ?? [];
            if (empty($selectedIds)) {
                return back()->with('error', 'Please select at least one recipient.');
            }
            $guestsQuery->whereIn('id', $selectedIds);
        } elseif (! empty($validated['selected_guest_ids'])) {
            // When specific individuals are selected within a filter
            $guestsQuery->whereIn('id', $validated['selected_guest_ids']);
        } elseif ($validated['target_filter'] === 'draft') {
            $guestsQuery->where('delivery_status', 'draft');
        } elseif ($validated['target_filter'] === 'failed') {
            $guestsQuery->where('delivery_status', 'failed');
        } elseif ($validated['target_filter'] === 'pending_rsvp') {
            $guestsQuery->where('rsvp_status', 'pending');
        }

        $guests = $guestsQuery->get();

        if ($guests->isEmpty()) {
            return back()->with('error', 'No matching recipients found.');
        }

        $channel = $validated['channel'];
        $recipientCount = $guests->count();
        $eventOwner = $event->user ?: $user;

        // Enforce Quota Limits for WhatsApp & SMS
        if ($channel === 'whatsapp' && ! $eventOwner->canSendWhatsApp($recipientCount)) {
            $quota = $eventOwner->getMessageQuotaStats();
            $rem = $quota['whatsapp_remaining'] ?? 0;

            return back()->with('error', "WhatsApp Quota Exceeded! (Need: {$recipientCount}, Remaining: {$rem})");
        }

        if ($channel === 'sms' && ! $eventOwner->canSendSms($recipientCount)) {
            $quota = $eventOwner->getMessageQuotaStats();
            $rem = $quota['sms_remaining'] ?? 0;

            return back()->with('error', "SMS Quota Exceeded! (Need: {$recipientCount}, Remaining: {$rem})");
        }

        $sentCount = 0;
        $failedCount = 0;
        $failedErrors = [];
        $eventDateStr = $event->event_date ? $event->event_date->format('d M Y') : 'Upcoming';

        // Resolve public base URL for links (handling tunnels, proxies, and configured webhooks)
        $baseUrl = $request->getSchemeAndHttpHost();
        if (str_contains($baseUrl, '127.0.0.1') || str_contains($baseUrl, 'localhost')) {
            $gw = SystemSetting::get('whatsapp_gateway', []);
            if (! empty($gw['webhook_url'])) {
                $parsed = parse_url($gw['webhook_url']);
                if (! empty($parsed['scheme']) && ! empty($parsed['host']) && ! str_contains($parsed['host'], 'localhost') && ! str_contains($parsed['host'], '127.0.0.1')) {
                    $port = ! empty($parsed['port']) ? ':'.$parsed['port'] : '';
                    $baseUrl = $parsed['scheme'].'://'.$parsed['host'].$port;
                }
            }
        }

        $activeTemplate = ! empty($validated['card_template_id'])
            ? CardTemplate::find($validated['card_template_id'])
            : ($event->cardTemplate ?: CardTemplate::first());

        foreach ($guests as $guest) {
            $passUrl = rtrim($baseUrl, '/').'/card/'.$guest->qr_token;

            if (! empty($validated['custom_caption'])) {
                $caption = str_ireplace(
                    [
                        '{{guest_name}}', '{guest_name}',
                        '{{event_title}}', '{event_title}',
                        '{{event_date}}', '{event_date}',
                        '{{venue}}', '{venue}',
                        '{{pass_code}}', '{pass_code}',
                    ],
                    [
                        $guest->name, $guest->name,
                        $event->title, $event->title,
                        $eventDateStr, $eventDateStr,
                        $event->venue ?? '', $event->venue ?? '',
                        $guest->unique_code ?? '', $guest->unique_code ?? '',
                    ],
                    $validated['custom_caption']
                );
            } else {
                if ($campaignType === 'text_only') {
                    $caption = "Habari {$guest->name}! Important update regarding {$event->title}: we look forward to seeing you on {$eventDateStr} at {$event->venue}.";
                } elseif ($campaignType === 'text_rsvp') {
                    $caption = "Habari {$guest->name}! You're cordially invited to {$event->title} on {$eventDateStr} at {$event->venue}. Please tap below to confirm your attendance:";
                } elseif ($campaignType === 'pass_only') {
                    $caption = "Hi {$guest->name}! You're invited to {$event->title} on {$eventDateStr}. Please view your official invitation pass below:";
                } else {
                    $caption = "Habari {$guest->name}! You're cordially invited to our celebration. Please view your pass and tap below to confirm your attendance:";
                }
            }

            $bodyToSend = $caption;
            if ($includePassLink && $guest && ! str_contains($bodyToSend, '/card/')) {
                $token = $guest->qr_token ?? $guest->unique_code ?? $guest->id;
                $pUrl = rtrim($baseUrl, '/').'/card/'.$token;
                if ($channel === 'whatsapp') {
                    $bodyToSend .= "\n\n🎟️ *Digital Pass & RSVP:* {$pUrl}";
                } else {
                    $bodyToSend .= "\n\n🎟️ Digital Pass & RSVP: {$pUrl}";
                }
            }

            // Normalize phone: digits only, no + sign, no spaces (e.g. 255712345678)
            $cleanPhone = PhoneNormalizer::cleanForApi($guest->phone);

            if ($channel === 'whatsapp') {
                $sendResult = $this->sendMetaWhatsAppMessage($cleanPhone, $bodyToSend, $guest, $campaignType, $activeTemplate, $baseUrl, $includePassLink);
            } else {
                // SMS dispatch (simulated/provider)
                $sendResult = ['success' => true, 'simulated' => true, 'sent_text' => $bodyToSend];
            }

            $isSuccess = $sendResult['success'];
            $status = $isSuccess ? 'sent' : 'failed';
            $recordedBody = $sendResult['sent_text'] ?? $bodyToSend;

            if (! $isSuccess && ! empty($sendResult['error_message'])) {
                $recordedBody .= ' [Error: '.$sendResult['error_message'].']';
                $failedErrors[] = "{$guest->name}: {$sendResult['error_message']}";
                $failedCount++;
            } else {
                $sentCount++;
            }

            Message::create([
                'event_id' => $event->id,
                'guest_id' => $guest->id,
                'channel' => $channel,
                'recipient_phone' => $cleanPhone,
                'message_body' => $recordedBody,
                'status' => $status,
                'sent_at' => $isSuccess ? now() : null,
                'delivered_at' => null, // Updated in real time when delivery receipt webhook arrives
            ]);

            $guest->update([
                'delivery_status' => $status,
            ]);
        }

        $typeLabel = in_array($campaignType, ['text_only', 'text_rsvp']) ? 'text broadcast' : 'invitation pass';

        if ($failedCount > 0 && $sentCount > 0) {
            return back()->with('warning', "Sent {$sentCount} messages. Failed {$failedCount}.");
        } elseif ($failedCount > 0 && $sentCount === 0) {
            $firstErr = $failedErrors[0] ?? 'Provider API Error';

            return back()->with('error', "Dispatch failed: {$firstErr}");
        }

        return back()->with('success', "Sent {$sentCount} messages successfully!");
    }

    public function sendSingle(Request $request, Guest $guest)
    {
        set_time_limit(120);
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $guest->event_id)->exists()) {
            abort(403);
        }

        if (! $user->isAdmin() && ! $user->canSendBroadcasts()) {
            return back()->with('error', 'Single message dispatch permission is disabled for your organizer account. Please contact system administration.');
        }

        $channel = $request->input('channel', 'whatsapp');
        $eventOwner = $guest->event->user ?: $user;

        if ($channel === 'whatsapp' && ! $eventOwner->canSendWhatsApp(1)) {
            $quota = $eventOwner->getMessageQuotaStats();

            return back()->with('error', 'WhatsApp limit reached.');
        }

        if ($channel === 'sms' && ! $eventOwner->canSendSms(1)) {
            $quota = $eventOwner->getMessageQuotaStats();

            return back()->with('error', 'SMS limit reached.');
        }

        // Resolve public base URL for links (handling tunnels, proxies, and configured webhooks)
        $baseUrl = $request->getSchemeAndHttpHost();
        if (str_contains($baseUrl, '127.0.0.1') || str_contains($baseUrl, 'localhost')) {
            $gw = SystemSetting::get('whatsapp_gateway', []);
            if (! empty($gw['webhook_url'])) {
                $parsed = parse_url($gw['webhook_url']);
                if (! empty($parsed['scheme']) && ! empty($parsed['host']) && ! str_contains($parsed['host'], 'localhost') && ! str_contains($parsed['host'], '127.0.0.1')) {
                    $port = ! empty($parsed['port']) ? ':'.$parsed['port'] : '';
                    $baseUrl = $parsed['scheme'].'://'.$parsed['host'].$port;
                }
            }
        }

        $customText = $request->input('message_text');

        if (! empty($customText)) {
            $caption = $customText;
        } else {
            $caption = "Hi {$guest->name}! You're invited to {$guest->event->title}. Tap below to confirm attendance.";
        }

        $bodyToSend = $caption;

        // Normalize phone: digits only, no + sign, no spaces (e.g. 255712345678)
        $cleanPhone = PhoneNormalizer::cleanForApi($guest->phone);

        if ($channel === 'whatsapp') {
            $singleTemplate = $guest->event->cardTemplate ?: CardTemplate::first();
            $sendResult = $this->sendMetaWhatsAppMessage($cleanPhone, $bodyToSend, $guest, 'pass_invitation', $singleTemplate, $baseUrl);
        } else {
            $sendResult = ['success' => true, 'simulated' => true];
        }

        $isSuccess = $sendResult['success'];
        $status = $isSuccess ? 'sent' : 'failed';
        $recordedBody = $bodyToSend;

        if (! $isSuccess && ! empty($sendResult['error_message'])) {
            $recordedBody .= ' [Error: '.$sendResult['error_message'].']';
        }

        Message::create([
            'event_id' => $guest->event_id,
            'guest_id' => $guest->id,
            'channel' => $channel,
            'recipient_phone' => $cleanPhone,
            'message_body' => $recordedBody,
            'status' => $status,
            'sent_at' => $isSuccess ? now() : null,
            'delivered_at' => null, // Updated when delivery receipt webhook arrives
        ]);

        $guest->update([
            'delivery_status' => $status,
        ]);

        if (! $isSuccess) {
            return back()->with('error', "WhatsApp dispatch to {$guest->name} failed: ".($sendResult['error_message'] ?? 'Meta API error'));
        }

        return back()->with('success', "Message dispatched to {$guest->name} via {$channel}!");
    }

    /**
     * Meta WhatsApp Cloud API Outbound Dispatcher
     */
    protected function sendMetaWhatsAppMessage(
        string $toPhone,
        string $messageBody,
        ?Guest $guest = null,
        string $campaignType = 'pass_invitation',
        ?CardTemplate $template = null,
        ?string $baseUrl = null,
        bool $includePassLink = false
    ): array {
        $gateway = SystemSetting::get('whatsapp_gateway', []);
        $accessToken = trim($gateway['access_token'] ?? '');
        $phoneNumberId = trim($gateway['phone_number_id'] ?? '');
        $apiVersion = trim($gateway['api_version'] ?? 'v20.0');
        if (empty($apiVersion)) {
            $apiVersion = 'v20.0';
        }

        $cleanPhone = PhoneNormalizer::cleanForApi($toPhone);

        $isLiveConfigured = ! empty($accessToken) &&
                            ! empty($phoneNumberId) &&
                            ! str_starts_with($accessToken, 'EAAG...kdv_prod_token_live') &&
                            ! str_starts_with($accessToken, 'EAAGkdv_prod_access_token_live');

        if (! $isLiveConfigured) {
            $textToSend = $messageBody;
            if ($includePassLink && $guest && ! str_contains($textToSend, '/card/')) {
                $token = $guest->qr_token ?? $guest->unique_code ?? $guest->id;
                $pUrl = rtrim($baseUrl, '/').'/card/'.$token;
                $textToSend .= "\n\n🎟️ *Digital Pass & RSVP:* {$pUrl}";
            }

            // In local/simulated sandbox without credentials, record successful simulated dispatch
            return [
                'success' => true,
                'simulated' => true,
                'message_id' => 'sim_'.uniqid(),
                'sent_text' => $textToSend,
            ];
        }

        try {
            $endpoint = "https://graph.facebook.com/{$apiVersion}/{$phoneNumberId}/messages";

            // Determine public image URL for card attachment if available
            $cardImageUrl = null;
            if (in_array($campaignType, ['pass_invitation', 'pass_only']) && $guest) {
                try {
                    $passRelPath = PassImageGeneratorService::generate($guest, $template, $baseUrl);
                    if (! empty($baseUrl) && ! str_contains($baseUrl, '127.0.0.1') && ! str_contains($baseUrl, 'localhost')) {
                        $cardImageUrl = rtrim($baseUrl, '/').'/'.ltrim($passRelPath, '/');
                    }
                } catch (\Throwable $e) {
                    Log::warning("Personalized pass generator notice for {$cleanPhone}: ".$e->getMessage());
                }
            }

            if (! $cardImageUrl && in_array($campaignType, ['pass_invitation', 'pass_only']) && $template && ! empty($template->image_path)) {
                $imgPath = $template->image_path;
                if (str_starts_with($imgPath, 'http://') || str_starts_with($imgPath, 'https://')) {
                    $cardImageUrl = $imgPath;
                } elseif (! empty($baseUrl) && ! str_contains($baseUrl, '127.0.0.1') && ! str_contains($baseUrl, 'localhost')) {
                    $cardImageUrl = rtrim($baseUrl, '/').'/'.ltrim($imgPath, '/');
                }
            }

            // If campaign mode includes interactive 1-tap RSVP buttons
            $useInteractive = in_array($campaignType, ['pass_invitation', 'text_rsvp']) && $guest;

            if ($useInteractive) {
                $token = $guest->qr_token ?? $guest->unique_code ?? $guest->id;
                // Embed Kardovo branding in body text so it is always visible.
                // WhatsApp suppresses the footer field when an image header is present,
                // so we include the label directly in the message body instead.
                $bodyWithBranding = $messageBody."\n\n_Kardovo_";
                $interactivePayload = [
                    'type' => 'button',
                    'body' => [
                        'text' => $bodyWithBranding,
                    ],
                    'action' => [
                        'buttons' => [
                            [
                                'type' => 'reply',
                                'reply' => [
                                    'id' => 'rsvp_yes_'.$token,
                                    'title' => '✅ Attending',
                                ],
                            ],
                            [
                                'type' => 'reply',
                                'reply' => [
                                    'id' => 'rsvp_no_'.$token,
                                    'title' => '❌ Decline',
                                ],
                            ],
                        ],
                    ],
                ];

                if ($cardImageUrl) {
                    $interactivePayload['header'] = [
                        'type' => 'image',
                        'image' => [
                            'link' => $cardImageUrl,
                        ],
                    ];
                }

                $response = Http::withoutVerifying()
                    ->withToken($accessToken)
                    ->timeout(8)
                    ->post($endpoint, [
                        'messaging_product' => 'whatsapp',
                        'recipient_type' => 'individual',
                        'to' => $cleanPhone,
                        'type' => 'interactive',
                        'interactive' => $interactivePayload,
                    ]);

                if ($response->successful()) {
                    $msgId = $response->json('messages.0.id') ?? ('wamid.'.uniqid());

                    return [
                        'success' => true,
                        'simulated' => false,
                        'message_id' => $msgId,
                    ];
                }

                // If image header failed, retry interactive without header
                if ($cardImageUrl) {
                    unset($interactivePayload['header']);
                    $responseRetry = Http::withoutVerifying()
                        ->withToken($accessToken)
                        ->timeout(8)
                        ->post($endpoint, [
                            'messaging_product' => 'whatsapp',
                            'recipient_type' => 'individual',
                            'to' => $cleanPhone,
                            'type' => 'interactive',
                            'interactive' => $interactivePayload,
                        ]);

                    if ($responseRetry->successful()) {
                        $msgId = $responseRetry->json('messages.0.id') ?? ('wamid.'.uniqid());

                        return [
                            'success' => true,
                            'simulated' => false,
                            'message_id' => $msgId,
                        ];
                    }
                }

                // If interactive call returns error (e.g. template policy restriction in Meta Sandbox), fallback to standard text message
                Log::info("Interactive WhatsApp button dispatch not accepted by provider, falling back to standard text for {$cleanPhone}: ".$response->body());
            }

            // If pass_only with image
            if ($campaignType === 'pass_only' && $cardImageUrl) {
                $imagePayload = [
                    'messaging_product' => 'whatsapp',
                    'recipient_type' => 'individual',
                    'to' => $cleanPhone,
                    'type' => 'image',
                    'image' => [
                        'link' => $cardImageUrl,
                        'caption' => $messageBody,
                    ],
                ];

                $response = Http::withoutVerifying()
                    ->withToken($accessToken)
                    ->timeout(8)
                    ->post($endpoint, $imagePayload);

                if ($response->successful()) {
                    $msgId = $response->json('messages.0.id') ?? ('wamid.'.uniqid());

                    return [
                        'success' => true,
                        'simulated' => false,
                        'message_id' => $msgId,
                        'sent_text' => $messageBody,
                    ];
                }
            }

            // Standard Text Message Payload (Fallback with direct RSVP & Pass link)
            $textToSend = $messageBody;
            if ($includePassLink && $guest && ! str_contains($textToSend, '/card/')) {
                $token = $guest->qr_token ?? $guest->unique_code ?? $guest->id;
                $pUrl = rtrim($baseUrl, '/').'/card/'.$token;
                $textToSend .= "\n\n🎟️ *Digital Pass & RSVP:* {$pUrl}";
            }

            $payload = [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $cleanPhone,
                'type' => 'text',
                'text' => [
                    'preview_url' => false,
                    'body' => $textToSend,
                ],
            ];

            $response = Http::withoutVerifying()
                ->withToken($accessToken)
                ->timeout(8)
                ->post($endpoint, $payload);

            if ($response->successful()) {
                $msgId = $response->json('messages.0.id') ?? ('wamid.'.uniqid());

                return [
                    'success' => true,
                    'simulated' => false,
                    'message_id' => $msgId,
                    'sent_text' => $textToSend,
                ];
            }

            $errorData = $response->json('error') ?? [];
            $errMsg = ! empty($errorData['message']) ? $errorData['message'] : (! empty($response->body()) ? trim($response->body()) : ('HTTP '.$response->status()));
            $errCode = $errorData['code'] ?? null;

            if ($errCode === 190 || str_contains(strtolower($errMsg), 'access token') || str_contains(strtolower($errMsg), 'authentication')) {
                $errMsg = 'Meta Access Token Expired (Code 190). Please copy a fresh token from Meta for Developers > WhatsApp > API Setup and paste it into Gateways Settings.';
            }

            Log::warning("WhatsApp dispatch failed for {$cleanPhone}: [Code {$errCode}] {$errMsg}", ['error' => $errorData]);

            return [
                'success' => false,
                'simulated' => false,
                'error_message' => $errMsg,
                'error_code' => $errCode,
            ];
        } catch (\Throwable $e) {
            Log::error("WhatsApp dispatch exception for {$cleanPhone}: ".$e->getMessage());

            return [
                'success' => false,
                'simulated' => false,
                'error_message' => $e->getMessage(),
            ];
        }
    }

    public function destroyLog(Request $request, Message $message)
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        // Only Admin and Sub-Admin can delete delivery logs
        if (! $user->isAdmin() && ! $user->isSubAdmin()) {
            abort(403, 'Unauthorized. Only platform administrators and sub-administrators can delete broadcast delivery logs.');
        }

        // If sub-admin, ensure they have access to the event or organizer
        if ($user->isSubAdmin()) {
            $assignedCustomerIds = $user->assignedOrganizers()->pluck('users.id')->toArray();
            $assignedEventIds = $user->assignedEvents()->pluck('events.id')->toArray();

            $event = $message->event;
            if ($event) {
                $hasAccess = in_array($event->id, $assignedEventIds) || in_array($event->user_id, $assignedCustomerIds);
                if (! $hasAccess) {
                    abort(403, 'Unauthorized. You can only delete logs for your assigned events or organizers.');
                }
            }
        }

        $recipient = $message->guest?->name ?: $message->recipient_phone;
        $message->delete();

        return back()->with('success', "Broadcast delivery log for \"{$recipient}\" deleted successfully.");
    }

    public function clearLogs(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $eventId = $request->input('event_id');
        $query = Message::query();

        if (! $user->isAdmin()) {
            if ($user->isSubAdmin()) {
                $assignedCustomerIds = $user->assignedOrganizers()->pluck('users.id')->toArray();
                $assignedEventIds = $user->assignedEvents()->pluck('events.id')->toArray();
                $query->whereHas('event', function ($q) use ($assignedCustomerIds, $assignedEventIds) {
                    $q->whereIn('id', $assignedEventIds)->orWhereIn('user_id', $assignedCustomerIds);
                });
            } else {
                $query->whereHas('event', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }
        }

        if ($eventId) {
            $query->where('event_id', $eventId);
        }

        $deletedCount = $query->delete();

        return back()->with('success', "Cleared {$deletedCount} broadcast delivery log(s) successfully.");
    }
}
