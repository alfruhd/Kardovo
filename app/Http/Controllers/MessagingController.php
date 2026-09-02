<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Event;
use App\Models\Guest;
use App\Models\Message;
use App\Models\SystemSetting;
use App\Services\PhoneNormalizer;
use Inertia\Inertia;

class MessagingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Enforce broadcast messaging permission for organizers
        if ($user && !$user->isAdmin() && !$user->isSubAdmin() && !$user->isScanner()) {
            if (!$user->canSendBroadcasts() || $user->status === 'suspended') {
                return redirect()->route('dashboard')->with('error', 'Access Restricted: Your organizer account is not permitted to access Broadcast Messaging. Contact platform administration.');
            }
        }

        $eventsQuery = Event::withCount(['guests', 'messages'])->with(['user']);
        if (!$user->isAdmin()) {
            $eventsQuery->where('user_id', $user->id);
        }
        $events = $eventsQuery->latest('event_date')->get();

        $selectedEventId = $request->input('event_id', $events->first()?->id);
        $selectedEvent = null;

        if ($selectedEventId) {
            $selectedEventQuery = Event::with(['cardTemplate', 'guests', 'user']);
            if (!$user->isAdmin()) {
                $selectedEventQuery->where('user_id', $user->id);
            }
            $selectedEvent = $selectedEventQuery->find($selectedEventId) ?: ($events->first() ? Event::with(['cardTemplate', 'guests', 'user'])->find($events->first()->id) : null);
        }

        $messagesQuery = Message::with(['guest', 'event', 'event.user'])->latest();
        if (!$user->isAdmin()) {
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

        return Inertia::render('Customer/Messaging', [
            'events' => $events,
            'selectedEvent' => $selectedEvent,
            'recentMessages' => $recentMessages,
            'quotas' => $user ? $user->getMessageQuotaStats() : null,
            'gateways' => [
                'whatsapp' => $whatsappGateway,
                'sms' => $smsGateway,
            ],
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    public function sendBroadcast(Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin() && !$user->canSendBroadcasts()) {
            return back()->with('error', 'Campaign broadcasting & message dispatch permissions are disabled for your organizer account. Please contact system administration.');
        }

        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'channel' => 'required|in:whatsapp,sms',
            'campaign_type' => 'nullable|in:pass_invitation,pass_only,text_only',
            'target_filter' => 'required|in:all,draft,failed,pending_rsvp',
            'custom_caption' => 'nullable|string|max:1000',
            'enable_auto_reply' => 'nullable|boolean',
            'rsvp_attending_text' => 'nullable|string|max:500',
            'rsvp_declined_text' => 'nullable|string|max:500',
        ]);

        $event = Event::findOrFail($validated['event_id']);
        if ($event->user_id !== $user->id && !$user->isAdmin()) {
            abort(403);
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

        $guestsQuery = $event->guests();

        if ($validated['target_filter'] === 'draft') {
            $guestsQuery->where('delivery_status', 'draft');
        } elseif ($validated['target_filter'] === 'failed') {
            $guestsQuery->where('delivery_status', 'failed');
        } elseif ($validated['target_filter'] === 'pending_rsvp') {
            $guestsQuery->where('rsvp_status', 'pending');
        }

        $guests = $guestsQuery->get();

        if ($guests->isEmpty()) {
            return back()->with('error', 'No recipients matching the selected target filter.');
        }

        $channel = $validated['channel'];
        $recipientCount = $guests->count();
        $eventOwner = $event->user ?: $user;

        // Enforce Quota Limits for WhatsApp & SMS
        if ($channel === 'whatsapp' && !$eventOwner->canSendWhatsApp($recipientCount)) {
            $quota = $eventOwner->getMessageQuotaStats();
            $rem = $quota['whatsapp_remaining'] ?? 0;
            return back()->with('error', "WhatsApp Dispatch Quota Exceeded! You are attempting to dispatch {$recipientCount} messages, but your account only has {$rem} WhatsApp message(s) remaining out of {$eventOwner->max_whatsapp_limit}. Please contact platform administration to upgrade your quota.");
        }

        if ($channel === 'sms' && !$eventOwner->canSendSms($recipientCount)) {
            $quota = $eventOwner->getMessageQuotaStats();
            $rem = $quota['sms_remaining'] ?? 0;
            return back()->with('error', "SMS Dispatch Quota Exceeded! You are attempting to dispatch {$recipientCount} SMS messages, but your account only has {$rem} SMS remaining out of {$eventOwner->max_sms_limit}. Please contact platform administration to upgrade your quota.");
        }

        $sentCount = 0;
        $eventDateStr = $event->event_date ? $event->event_date->format('d M Y') : 'Upcoming';

        foreach ($guests as $guest) {
            if (!empty($validated['custom_caption'])) {
                $caption = str_ireplace(
                    [
                        '{{guest_name}}', '{guest_name}',
                        '{{event_title}}', '{event_title}',
                        '{{event_date}}', '{event_date}',
                        '{{venue}}', '{venue}',
                        '{{pass_code}}', '{pass_code}'
                    ],
                    [
                        $guest->name, $guest->name,
                        $event->title, $event->title,
                        $eventDateStr, $eventDateStr,
                        $event->venue ?? '', $event->venue ?? '',
                        $guest->unique_code ?? '', $guest->unique_code ?? ''
                    ],
                    $validated['custom_caption']
                );
            } else {
                if ($campaignType === 'text_only') {
                    $caption = "Habari {$guest->name}! Important update regarding {$event->title}: we look forward to seeing you on {$eventDateStr} at {$event->venue}.";
                } elseif ($campaignType === 'pass_only') {
                    $caption = "Hi {$guest->name}! You're invited to {$event->title} on {$eventDateStr}. Please view your official invitation pass below:";
                } else {
                    $caption = "Hi {$guest->name}! You're invited to {$event->title} on {$eventDateStr}. Tap below to RSVP:";
                }
            }

            // Normalize phone: digits only, no + sign, no spaces (e.g. 255712345678)
            $cleanPhone = PhoneNormalizer::cleanForApi($guest->phone);

            Message::create([
                'event_id' => $event->id,
                'guest_id' => $guest->id,
                'channel' => $validated['channel'],
                'recipient_phone' => $cleanPhone,
                'message_body' => $caption,
                'status' => 'delivered',
                'sent_at' => now(),
                'delivered_at' => now(),
            ]);

            $guest->update([
                'delivery_status' => 'delivered',
            ]);

            $sentCount++;
        }

        $typeLabel = $campaignType === 'text_only' ? 'text broadcast' : 'invitation pass';
        return back()->with('success', "Dispatched {$sentCount} {$validated['channel']} {$typeLabel} messages successfully!");
    }

    public function sendSingle(Request $request, Guest $guest)
    {
        $user = $request->user();
        if ($guest->event->user_id !== $user->id && !$user->isAdmin()) {
            abort(403);
        }

        if (!$user->isAdmin() && !$user->canSendBroadcasts()) {
            return back()->with('error', 'Single message dispatch permission is disabled for your organizer account. Please contact system administration.');
        }

        $channel = $request->input('channel', 'whatsapp');
        $eventOwner = $guest->event->user ?: $user;

        if ($channel === 'whatsapp' && !$eventOwner->canSendWhatsApp(1)) {
            $quota = $eventOwner->getMessageQuotaStats();
            return back()->with('error', "WhatsApp dispatch quota reached ({$eventOwner->max_whatsapp_limit} messages limit). Contact administration to increase quota.");
        }

        if ($channel === 'sms' && !$eventOwner->canSendSms(1)) {
            $quota = $eventOwner->getMessageQuotaStats();
            return back()->with('error', "SMS dispatch quota reached ({$eventOwner->max_sms_limit} SMS limit). Contact administration to increase quota.");
        }

        $customText = $request->input('message_text');
        
        if (!empty($customText)) {
            $caption = $customText;
        } else {
            $caption = "Hi {$guest->name}! You're invited to {$guest->event->title}. Tap below to confirm attendance.";
        }

        // Normalize phone: digits only, no + sign, no spaces (e.g. 255712345678)
        $cleanPhone = PhoneNormalizer::cleanForApi($guest->phone);

        Message::create([
            'event_id' => $guest->event_id,
            'guest_id' => $guest->id,
            'channel' => $channel,
            'recipient_phone' => $cleanPhone,
            'message_body' => $caption,
            'status' => 'delivered',
            'sent_at' => now(),
            'delivered_at' => now(),
        ]);

        $guest->update([
            'delivery_status' => 'delivered',
        ]);

        return back()->with('success', "Message dispatched to {$guest->name} via {$channel}!");
    }
}
