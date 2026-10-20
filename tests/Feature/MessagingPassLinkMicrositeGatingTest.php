<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\FinancialTransaction;
use App\Models\Guest;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessagingPassLinkMicrositeGatingTest extends TestCase
{
    use RefreshDatabase;

    public function test_organizer_without_executive_package_or_override_has_microsite_disabled_in_messaging(): void
    {
        $organizer = User::factory()->create([
            'role' => 'customer',
            'permissions' => array_merge(User::defaultPermissions(), ['can_customize_microsite' => false]),
            'has_payment_override' => true,
        ]);

        $event = Event::create([
            'user_id' => $organizer->id,
            'title' => 'Standard Conference 2026',
            'event_date' => '2026-11-20',
            'venue' => 'Serena Hotel',
            'status' => 'active',
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Asha Bakari',
            'phone' => '+255 712 111 222',
            'unique_code' => 'KDV-001',
            'qr_token' => 'token_asha_001',
            'delivery_status' => 'draft',
            'rsvp_status' => 'pending',
        ]);

        // GET /messaging should provide canCustomizeMicrosite: false
        $response = $this->actingAs($organizer)->get(route('messaging.index', ['event_id' => $event->id]));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Messaging')
            ->where('canCustomizeMicrosite', false)
        );

        // Broadcasting with include_pass_link: true should be stripped/ignored
        $broadcastResponse = $this->actingAs($organizer)->post(route('messaging.broadcast'), [
            'event_id' => $event->id,
            'channel' => 'sms',
            'campaign_type' => 'text_only',
            'target_filter' => 'all',
            'custom_caption' => 'Hello {guest_name}, welcome to the conference.',
            'include_pass_link' => true,
        ]);

        $broadcastResponse->assertStatus(302);

        $sentMessage = Message::where('guest_id', $guest->id)->first();
        $this->assertNotNull($sentMessage);
        $this->assertStringNotContainsString('/card/', $sentMessage->message_body);
        $this->assertStringNotContainsString('Digital Pass & RSVP', $sentMessage->message_body);
    }

    public function test_organizer_with_executive_package_or_admin_override_can_include_pass_link_in_broadcast(): void
    {
        $organizer = User::factory()->create([
            'role' => 'customer',
            'permissions' => array_merge(User::defaultPermissions(), ['can_customize_microsite' => false]),
            'has_payment_override' => true,
        ]);

        $event = Event::create([
            'user_id' => $organizer->id,
            'title' => 'Luxury Executive Gala 2026',
            'event_date' => '2026-11-20',
            'venue' => 'Hyatt Regency Kilimanjaro',
            'status' => 'active',
            'microsite_config' => ['admin_override' => true],
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Baraka John',
            'phone' => '+255 712 333 444',
            'unique_code' => 'KDV-002',
            'qr_token' => 'token_baraka_002',
            'delivery_status' => 'draft',
            'rsvp_status' => 'pending',
        ]);

        // GET /messaging should provide canCustomizeMicrosite: true due to admin override
        $response = $this->actingAs($organizer)->get(route('messaging.index', ['event_id' => $event->id]));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Messaging')
            ->where('canCustomizeMicrosite', true)
        );

        // Broadcasting with include_pass_link: true should append pass URL
        $broadcastResponse = $this->actingAs($organizer)->post(route('messaging.broadcast'), [
            'event_id' => $event->id,
            'channel' => 'sms',
            'campaign_type' => 'text_only',
            'target_filter' => 'all',
            'custom_caption' => 'Hello {guest_name}, welcome to the gala.',
            'include_pass_link' => true,
        ]);

        $broadcastResponse->assertStatus(302);

        $sentMessage = Message::where('guest_id', $guest->id)->first();
        $this->assertNotNull($sentMessage);
        $this->assertStringContainsString('/card/token_baraka_002', $sentMessage->message_body);
        $this->assertStringContainsString('Digital Pass & RSVP:', $sentMessage->message_body);
    }

    public function test_organizer_with_purchased_executive_package_can_include_pass_link_in_broadcast(): void
    {
        $organizer = User::factory()->create([
            'role' => 'customer',
            'permissions' => array_merge(User::defaultPermissions(), ['can_customize_microsite' => false]),
            'has_payment_override' => true,
        ]);

        // Completed executive package transaction
        FinancialTransaction::create([
            'transaction_number' => 'TRX-EXEC-PKG-99',
            'type' => 'income',
            'category' => 'package_purchase',
            'title' => 'Package Purchase: Executive (200 cards @ 2,500 TZS)',
            'amount' => 500000,
            'currency' => 'TZS',
            'payment_method' => 'M-Pesa',
            'reference' => 'PKG-4',
            'user_id' => $organizer->id,
            'status' => 'completed',
            'transaction_date' => now(),
            'notes' => json_encode(['package_id' => 4, 'package_name' => 'Executive']),
        ]);

        $event = Event::create([
            'user_id' => $organizer->id,
            'title' => 'Royal Reception 2026',
            'event_date' => '2026-11-20',
            'venue' => 'Serena Hotel',
            'status' => 'active',
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Khadija Mwinyi',
            'phone' => '+255 712 555 666',
            'unique_code' => 'KDV-003',
            'qr_token' => 'token_khadija_003',
            'delivery_status' => 'draft',
            'rsvp_status' => 'pending',
        ]);

        $response = $this->actingAs($organizer)->get(route('messaging.index', ['event_id' => $event->id]));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Messaging')
            ->where('canCustomizeMicrosite', true)
        );

        $broadcastResponse = $this->actingAs($organizer)->post(route('messaging.broadcast'), [
            'event_id' => $event->id,
            'channel' => 'sms',
            'campaign_type' => 'text_only',
            'target_filter' => 'all',
            'custom_caption' => 'Hello {guest_name}, welcome.',
            'include_pass_link' => true,
        ]);

        $broadcastResponse->assertStatus(302);

        $sentMessage = Message::where('guest_id', $guest->id)->first();
        $this->assertNotNull($sentMessage);
        $this->assertStringContainsString('/card/token_khadija_003', $sentMessage->message_body);
    }

    public function test_messaging_hub_recent_messages_reflect_selected_event(): void
    {
        $organizer = User::factory()->create([
            'role' => 'customer',
            'has_payment_override' => true,
        ]);

        $eventA = Event::create([
            'user_id' => $organizer->id,
            'title' => 'Event A Wedding',
            'event_date' => '2026-11-20',
            'venue' => 'Venue A',
            'status' => 'active',
        ]);

        $eventB = Event::create([
            'user_id' => $organizer->id,
            'title' => 'Event B Gala',
            'event_date' => '2026-12-10',
            'venue' => 'Venue B',
            'status' => 'active',
        ]);

        $guestA = Guest::create([
            'event_id' => $eventA->id,
            'name' => 'Guest Alpha',
            'phone' => '+255711000001',
            'unique_code' => 'KDV-A01',
            'qr_token' => 'token_a01',
        ]);

        $guestB = Guest::create([
            'event_id' => $eventB->id,
            'name' => 'Guest Beta',
            'phone' => '+255711000002',
            'unique_code' => 'KDV-B01',
            'qr_token' => 'token_b01',
        ]);

        Message::create([
            'event_id' => $eventA->id,
            'guest_id' => $guestA->id,
            'channel' => 'whatsapp',
            'recipient_phone' => $guestA->phone,
            'message_body' => 'Invite for Event A',
            'status' => 'delivered',
        ]);

        Message::create([
            'event_id' => $eventB->id,
            'guest_id' => $guestB->id,
            'channel' => 'sms',
            'recipient_phone' => $guestB->phone,
            'message_body' => 'Invite for Event B',
            'status' => 'sent',
        ]);

        $responseA = $this->actingAs($organizer)->get(route('messaging.index', ['event_id' => $eventA->id]));
        $responseA->assertStatus(200);
        $responseA->assertInertia(fn ($page) => $page
            ->component('Customer/Messaging')
            ->where('selectedEvent.id', $eventA->id)
            ->has('recentMessages', 1)
            ->where('recentMessages.0.event_id', $eventA->id)
        );

        $responseB = $this->actingAs($organizer)->get(route('messaging.index', ['event_id' => $eventB->id]));
        $responseB->assertStatus(200);
        $responseB->assertInertia(fn ($page) => $page
            ->component('Customer/Messaging')
            ->where('selectedEvent.id', $eventB->id)
            ->has('recentMessages', 1)
            ->where('recentMessages.0.event_id', $eventB->id)
        );
    }
}
