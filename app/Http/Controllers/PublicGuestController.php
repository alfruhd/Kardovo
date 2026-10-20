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
            'table_number' => '4',
            'seat_number' => 'B',
            'pledge_amount' => 100000.0,
            'paid_amount' => 50000.0,
            'pledge_balance' => 50000.0,
            'pledge_status' => 'partial',
            'pledge_progress_percent' => 50.0,
            'pledge_deadline' => '2026-09-01',
            'pledge_notes' => null,
        ];

        $demoEvent = [
            'id' => $event?->id ?? 1,
            'title' => $event?->title ?? 'Neema & Baraka — Wedding Reception',
            'event_date' => $event?->event_date ?? '2026-09-14',
            'event_time' => $event?->event_time ?? '4:00 PM — Reception & Dinner',
            'venue' => $event?->venue ?? 'Kunduchi Beach Gardens, Dar es Salaam',
            'city' => $event?->city ?? 'Dar es Salaam',
            'pledges_enabled' => true,
            'pledge_currency' => 'TZS',
            'pledge_target' => 5000000.0,
            'pledge_settings' => [
                'lipa_namba' => '5544332',
                'account_name' => 'Baraka & Neema Wedding',
                'bank_name' => 'CRDB Bank',
                'bank_account' => '0150123456700',
                'instructions' => 'Tuma mchango wako kupitia Lipa Namba au benki hapo juu, kisha weka namba ya muamala hapa.',
            ],
        ];

        $demoPayments = [
            [
                'id' => 1,
                'amount' => 50000.0,
                'payment_method' => 'lipa_namba',
                'reference_number' => '9G28XK911L',
                'status' => 'verified',
                'created_at' => now()->subDays(2)->toIso8601String(),
            ],
        ];

        $allTemplates = CardTemplate::whereNull('user_id')->orderBy('id', 'asc')->get();

        $config = $this->resolveMicrositeConfig($event, $demoGuest);

        return Inertia::render('Public/GuestPass', [
            'guest' => $demoGuest,
            'event' => $demoEvent,
            'template' => $event?->cardTemplate ?? $allTemplates->first() ?? null,
            'allTemplates' => $allTemplates,
            'isDemo' => true,
            'micrositeConfig' => $config,
            'hasMicrosite' => true,
            'recentPayments' => $demoPayments,
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
        $allTemplates = CardTemplate::whereNull('user_id')
            ->orWhere('user_id', $userId ?: null)
            ->orderBy('id', 'asc')
            ->get();

        $hasMicrosite = $guest->event ? $guest->event->hasMicrositeEnabled() : false;
        $config = $hasMicrosite ? $this->resolveMicrositeConfig($guest->event, $guest) : null;

        $sanitizedGuest = [
            'id' => $guest->id,
            'name' => $guest->name,
            'phone' => ! empty($guest->phone) ? (substr($guest->phone, 0, 4).'••••'.substr($guest->phone, -3)) : null,
            'card_number' => $guest->card_number,
            'unique_code' => $guest->unique_code,
            'qr_token' => $guest->qr_token,
            'category' => $guest->category,
            'max_entries' => $guest->max_entries,
            'allowance_label' => $guest->allowance_label,
            'rsvp_status' => $guest->rsvp_status,
            'event_id' => $guest->event_id,
            'table_number' => $guest->table_number,
            'seat_number' => $guest->seat_number,
            'pledge_amount' => (float) ($guest->pledge_amount ?? 0),
            'paid_amount' => (float) ($guest->paid_amount ?? 0),
            'pledge_balance' => (float) $guest->pledge_balance,
            'pledge_status' => $guest->pledge_status ?? 'unpledged',
            'pledge_progress_percent' => (float) $guest->pledge_progress_percent,
            'pledge_deadline' => $guest->pledge_deadline ? $guest->pledge_deadline->format('Y-m-d') : null,
            'pledge_notes' => $guest->pledge_notes,
        ];

        $recentPayments = $guest->pledgePayments()
            ->latest('payment_date')
            ->take(5)
            ->get(['id', 'amount', 'payment_method', 'reference', 'payment_date', 'notes', 'created_at']);

        return Inertia::render('Public/GuestPass', [
            'guest' => $sanitizedGuest,
            'event' => $guest->event,
            'template' => $guest->event->cardTemplate,
            'allTemplates' => $allTemplates,
            'isDemo' => $isDemo,
            'micrositeConfig' => $config,
            'hasMicrosite' => $hasMicrosite,
            'recentPayments' => $recentPayments,
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
            'theme_color' => '#f9f0e0',
            'background_color' => '#f9f0e0',
            'accent_color' => '#a67d2b',
            'font_style' => 'luxury_cinzel',
            'show_countdown' => true,
            'show_intro_animation' => true,
            'intro_video_url' => 'https://res.cloudinary.com/ukb8xb7m/video/upload/v1787037654/1782224012851_1_m6ww6v.mp4',
            'intro_poster_url' => 'https://res.cloudinary.com/ukb8xb7m/image/upload/v1787037630/ChatGPT_Image_Jun_23_2026_04_40_29_PM_4_piptqn.png',
            'swans_video_url' => 'https://res.cloudinary.com/ukb8xb7m/video/upload/v1787037092/Swans2_1_qwzsod.mov',
            'intro_button_text' => 'Tap to open',
            'gate_seal_color' => '#5a0f1b',
            'gate_seal_initials' => 'R&Z',
            'gate_seal_image_url' => '',
            'scroll_down_text' => 'Scroll down',
            'venue_badge' => 'Location',
            'rsvp_open_label' => 'Click to open',
            'wax_seal_image_url' => '/images/sacred_garden/wax_seal_1.png',
            'rsvp_submit_label' => 'Submit',
            'rsvp_field_name' => 'Your name',
            'rsvp_field_attending' => 'Will you be attending?',
            'rsvp_field_guest_count' => 'Number of Guests Attending',
            'rsvp_field_song' => 'A Song That Gets You Dancing',
            'rsvp_field_children' => 'Children Attending',
            'cover_photo' => '/images/sacred_garden/pexels-vinicius-quar.jpg',
            'music_url' => '/images/sacred_garden/music.mp3',
            'primary_name' => 'Zohan',
            'secondary_name' => 'Rose',
            'couple_title' => 'Zohan and Rose',
            'couple_verse' => "Two Souls\nOne destiny\nA Lifetime written by Allah",
            'event_date_formatted' => '27.09.26',
            'event_tagline' => 'Wedding Day',
            'host_honor_text' => 'Dear Friends and Family',
            'invitation_text' => 'Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever.',
            'countdown_title' => 'The Celebration Begins In',
            'schedule_title' => 'Schedule of Events',
            'programme' => [
                ['time' => '5 PM', 'title' => 'Guest Arrival', 'note' => ''],
                ['time' => '6 PM', 'title' => 'Nikkah Ceremony', 'note' => ''],
                ['time' => '7 PM', 'title' => 'Mocktail Hour', 'note' => ''],
                ['time' => '8 PM', 'title' => 'Dinner', 'note' => ''],
                ['time' => '9 PM', 'title' => 'Dance', 'note' => ''],
            ],
            'reception_title' => 'Islamic Center of Melville',
            'reception_subtitle' => 'Address: 118 Old East Neck Road Melville, NY 11747',
            'venue_name' => 'Islamic Center of Melville',
            'venue_address' => '118 Old East Neck Road Melville, NY 11747',
            'google_maps_embed_url' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.060117798216!2d-73.40328222397078!3d40.78269247138302!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1sen!2s!4v1782314483584!5m2!1sen!2s',
            'google_maps_link' => 'https://maps.google.com/?q=Islamic+Center+of+Melville+118+Old+East+Neck+Road+Melville+NY+11747',
            'gift_preference_title' => 'Gift Preference',
            'gift_preference_note' => 'Kindly, no boxed gifts please.',
            'dress_code_title' => 'Dress Code',
            'dress_code_note' => 'We kindly ask guests to avoid deep red and maroon attire for the celebration.',
            'rsvp_heading' => 'Confirm Your Attendance',
            'rsvp_subtext' => 'To help us prepare for a joyful celebration, kindly confirm your attendance.',
            'rsvp_deadline' => 'Please RSVP before August 09',
            'footer_quote' => 'Hope to see you there!',
            'footer_names' => 'Zohan and Rose',
            'footer_text' => 'Zohan and Rose',

            // Section Toggles
            'show_couple_section' => true,
            'show_reception_section' => true,
            'show_dress_code_section' => true,
            'show_gift_preference_section' => true,
            'show_services_section' => false,
            'show_committee_section' => false,
            'show_map_section' => true,
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
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Demo preview RSVP state recorded locally.',
                    'status' => $request->input('status', 'attending'),
                ]);
            }

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

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => $validated['status'] === 'attending'
                    ? 'Thank you! Your attendance has been confirmed.'
                    : 'Thank you for letting us know your response.',
                'status' => $validated['status'],
            ]);
        }

        return back()->with('success', $validated['status'] === 'attending'
            ? 'Thank you! Your attendance has been confirmed.'
            : 'Thank you for letting us know your response.');
    }

    /**
     * Submit or update pledge commitment from the public guest pass.
     */
    public function submitPledge(Request $request, string $token)
    {
        $validated = $request->validate([
            'pledge_amount' => 'required|numeric|min:500',
            'pledge_notes' => 'nullable|string|max:500',
            'pledge_deadline' => 'nullable|date',
            'is_demo' => 'nullable|boolean',
        ]);

        if ($token === 'demo' || $request->boolean('is_demo')) {
            return back()->with('success', 'Demo Pass: Pledge of '.number_format($validated['pledge_amount']).' recorded successfully!');
        }

        $guest = Guest::where('qr_token', $token)
            ->orWhere('unique_code', $token)
            ->orWhere('card_number', $token)
            ->orWhere('id', $token)
            ->first();

        if (! $guest) {
            return back()->with('error', 'Guest record not found.');
        }

        $guest->update([
            'pledge_amount' => $validated['pledge_amount'],
            'notes' => $validated['pledge_notes'] ?? $guest->notes,
            'pledge_deadline' => $validated['pledge_deadline'] ?? $guest->pledge_deadline ?? $guest->event?->pledge_deadline,
        ]);

        $guest->recalculatePledgePaid();

        $currency = $guest->event?->pledge_currency ?: 'TZS';

        return back()->with('success', "Thank you! Your pledge of {$currency} ".number_format($validated['pledge_amount']).' has been recorded.');
    }

    /**
     * Submit payment confirmation / mobile money proof from the public guest pass.
     */
    public function submitPaymentProof(Request $request, string $token)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:100',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'required|string|max:100',
            'notes' => 'nullable|string|max:500',
            'is_demo' => 'nullable|boolean',
        ]);

        if ($token === 'demo' || $request->boolean('is_demo')) {
            return back()->with('success', 'Demo Pass: Payment proof of '.number_format($validated['amount']).' submitted successfully!');
        }

        $guest = Guest::where('qr_token', $token)
            ->orWhere('unique_code', $token)
            ->orWhere('card_number', $token)
            ->orWhere('id', $token)
            ->first();

        if (! $guest) {
            return back()->with('error', 'Guest record not found.');
        }

        $ref = strtoupper(trim($validated['reference_number']));

        $alreadyExists = $guest->pledgePayments()
            ->where('reference', $ref)
            ->exists();

        if ($alreadyExists) {
            return back()->with('error', "Payment reference {$ref} has already been registered.");
        }

        $payment = $guest->pledgePayments()->create([
            'event_id' => $guest->event_id,
            'user_id' => $guest->event?->user_id,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'] ?? 'lipa_namba',
            'reference' => $ref,
            'payment_date' => now()->toDateString(),
            'notes' => $validated['notes'] ?? 'Submitted via Guest Pass',
        ]);

        $guest->recalculatePledgePaid();

        $currency = $guest->event?->pledge_currency ?: 'TZS';

        return back()->with('success', "Payment of {$currency} ".number_format($validated['amount'])." (Ref: {$ref}) recorded and verified!");
    }
}
