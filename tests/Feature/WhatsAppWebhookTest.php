<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Guest;
use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WhatsAppWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_whatsapp_webhook_verification()
    {
        $response = $this->get('/webhooks/whatsapp?hub_mode=subscribe&hub_verify_token=kardovo_verify_token_2026&hub_challenge=CHALLENGE_12345');
        $response->assertStatus(200);
        $this->assertEquals('CHALLENGE_12345', $response->getContent());
    }

    public function test_whatsapp_button_reply_records_rsvp_and_auto_reply()
    {
        $user = User::factory()->create(['role' => 'customer']);
        $event = Event::create([
            'user_id' => $user->id,
            'title' => 'CRDB Bank Annual Executive Summit 2026',
            'event_type' => 'Corporate Conference',
            'event_date' => '2026-10-05',
            'event_time' => '9:00 AM',
            'venue' => 'Julius Nyerere Convention Centre, Dar es Salaam',
            'city' => 'Dar es Salaam',
            'status' => 'active',
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Alumni Guest 2 (Adv. 4uhU2)',
            'phone' => '+255 712 345 678',
            'unique_code' => '48291048',
            'qr_token' => 'token_test_123',
            'category' => 'Single Entry',
            'max_entries' => 1,
            'entries_used' => 0,
            'delivery_status' => 'delivered',
            'rsvp_status' => 'pending',
        ]);

        // Simulate incoming WhatsApp interactive button reply payload
        $payload = [
            'entry' => [
                [
                    'changes' => [
                        [
                            'value' => [
                                'messages' => [
                                    [
                                        'from' => '255712345678',
                                        'type' => 'interactive',
                                        'interactive' => [
                                            'button_reply' => [
                                                'id' => 'will_attend',
                                                'title' => 'Will Attend',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->postJson('/webhooks/whatsapp', $payload);
        $response->assertStatus(200);

        $guest->refresh();
        $this->assertEquals('attending', $guest->rsvp_status);

        // Check that automated message log was recorded
        $this->assertDatabaseHas('messages', [
            'event_id' => $event->id,
            'guest_id' => $guest->id,
            'channel' => 'whatsapp',
            'recipient_phone' => '255712345678',
        ]);

        $latestMessage = Message::where('guest_id', $guest->id)->latest()->first();
        $this->assertStringContainsString('Thank you Alumni Guest 2 (Adv. 4uhU2)! Your RSVP has been confirmed for CRDB Bank Annual Executive Summit 2026', $latestMessage->message_body);
    }
}
