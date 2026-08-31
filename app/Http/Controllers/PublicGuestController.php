<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Event;
use App\Models\Guest;
use App\Models\Message;
use App\Models\CardTemplate;
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
            'allowance_label' => 'DOUBLE ENTRY • 2X',
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

        if (!$guest) {
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

        // Auto-reply log simulating WhatsApp closing loop
        Message::create([
            'event_id' => $guest->event_id,
            'guest_id' => $guest->id,
            'channel' => 'whatsapp',
            'recipient_phone' => $guest->phone,
            'message_body' => $validated['status'] === 'attending'
                ? "Thank you! Your RSVP has been recorded: Attending. See you at {$guest->event->title}!"
                : "Thank you for letting us know. Your RSVP has been recorded: Will Not Attend.",
            'status' => 'delivered',
            'sent_at' => now(),
            'delivered_at' => now(),
        ]);

        return back()->with('success', $validated['status'] === 'attending'
            ? 'Thank you! Your attendance has been confirmed.'
            : 'Thank you for letting us know your response.');
    }
}
