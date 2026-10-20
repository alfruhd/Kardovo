<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Guest;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CustomizableRsvpButtonsTest extends TestCase
{
    use RefreshDatabase;

    public function test_organizer_can_customize_whatsapp_rsvp_buttons(): void
    {
        SystemSetting::set('whatsapp_gateway', [
            'provider' => 'Meta WhatsApp Cloud API',
            'phone_number_id' => '108492019482910',
            'waba_id' => '94820194820184',
            'api_version' => 'v20.0',
            'access_token' => 'EAAG_LIVE_VALID_TOKEN_123',
            'sender_number' => '+255 700 000 000',
            'status' => 'Connected (Operational)',
        ]);

        Http::fake([
            'https://graph.facebook.com/*' => Http::response([
                'messages' => [['id' => 'wamid.HBgLMTIzNDU2Nzg5MA==']],
            ], 200),
        ]);

        $organizer = User::factory()->create([
            'role' => 'customer',
            'has_payment_override' => true,
        ]);
        $event = Event::create([
            'user_id' => $organizer->id,
            'title' => 'Tanzania Tech Gala 2026',
            'event_type' => 'Corporate Conference',
            'event_date' => '2026-11-20',
            'event_time' => '6:00 PM',
            'venue' => 'Serena Hotel, Dar es Salaam',
            'city' => 'Dar es Salaam',
            'status' => 'active',
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Juma Rashidi',
            'phone' => '+255 712 000 111',
            'unique_code' => 'KDV-9911',
            'qr_token' => 'token_juma_9911',
            'delivery_status' => 'draft',
            'rsvp_status' => 'pending',
        ]);

        $response = $this->actingAs($organizer)->post(route('messaging.broadcast'), [
            'event_id' => $event->id,
            'channel' => 'whatsapp',
            'campaign_type' => 'text_rsvp',
            'target_filter' => 'all',
            'custom_caption' => 'Karibu kwenye gala letu.',
            'enable_auto_reply' => true,
            'rsvp_button_attending' => 'Nitakuwepo',
            'rsvp_button_declined' => 'Sitakuwepo',
            'rsvp_attending_text' => 'Asante, nafasi yako imethibitishwa.',
            'rsvp_declined_text' => 'Asante kwa kutujulisha.',
        ]);

        $response->assertStatus(302);

        $event->refresh();
        $this->assertEquals('Nitakuwepo', $event->rsvp_auto_reply_config['button_attending']);
        $this->assertEquals('Sitakuwepo', $event->rsvp_auto_reply_config['button_declined']);

        $recorded = Http::recorded();
        $this->assertNotEmpty($recorded);
        $req = $recorded[0][0];
        $data = json_decode($req->body(), true);
        $buttons = $data['interactive']['action']['buttons'];
        $this->assertEquals('Nitakuwepo', $buttons[0]['reply']['title']);
        $this->assertEquals('Sitakuwepo', $buttons[1]['reply']['title']);
    }

    public function test_rsvp_button_titles_enforce_whatsapp_max_20_characters(): void
    {
        $organizer = User::factory()->create(['role' => 'customer']);
        $event = Event::create([
            'user_id' => $organizer->id,
            'title' => 'VIP Summit 2026',
            'event_date' => '2026-11-20',
            'venue' => 'Serena Hotel',
            'status' => 'active',
        ]);

        $response = $this->actingAs($organizer)->post(route('messaging.broadcast'), [
            'event_id' => $event->id,
            'channel' => 'whatsapp',
            'campaign_type' => 'text_rsvp',
            'target_filter' => 'all',
            'rsvp_button_attending' => 'This button title is far longer than twenty chars',
            'rsvp_button_declined' => 'Cannot Attend',
        ]);

        $response->assertSessionHasErrors(['rsvp_button_attending']);
    }
}
