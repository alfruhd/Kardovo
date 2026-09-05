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

    public function test_admin_can_test_whatsapp_gateway_connection()
    {
        \Illuminate\Support\Facades\Http::fake([
            'https://graph.facebook.com/v20.0/108492019482910*' => \Illuminate\Support\Facades\Http::response([
                'id' => '108492019482910',
                'display_phone_number' => '+1 555-0100',
                'verified_name' => 'Kardovo Access Systems',
                'quality_rating' => 'GREEN',
            ], 200),
        ]);

        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/admin/gateway/test', [
            'gateway_type' => 'whatsapp',
            'config' => [
                'phone_number_id' => '108492019482910',
                'access_token' => 'EAAG_test_real_token',
                'api_version' => 'v20.0',
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $this->assertStringContainsString('Kardovo Access Systems', $response->json('message'));
    }

    public function test_admin_test_gateway_handles_meta_api_failure()
    {
        \Illuminate\Support\Facades\Http::fake([
            'https://graph.facebook.com/v20.0/invalid_phone_id*' => \Illuminate\Support\Facades\Http::response([
                'error' => [
                    'message' => 'Invalid OAuth access token.',
                    'code' => 190,
                ],
            ], 400),
        ]);

        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->postJson('/admin/gateway/test', [
            'gateway_type' => 'whatsapp',
            'config' => [
                'phone_number_id' => 'invalid_phone_id',
                'access_token' => 'expired_token',
                'api_version' => 'v20.0',
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
        ]);
        $this->assertStringContainsString('Meta API Authentication Failed', $response->json('message'));
    }

    public function test_meta_webhook_handles_delivery_status_callbacks()
    {
        $user = User::factory()->create(['role' => 'customer']);
        $event = Event::create([
            'user_id' => $user->id,
            'title' => 'CRDB Bank Gala 2026',
            'event_type' => 'Corporate Conference',
            'event_date' => '2026-10-05',
            'event_time' => '9:00 AM',
            'venue' => 'Julius Nyerere Convention Centre',
            'city' => 'Dar es Salaam',
            'status' => 'active',
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Alfred Test User',
            'phone' => '+255 767 749 919',
            'unique_code' => '99887766',
            'qr_token' => 'token_status_test_123',
            'category' => 'VIP',
            'max_entries' => 2,
            'entries_used' => 0,
            'delivery_status' => 'sent',
            'rsvp_status' => 'pending',
        ]);

        $message = Message::create([
            'event_id' => $guest->event_id,
            'guest_id' => $guest->id,
            'channel' => 'whatsapp',
            'recipient_phone' => '255767749919',
            'message_body' => 'Your invitation is ready',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $payload = [
            'entry' => [
                [
                    'changes' => [
                        [
                            'value' => [
                                'statuses' => [
                                    [
                                        'id' => 'wamid.test_status_123',
                                        'recipient_id' => '255767749919',
                                        'status' => 'delivered',
                                        'timestamp' => '1725439200',
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/api/webhooks/whatsapp', $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'status' => 'delivered',
        ]);

        $this->assertDatabaseHas('guests', [
            'id' => $guest->id,
            'delivery_status' => 'delivered',
        ]);
    }

    public function test_broadcast_uses_public_webhook_base_url_and_updates_event_template()
    {
        $user = User::factory()->create(['role' => 'customer']);
        $template = \App\Models\CardTemplate::create([
            'user_id' => $user->id,
            'name' => 'Custom Art Luxury Pass',
            'template_type' => 'custom_art',
            'headline' => 'EXCLUSIVE VIP INVITATION',
        ]);

        $event = Event::create([
            'user_id' => $user->id,
            'title' => 'Tanzania Tech Summit 2026',
            'event_type' => 'Technology Summit',
            'event_date' => '2026-11-20',
            'event_time' => '10:00 AM',
            'venue' => 'Mlimani City Conference Centre',
            'city' => 'Dar es Salaam',
            'status' => 'active',
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Jimmy Kaaya',
            'phone' => '+255 767 749 919',
            'unique_code' => '84920194',
            'qr_token' => 'kdv_jimmy_kaaya_84920194',
            'category' => 'VIP Access',
            'delivery_status' => 'draft',
            'rsvp_status' => 'pending',
        ]);

        \App\Models\SystemSetting::set('whatsapp_gateway', [
            'webhook_url' => 'https://62c20482554209.lhr.life/api/webhooks/whatsapp',
        ]);

        $response = $this->actingAs($user)->post('/messaging/broadcast', [
            'event_id' => $event->id,
            'card_template_id' => $template->id,
            'channel' => 'whatsapp',
            'campaign_type' => 'pass_invitation',
            'target_filter' => 'all',
            'selected_guest_ids' => [$guest->id],
        ]);

        $response->assertSessionHas('success');

        // Check event template updated
        $this->assertEquals($template->id, $event->fresh()->card_template_id);

        // Check message body is clean and personalized
        $latestMessage = Message::where('guest_id', $guest->id)->latest()->first();
        $this->assertNotNull($latestMessage);
        $this->assertStringContainsString('Habari Jimmy Kaaya!', $latestMessage->message_body);
        $this->assertStringNotContainsString('🎟️ *View Digital Pass & RSVP:*', $latestMessage->message_body);
    }

    public function test_whatsapp_webhook_handles_interactive_button_reply_with_token_payload()
    {
        $user = User::factory()->create(['role' => 'customer']);
        $event = Event::create([
            'user_id' => $user->id,
            'title' => 'Serengeti Gala 2026',
            'event_type' => 'Gala Dinner',
            'event_date' => '2026-12-10',
            'venue' => 'Hyatt Regency Kilimanjaro',
            'city' => 'Dar es Salaam',
            'status' => 'active',
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Neema Baraka',
            'phone' => '+255 712 999 888',
            'unique_code' => '77665544',
            'qr_token' => 'kdv_token_interactive_rsvp',
            'category' => 'Double Entry',
            'delivery_status' => 'delivered',
            'rsvp_status' => 'pending',
        ]);

        $payload = [
            'entry' => [
                [
                    'changes' => [
                        [
                            'value' => [
                                'messages' => [
                                    [
                                        'from' => '255712999888',
                                        'id' => 'wamid.interactive_btn_123',
                                        'type' => 'interactive',
                                        'interactive' => [
                                            'type' => 'button_reply',
                                            'button_reply' => [
                                                'id' => 'rsvp_yes_kdv_token_interactive_rsvp',
                                                'title' => '✅ Attending',
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/api/webhooks/whatsapp', $payload);
        $response->assertStatus(200);

        $this->assertEquals('attending', $guest->fresh()->rsvp_status);
    }

    public function test_sms_webhook_handles_inbound_text_and_swahili_keywords()
    {
        $user = User::factory()->create(['role' => 'customer']);
        $event = Event::create([
            'user_id' => $user->id,
            'title' => 'Zanzibar Retreat',
            'event_type' => 'Retreat',
            'event_date' => '2026-11-20',
            'venue' => 'Zanzibar Serena',
            'city' => 'Zanzibar',
            'status' => 'active',
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Juma Khamis',
            'phone' => '+255 777 111 222',
            'unique_code' => '99887766',
            'qr_token' => 'kdv_juma_khamis_99887766',
            'category' => 'Single Entry',
            'delivery_status' => 'delivered',
            'rsvp_status' => 'pending',
        ]);

        // 1. Swahili text reply "Nitahudhuria"
        $response = $this->postJson('/webhooks/sms', [
            'from' => '255777111222',
            'text' => 'Nitahudhuria asante sana!',
        ]);
        $response->assertStatus(200);
        $this->assertEquals('attending', $guest->fresh()->rsvp_status);

        // 2. Swahili text reply "Sitahudhuria samahani"
        $response = $this->postJson('/webhooks/sms', [
            'from' => '255777111222',
            'text' => 'Samahani sitaweza kufika',
        ]);
        $response->assertStatus(200);
        $this->assertEquals('declined', $guest->fresh()->rsvp_status);
    }

    public function test_whatsapp_webhook_handles_delivery_and_read_receipts()
    {
        $user = User::factory()->create(['role' => 'customer']);
        $event = Event::create([
            'user_id' => $user->id,
            'title' => 'Tech Summit 2026',
            'event_type' => 'Summit',
            'event_date' => '2026-10-15',
            'venue' => 'Mlimani City',
            'city' => 'Dar es Salaam',
            'status' => 'active',
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Sara Mbise',
            'phone' => '+255 765 444 333',
            'unique_code' => '55443322',
            'qr_token' => 'kdv_sara_mbise_55443322',
            'category' => 'VIP Access',
            'delivery_status' => 'sent',
            'rsvp_status' => 'pending',
        ]);

        $message = Message::create([
            'event_id' => $event->id,
            'guest_id' => $guest->id,
            'channel' => 'whatsapp',
            'recipient_phone' => '255765444333',
            'message_body' => 'Invitation pass',
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        // 1. Meta sends "delivered" receipt
        $deliveredPayload = [
            'entry' => [
                [
                    'changes' => [
                        [
                            'value' => [
                                'statuses' => [
                                    [
                                        'id' => 'wamid.test_delivered_123',
                                        'recipient_id' => '255765444333',
                                        'status' => 'delivered',
                                        'timestamp' => time(),
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/webhooks/whatsapp', $deliveredPayload);
        $response->assertStatus(200);

        $this->assertEquals('delivered', $guest->fresh()->delivery_status);
        $this->assertEquals('delivered', $message->fresh()->status);
        $this->assertNotNull($message->fresh()->delivered_at);

        // 2. Meta sends "read" receipt (blue double check)
        $readPayload = [
            'entry' => [
                [
                    'changes' => [
                        [
                            'value' => [
                                'statuses' => [
                                    [
                                        'id' => 'wamid.test_read_123',
                                        'recipient_id' => '255765444333',
                                        'status' => 'read',
                                        'timestamp' => time(),
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/webhooks/whatsapp', $readPayload);
        $response->assertStatus(200);

        $this->assertEquals('read', $guest->fresh()->delivery_status);
        $this->assertEquals('read', $message->fresh()->status);
        $this->assertNotNull($message->fresh()->read_at);
    }
}
