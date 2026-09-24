<?php

namespace App\Http\Controllers;

use App\Models\CardTemplate;
use App\Models\Event;
use App\Models\Guest;
use App\Models\Message;
use App\Models\SystemSetting;
use App\Services\PhoneNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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

        $allTemplates = Cache::remember('card_templates_global', 3600, function () {
            return CardTemplate::whereNull('user_id')->orderBy('id', 'asc')->get();
        });

        $config = $this->resolveMicrositeConfig($event, $demoGuest);

        return Inertia::render('Public/GuestPass', [
            'guest' => $demoGuest,
            'event' => $demoEvent,
            'template' => $event?->cardTemplate ?? $allTemplates->first() ?? null,
            'allTemplates' => $allTemplates,
            'isDemo' => true,
            'micrositeConfig' => $config,
        ]);
    }

    public function showCard(Request $request, string $token = 'demo')
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

        $userId = $guest->event->user_id ?? 0;
        $allTemplates = Cache::remember("card_templates_user_{$userId}", 3600, function () use ($userId) {
            return CardTemplate::whereNull('user_id')
                ->orWhere('user_id', $userId ?: null)
                ->orderBy('id', 'asc')
                ->get();
        });

        $config = $this->resolveMicrositeConfig($guest->event, $guest);

        return Inertia::render('Public/GuestPass', [
            'guest' => $guest,
            'event' => $guest->event,
            'template' => $guest->event->cardTemplate,
            'allTemplates' => $allTemplates,
            'isDemo' => $isDemo,
            'micrositeConfig' => $config,
        ]);
    }

    /**
     * Resolve microsite configuration merging event custom settings with rich luxury defaults.
     */
    protected function resolveMicrositeConfig(?Event $event, $guest = null): array
    {
        $eventDate = $event?->event_date;
        $dateFormatted = $eventDate ? $eventDate->format('d . m . Y') : '09 . 05 . 2026';
        $fullDateHuman = $eventDate ? $eventDate->format('l, jS F Y') : 'Saturday, 9th May 2026';
        $timeStr = $event?->event_time ?: '5:30 PM';
        $venueStr = $event?->venue ?: 'OASIS Village & Club - Mbezi Beach';

        $defaults = [
            'theme_color' => '#3a4634',
            'background_color' => '#3a4634',
            'accent_color' => '#5C4033',
            'font_style' => 'script',
            'show_countdown' => true,
            'show_intro_animation' => true,
            'intro_video_url' => 'https://www.kadijanja.co.tz/images/rsvp/cover/baja.mp4',
            'intro_poster_url' => 'https://www.kadijanja.co.tz/images/rsvp/cover/baja.png',
            'intro_button_text' => 'Open Invitation',
            'cover_photo' => 'https://www.kadijanja.co.tz/images/rsvp/header/baja.jpeg',
            'music_url' => 'https://www.kadijanja.co.tz/assets/wedding-background-music.mp3',
            'primary_name' => 'Baraka',
            'secondary_name' => 'Neema',
            'couple_title' => 'Baraka & Neema',
            'event_date_formatted' => $dateFormatted,
            'host_honor_text' => 'The families of Mr & Mrs Simba cordially request the honour of your presence',
            'invitation_text' => "at the wedding ceremony of their children,\nBaraka Simba & Neema Mndeme.",
            'reception_title' => $venueStr,
            'reception_subtitle' => 'A reception dinner and evening of celebration.',
            'reception_time_badge' => "{$fullDateHuman}, {$timeStr}",
            'programme' => [
                ['time' => '4:00 PM', 'title' => 'Guest Arrival', 'note' => 'Mocktails and soft music.'],
                ['time' => '5:00 PM', 'title' => 'Couple Entrance', 'note' => 'The celebration begins.'],
                ['time' => '5:30 PM', 'title' => 'Dinner is Served', 'note' => 'A lavish buffet.'],
                ['time' => '7:00 PM', 'title' => 'Speeches & Toasts', 'note' => 'Words from family.'],
                ['time' => '8:00 PM', 'title' => 'Cake Cutting', 'note' => 'First dance to follow.'],
                ['time' => '11:00 PM', 'title' => 'Farewell', 'note' => 'Thank you for coming!'],
            ],
            'dress_code_title' => 'Dress Code',
            'dress_code_theme' => 'Soft Beige, Light Ivory / Off White, Muted Sage Green, Olive Green and Deep Black / Charcoal',
            'dress_code_image' => 'https://www.kadijanja.co.tz/images/dressing-code/waja.jpeg',
            'dress_code_swatches' => [
                ['name' => 'Light Ivory', 'color' => '#edeade'],
                ['name' => 'Muted Sage Green', 'color' => '#a3b18a'],
                ['name' => 'Olive Green', 'color' => '#588157'],
                ['name' => 'Deep Black', 'color' => '#1b1b1b'],
            ],
            'mc_name' => 'Mc MishieBomba',
            'mc_badge' => 'Master of Ceremonies',
            'mc_bio' => 'Bringing energy, elegance, and a seamless flow to the celebration. We are honored to have GuruB guide us through this special evening.',
            'mc_photo' => 'https://www.kadijanja.co.tz/images/rsvp/mc/mc_mishi.jpeg',
            'mc_hashtag' => '#BARAKAANDNEEMA2026',
            'wedding_committee' => [
                ['name' => 'Tenna Simba', 'phone' => '0753371116'],
                ['name' => 'Dr Aman Simba', 'phone' => '0689632093'],
            ],
            'venue_name' => 'OASIS Village & Club',
            'venue_address' => 'OASIS Village & Club, Mbezi Beach, Dar es Salaam, Tanzania',
            'google_maps_embed_url' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4003.811687197711!2d39.21885857504168!3d-6.704313793291326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c51976672d47f%3A0xe3ac56e0d281274a!2sOasis%20Village%20and%20Club!5e1!3m2!1sen!2stz!4v1777563837703!5m2!1sen!2stz',
            'google_maps_link' => 'https://maps.app.goo.gl/dQNq4jdmardAEHMq8',
            'adults_only_note' => 'While we love your little ones, our celebration will be an adult-only occasion. We hope you will enjoy a night off to celebrate with us!',
            'rsvp_prompt' => 'Will you attend?',
            'footer_text' => 'Baraka & Neema',

            // Section Toggles
            'show_couple_section' => true,
            'show_reception_section' => true,
            'show_dress_code_section' => true,
            'show_services_section' => false,
            'show_committee_section' => true,
            'show_map_section' => true,

            // Services
            'services' => [
                ['name' => 'Catering & Dining', 'description' => 'Exquisite culinary experience by our Executive Chef.'],
                ['name' => 'Cocktails & Beverages', 'description' => 'Signature drinks and premium open bar.'],
            ],
        ];

        $eventConfig = $event?->microsite_config ?? [];
        if (! is_array($eventConfig)) {
            $eventConfig = [];
        }

        // Deep merge: non-empty eventConfig overrides defaults
        return array_merge($defaults, array_filter($eventConfig, fn ($v) => ! is_null($v) && $v !== ''));
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
            'message' => 'nullable|string|max:1000',
        ]);

        $updateData = [
            'rsvp_status' => $validated['status'],
            'rsvp_at' => now(),
        ];

        if (! empty($validated['message'])) {
            $updateData['notes'] = trim($validated['message']);
        }

        $guest->update($updateData);

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
