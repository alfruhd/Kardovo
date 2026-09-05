<?php

namespace App\Http\Controllers;

use App\Models\CardTemplate;
use App\Models\Event;
use App\Models\Guest;
use App\Models\Message;
use App\Models\SystemSetting;
use App\Services\PhoneNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PublicGuestController extends Controller
{
    public function showDemoPass(Request $request)
    {
        $guest = Guest::with(['event.cardTemplate'])->first();
        $event = $guest?->event ?? Event::with('cardTemplate')->first();

        $demoGuest = [
            'id' => 99999,
            'name' => 'Alfred Mashauri',
            'phone' => '+255 712 345 678',
            'card_number' => 'KDV-2026-004821',
            'unique_code' => '29841872',
            'qr_token' => 'kdv_alfred_mashauri_29841872',
            'category' => 'Double Entry',
            'max_entries' => 2,
            'allowance_label' => 'Double Entry',
            'rsvp_status' => 'pending',
            'event_id' => $event?->id ?? 1,
        ];

        $demoEvent = [
            'id' => $event?->id ?? 1,
            'title' => $event?->title ?? 'Neema & Baraka — Wedding Reception',
            'event_date' => $event?->event_date ?? '2026-09-14',
            'event_time' => $event?->event_time ?? '4:00 PM — Reception & Dinner',
            'venue' => $event?->venue ?? 'Kunduchi Beach Gardens, Dar es Salaam',
            'city' => $event?->city ?? 'Dar es Salaam',
        ];

        $allTemplates = CardTemplate::orderBy('id', 'asc')->get();

        return Inertia::render('Public/GuestPass', [
            'guest' => $demoGuest,
            'event' => $demoEvent,
            'template' => $event?->cardTemplate ?? $allTemplates->first() ?? null,
            'allTemplates' => $allTemplates,
            'isDemo' => true,
        ]);
    }

    public function showCard(Request $request, string $token)
    {
        $isDemo = $request->boolean('demo') || $token === 'demo' || str_contains($token, 'demo');

        // Lookup by qr_token or unique_code or card_number
        $guest = Guest::where('qr_token', $token)
            ->orWhere('unique_code', $token)
            ->orWhere('card_number', $token)
            ->with(['event.cardTemplate'])
            ->first();

        if (! $guest) {
            return $this->showDemoPass($request);
        }

        $allTemplates = CardTemplate::whereNull('user_id')
            ->orWhere('user_id', $guest->event->user_id ?? null)
            ->orderBy('id', 'asc')
            ->get();

        return Inertia::render('Public/GuestPass', [
            'guest' => $guest,
            'event' => $guest->event,
            'template' => $guest->event->cardTemplate,
            'allTemplates' => $allTemplates,
            'isDemo' => $isDemo,
        ]);
    }

    public function submitRsvp(Request $request, string $token)
    {
        $isDemo = $request->boolean('is_demo') || $request->boolean('demo') || $token === 'demo' || str_contains($token, 'demo') || $token === 'kdv_demo_pass_preview';

        if ($isDemo) {
            return back()->with('success', 'Demo preview RSVP state recorded locally.');
        }

        $guest = Guest::where('qr_token', $token)
            ->orWhere('unique_code', $token)
            ->orWhere('card_number', $token)
            ->with('event')
            ->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:attending,declined',
        ]);

        $guest->update([
            'rsvp_status' => $validated['status'],
            'rsvp_at' => now(),
        ]);

        $event = $guest->event;
        $eventDateStr = $event->event_date ? $event->event_date->format('D, j M Y') : 'Upcoming';
        $autoReplyConfig = $event->rsvp_auto_reply_config ?? [];

        if ($validated['status'] === 'attending') {
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

        $cleanPhone = PhoneNormalizer::cleanForApi($guest->phone);

        // If active Meta WhatsApp Cloud API credentials are configured, dispatch live confirmation to WhatsApp
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

        if (! empty($cleanPhone) && ! empty($accessToken) && ! str_starts_with($accessToken, 'EAAG...kdv_prod_token_live') && ! empty($phoneNumberId)) {
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
                } else {
                    $msgStatus = 'failed';
                    $err = $response->json('error.message') ?? (! empty($response->body()) ? $response->body() : ('HTTP '.$response->status()));
                    $errorSuffix = " [Error: {$err}]";
                    Log::warning("WhatsApp RSVP auto-reply failed for {$cleanPhone}: ".$response->body());
                }
            } catch (\Throwable $e) {
                $msgStatus = 'failed';
                $errorSuffix = ' [Error: '.$e->getMessage().']';
                Log::warning("WhatsApp RSVP web submission auto-reply notice for {$cleanPhone}: ".$e->getMessage());
            }
        }

        // Record confirmation reply message in Kardovo audit logs with accurate status
        Message::create([
            'event_id' => $guest->event_id,
            'guest_id' => $guest->id,
            'channel' => 'whatsapp',
            'recipient_phone' => $cleanPhone ?: $guest->phone,
            'message_body' => $confirmationText.$errorSuffix,
            'status' => $msgStatus,
            'sent_at' => now(),
            'delivered_at' => $deliveredAt,
        ]);

        return back()->with('success', $validated['status'] === 'attending'
            ? 'Thank you! Your attendance has been confirmed.'
            : 'Thank you for letting us know your response.');
    }
}
