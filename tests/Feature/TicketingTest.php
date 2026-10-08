<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Ticket;
use App\Models\TicketOrder;
use App\Models\TicketTier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TicketingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_user_can_access_independent_ticketing_portal(): void
    {
        $organizer = User::where('role', 'customer')->first();
        $event = Event::first();
        $event->update(['user_id' => $organizer->id, 'ticketing_enabled' => true]);

        TicketTier::factory()->create(['event_id' => $event->id, 'name' => 'VIP Tier']);

        $response = $this->actingAs($organizer)->get(route('ticketing.index', ['event_id' => $event->id]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/TicketingPortal')
            ->has('events')
            ->has('selectedEvent')
            ->has('globalStats')
            ->has('selectedEventTiers', 1)
        );
    }

    public function test_organizer_can_create_ticket_tier(): void
    {
        $event = Event::first();
        $organizer = $event->user;
        $event->update(['ticketing_enabled' => false]);

        $response = $this->actingAs($organizer)->post(route('events.ticketTiers.store', $event->id), [
            'name' => 'VIP Admission',
            'description' => 'Access to VIP lounge and gift bag',
            'price' => 50000,
            'capacity' => 50,
            'max_per_order' => 5,
            'color' => '#8b5cf6',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('ticket_tiers', [
            'event_id' => $event->id,
            'name' => 'VIP Admission',
            'price' => 50000,
            'capacity' => 50,
        ]);

        // Auto-enables ticketing on the event
        $this->assertTrue($event->fresh()->ticketing_enabled);
    }

    public function test_organizer_can_update_ticket_tier_and_settings(): void
    {
        $event = Event::first();
        $organizer = $event->user;
        $tier = TicketTier::factory()->create(['event_id' => $event->id, 'name' => 'Early Bird', 'price' => 20000]);

        // Update Tier
        $tierResponse = $this->actingAs($organizer)->put(route('events.ticketTiers.update', [$event->id, $tier->id]), [
            'name' => 'Early Bird Special',
            'price' => 25000,
            'capacity' => 80,
            'status' => 'active',
            'color' => '#10b981',
        ]);

        $tierResponse->assertStatus(302);
        $this->assertDatabaseHas('ticket_tiers', [
            'id' => $tier->id,
            'name' => 'Early Bird Special',
            'price' => 25000,
        ]);

        // Update Settings
        $settingsResponse = $this->actingAs($organizer)->put(route('events.ticketingSettings', $event->id), [
            'ticketing_enabled' => true,
            'ticket_currency' => 'TZS',
            'ticket_instructions' => 'Please arrive 30 mins before showtime.',
        ]);

        $settingsResponse->assertStatus(302);
        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'ticket_currency' => 'TZS',
            'ticket_instructions' => 'Please arrive 30 mins before showtime.',
        ]);
    }

    public function test_attendee_can_view_public_ticket_portal(): void
    {
        $event = Event::first();
        $event->update(['ticketing_enabled' => true]);
        TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Standard Pass',
            'price' => 15000,
            'status' => 'active',
        ]);

        $response = $this->get(route('events.publicTickets', $event->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/EventTickets')
            ->has('event')
            ->has('tiers', 1)
        );
    }

    public function test_attendee_can_checkout_tickets_and_order_is_generated(): void
    {
        $event = Event::first();
        $event->update(['ticketing_enabled' => true]);
        $tier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'General Admission',
            'price' => 20000,
            'capacity' => 100,
            'sold_count' => 0,
            'status' => 'active',
        ]);

        $checkoutData = [
            'buyer_name' => 'Juma Rashidi',
            'buyer_phone' => '0712345678',
            'buyer_email' => 'juma@example.com',
            'items' => [
                [
                    'tier_id' => $tier->id,
                    'quantity' => 2,
                ],
            ],
            'attendees' => [
                ['name' => 'Juma Rashidi'],
                ['name' => 'Amina Rashidi'],
            ],
        ];

        $response = $this->post(route('tickets.checkout', $event->id), $checkoutData);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Check that order was created
        $this->assertDatabaseHas('ticket_orders', [
            'event_id' => $event->id,
            'buyer_name' => 'Juma Rashidi',
            'buyer_phone' => '255712345678',
            'total_amount' => 40000,
            'payment_status' => 'paid',
        ]);

        // Check that 2 tickets were created
        $this->assertEquals(2, Ticket::where('event_id', $event->id)->count());

        // Check that tier sold count incremented
        $this->assertEquals(2, $tier->fresh()->sold_count);
    }

    public function test_attendee_can_view_public_digital_pass(): void
    {
        $event = Event::first();
        $tier = TicketTier::factory()->create(['event_id' => $event->id]);
        $order = TicketOrder::factory()->create(['event_id' => $event->id]);
        $ticket = Ticket::factory()->create([
            'event_id' => $event->id,
            'ticket_order_id' => $order->id,
            'ticket_tier_id' => $tier->id,
            'ticket_number' => 'TKT-TEST-9999',
            'attendee_name' => 'Said Mwamba',
        ]);

        $response = $this->get(route('tickets.publicPass', $ticket->ticket_number));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/DigitalTicketPass')
            ->has('ticket')
            ->where('ticket.ticket_number', 'TKT-TEST-9999')
            ->where('ticket.attendee_name', 'Said Mwamba')
        );
    }

    public function test_attendee_can_download_ticket_pdf(): void
    {
        $event = Event::first();
        $tier = TicketTier::factory()->create(['event_id' => $event->id]);
        $order = TicketOrder::factory()->create(['event_id' => $event->id]);
        $ticket = Ticket::factory()->create([
            'event_id' => $event->id,
            'ticket_order_id' => $order->id,
            'ticket_tier_id' => $tier->id,
            'ticket_number' => 'TKT-PDF-1234',
        ]);

        $response = $this->get(route('tickets.downloadPdf', $ticket->ticket_number));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_attendee_can_dispatch_ticket_via_email(): void
    {
        Mail::fake();

        $event = Event::first();
        $tier = TicketTier::factory()->create(['event_id' => $event->id]);
        $order = TicketOrder::factory()->create(['event_id' => $event->id]);
        $ticket = Ticket::factory()->create([
            'event_id' => $event->id,
            'ticket_order_id' => $order->id,
            'ticket_tier_id' => $tier->id,
            'ticket_number' => 'TKT-EMAIL-1234',
            'attendee_email' => 'attendee@example.com',
        ]);

        $response = $this->post(route('tickets.sendEmail', $ticket->ticket_number), [
            'email' => 'attendee@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    public function test_gate_scanner_validates_ticket_qr_code(): void
    {
        $scanner = User::where('role', 'scanner')->first() ?? User::factory()->create(['role' => 'scanner']);
        $event = Event::first();
        $scanner->assignedEvents()->syncWithoutDetaching([$event->id]);

        $tier = TicketTier::factory()->create(['event_id' => $event->id]);
        $order = TicketOrder::factory()->create(['event_id' => $event->id]);
        $ticket = Ticket::factory()->create([
            'event_id' => $event->id,
            'ticket_order_id' => $order->id,
            'ticket_tier_id' => $tier->id,
            'qr_token' => 'qr_tok_test_ticketing_gate_scan',
            'status' => 'valid',
        ]);

        // Perform gate scan
        $response = $this->actingAs($scanner)->postJson(route('scanner.validate'), [
            'event_id' => $event->id,
            'qr_code' => 'qr_tok_test_ticketing_gate_scan',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'granted',
            'ticket' => [
                'card_number' => $ticket->ticket_number,
            ],
        ]);

        // Ticket status should be updated to checked_in
        $this->assertEquals('checked_in', $ticket->fresh()->status);
        $this->assertNotNull($ticket->fresh()->checked_in_at);

        // ScanLog recorded
        $this->assertDatabaseHas('scan_logs', [
            'event_id' => $event->id,
            'ticket_id' => $ticket->id,
            'status' => 'granted',
        ]);
    }

    public function test_public_ticket_marketplace_is_accessible_without_authentication(): void
    {
        $response = $this->get(route('tickets.marketplace'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/TicketMarketplace')
            ->has('occasions')
            ->has('categoryCounts')
            ->has('currentCategory')
        );
    }

    public function test_public_ticket_marketplace_filters_by_category(): void
    {
        $event = Event::first();
        $event->update([
            'is_public' => true,
            'ticketing_enabled' => true,
            'occasion_type' => 'flight',
            'title' => 'Serengeti Express Air Charter',
        ]);

        $response = $this->get(route('tickets.marketplace', ['category' => 'flights']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/TicketMarketplace')
            ->where('currentCategory', 'flights')
            ->has('occasions')
        );
    }

    public function test_organizer_can_create_ticketed_occasion_via_portal(): void
    {
        $organizer = User::where('role', 'customer')->first();

        $response = $this->actingAs($organizer)->post(route('ticketing.occasions.store'), [
            'title' => 'Zanzibar White Beach Fest 2026',
            'occasion_type' => 'concert',
            'event_date' => now()->addDays(30)->toDateString(),
            'event_time' => '19:00 EAT',
            'venue' => 'Kendwa Rocks Beach Arena',
            'city' => 'Zanzibar',
            'description' => 'Annual full moon music festival with international DJs.',
            'cover_photo' => 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14',
            'ticket_currency' => 'TZS',
            'ticket_instructions' => 'Present digital QR pass at the entrance tent.',
            'is_public' => true,
            'initial_tier_name' => 'VIP Early Access',
            'initial_tier_price' => 75000,
            'initial_tier_capacity' => 150,
        ]);

        $response->assertStatus(302);

        $this->assertDatabaseHas('events', [
            'user_id' => $organizer->id,
            'title' => 'Zanzibar White Beach Fest 2026',
            'occasion_type' => 'concert',
            'venue' => 'Kendwa Rocks Beach Arena',
            'city' => 'Zanzibar',
            'ticketing_enabled' => true,
            'is_public' => true,
        ]);

        $createdEvent = Event::where('title', 'Zanzibar White Beach Fest 2026')->first();
        $this->assertNotNull($createdEvent);

        $this->assertDatabaseHas('ticket_tiers', [
            'event_id' => $createdEvent->id,
            'name' => 'VIP Early Access',
            'price' => 75000,
            'capacity' => 150,
        ]);
    }

    public function test_sold_out_tier_displays_as_sold_out_and_is_not_available(): void
    {
        $event = Event::first();
        $event->update(['ticketing_enabled' => true]);

        $soldOutTier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Sold Out VIP',
            'capacity' => 10,
            'sold_count' => 10,
            'status' => 'sold_out',
        ]);

        $this->assertTrue($soldOutTier->is_sold_out);
        $this->assertFalse($soldOutTier->is_available);
        $this->assertEquals(0, $soldOutTier->remaining_count);

        $response = $this->get(route('events.publicTickets', $event->id));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/EventTickets')
            ->where('tiers.0.is_sold_out', true)
        );
    }

    public function test_event_with_all_sold_out_tiers_reports_is_sold_out(): void
    {
        $event = Event::first();
        $event->update(['ticketing_enabled' => true]);
        $event->ticketTiers()->delete();

        TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'All Sold Tier',
            'capacity' => 5,
            'sold_count' => 5,
            'status' => 'sold_out',
        ]);

        $response = $this->get(route('events.publicTickets', $event->id));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/EventTickets')
            ->where('event.is_sold_out', true)
        );
    }

    public function test_checkout_rejects_purchase_of_sold_out_tier(): void
    {
        $event = Event::first();
        $event->update(['ticketing_enabled' => true]);

        $soldOutTier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Full Tier',
            'capacity' => 20,
            'sold_count' => 20,
            'status' => 'sold_out',
        ]);

        $response = $this->postJson(route('tickets.checkout', $event->id), [
            'buyer_name' => 'Asha Ali',
            'buyer_phone' => '0712345678',
            'buyer_email' => 'asha@example.com',
            'items' => [
                ['tier_id' => $soldOutTier->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('sold out', strtolower($response->json('error')));
    }

    public function test_tier_automatically_switches_to_sold_out_when_capacity_reached_during_checkout(): void
    {
        $event = Event::first();
        $event->update(['ticketing_enabled' => true]);

        $tier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Last Seat',
            'capacity' => 1,
            'sold_count' => 0,
            'status' => 'active',
        ]);

        $response = $this->postJson(route('tickets.checkout', $event->id), [
            'buyer_name' => 'Baraka John',
            'buyer_phone' => '0754123456',
            'buyer_email' => 'baraka@example.com',
            'items' => [
                ['tier_id' => $tier->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200);

        $freshTier = $tier->fresh();
        $this->assertEquals(1, $freshTier->sold_count);
        $this->assertEquals(0, $freshTier->remaining_count);
        $this->assertEquals('sold_out', $freshTier->status);
        $this->assertTrue($freshTier->is_sold_out);
    }

    public function test_checkout_records_payment_phone_and_carrier(): void
    {
        $event = Event::first();
        $event->update(['ticketing_enabled' => true]);

        $tier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Standard Access',
            'price' => 15000,
            'capacity' => 10,
            'status' => 'active',
        ]);

        $response = $this->postJson(route('tickets.checkout', $event->id), [
            'buyer_name' => 'Juma Rashidi',
            'buyer_phone' => '0712334455',
            'payment_phone' => '0754998877',
            'carrier' => 'M-Pesa',
            'payment_method' => 'Mobile Money (M-Pesa)',
            'items' => [
                ['tier_id' => $tier->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200);
        $order = TicketOrder::latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals('M-Pesa', $order->metadata['carrier'] ?? null);
        $this->assertEquals('255754998877', $order->metadata['payment_phone'] ?? null);
    }

    public function test_organizer_can_update_ticket_template_styling(): void
    {
        $event = Event::first();
        $organizer = $event->user;

        $response = $this->actingAs($organizer)->put(route('events.ticketTemplate.update', $event->id), [
            'template_style' => 'boarding_pass',
            'bg_color' => '#0F172A',
            'accent_color' => '#2563eb',
            'badge_text' => 'BOARDING PASS',
            'custom_instructions' => 'Present at Gate 3. ID required.',
            'show_confetti' => false,
            'show_barcode' => true,
            'show_artwork' => false,
        ]);

        $response->assertStatus(302);
        $freshEvent = $event->fresh();
        $this->assertEquals('boarding_pass', $freshEvent->ticket_template_config['template_style']);
        $this->assertEquals('#0F172A', $freshEvent->ticket_template_config['bg_color']);
        $this->assertEquals('#2563eb', $freshEvent->ticket_template_config['accent_color']);
        $this->assertEquals('BOARDING PASS', $freshEvent->ticket_template_config['badge_text']);
        $this->assertEquals('Present at Gate 3. ID required.', $freshEvent->ticket_template_config['custom_instructions']);
        $this->assertFalse($freshEvent->ticket_template_config['show_confetti']);
    }

    public function test_organizer_can_customize_ticket_left_and_right_qr_stub(): void
    {
        $event = Event::first();
        $organizer = $event->user;

        $response = $this->actingAs($organizer)->put(route('events.ticketTemplate.update', $event->id), [
            'accent_color' => '#10B981',
            'right_bg_color' => '#0B1324',
            'right_overlay' => 'accent_border',
            'left_design_mode' => 'custom',
            'left_bg_color' => '#000000',
            'badge_text' => 'VIP PASS',
            'custom_instructions' => 'Gate 2 admission only.',
            'show_barcode' => true,
        ]);

        $response->assertStatus(302);
        $freshEvent = $event->fresh();
        $config = $freshEvent->ticket_template_config;

        $this->assertEquals('#10B981', $config['accent_color']);
        $this->assertEquals('#0B1324', $config['right_bg_color']);
        $this->assertEquals('accent_border', $config['right_overlay']);
        $this->assertEquals('custom', $config['left_design_mode']);
        $this->assertEquals('#000000', $config['left_bg_color']);
        $this->assertEquals('VIP PASS', $config['badge_text']);
        $this->assertEquals('Gate 2 admission only.', $config['custom_instructions']);
        $this->assertTrue($config['show_barcode']);
    }

    public function test_organizer_can_batch_generate_physical_tickets(): void
    {
        $event = Event::first();
        $organizer = $event->user;

        $tier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Door Admission',
            'price' => 20000,
            'capacity' => 100,
            'sold_count' => 0,
            'status' => 'active',
        ]);

        $initialTicketsCount = Ticket::where('ticket_tier_id', $tier->id)->count();

        $response = $this->actingAs($organizer)->post(route('events.tickets.batchGenerate', $event->id), [
            'tier_id' => $tier->id,
            'quantity' => 15,
            'distribution_label' => 'Main Gate Booth',
            'attendee_prefix' => 'Gate Pass',
        ]);

        $response->assertStatus(302);
        $this->assertEquals($initialTicketsCount + 15, Ticket::where('ticket_tier_id', $tier->id)->count());
        $this->assertEquals(15, $tier->fresh()->sold_count);

        $firstBatchTicket = Ticket::where('ticket_tier_id', $tier->id)->latest()->first();
        $this->assertStringContainsString('Gate Pass #', $firstBatchTicket->attendee_name);
    }

    public function test_organizer_can_view_printable_ticket_sheets(): void
    {
        $event = Event::first();
        $organizer = $event->user;

        $tier = TicketTier::factory()->create(['event_id' => $event->id]);
        Ticket::factory()->create(['event_id' => $event->id, 'ticket_tier_id' => $tier->id]);

        $response = $this->actingAs($organizer)->get(route('events.tickets.printSheet', $event->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/PrintTicketSheet')
            ->has('event')
            ->has('tickets')
            ->has('tiers')
        );
    }

    public function test_organizer_can_export_tickets_to_csv(): void
    {
        $event = Event::first();
        $organizer = $event->user;

        $tier = TicketTier::factory()->create(['event_id' => $event->id]);
        Ticket::factory()->create(['event_id' => $event->id, 'ticket_tier_id' => $tier->id]);

        $response = $this->actingAs($organizer)->get(route('events.tickets.exportCsv', $event->id));

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('content-type'));
    }

    public function test_organizer_can_configure_connected_payout_account(): void
    {
        $event = Event::first();
        $organizer = $event->user;

        $response = $this->actingAs($organizer)->post(route('events.ticketingSettings', $event->id), [
            'ticketing_enabled' => true,
            'ticket_currency' => 'TZS',
            'payout_method' => 'mobile_money',
            'payout_provider' => 'M-Pesa (Vodacom)',
            'payout_account_number' => '0754112233',
            'payout_account_name' => 'Safari Events Organizer',
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasNoErrors();

        $freshEvent = $event->fresh();
        $this->assertEquals('mobile_money', $freshEvent->payout_method);
        $this->assertEquals('M-Pesa (Vodacom)', $freshEvent->payout_provider);
        $this->assertEquals('0754112233', $freshEvent->payout_account_number);
        $this->assertEquals('Safari Events Organizer', $freshEvent->payout_account_name);
        $this->assertEquals('active', $freshEvent->payout_status);
    }

    public function test_checkout_calculates_6_percent_kardovo_fee_and_94_percent_organizer_net(): void
    {
        $event = Event::first();
        $event->update([
            'ticketing_enabled' => true,
            'payout_method' => 'bank',
            'payout_provider' => 'CRDB Bank',
            'payout_account_number' => '0150244983000',
            'payout_account_name' => 'Grand Gala Organizers',
        ]);

        $tier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Gala Dinner Pass',
            'price' => 100000,
            'capacity' => 10,
            'status' => 'active',
        ]);

        $response = $this->postJson(route('tickets.checkout', $event->id), [
            'buyer_name' => 'Salim Bakari',
            'buyer_phone' => '0712334455',
            'items' => [
                ['tier_id' => $tier->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200);

        $order = TicketOrder::latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals(100000, (float) $order->subtotal);
        $this->assertEquals(6.00, (float) $order->platform_fee_percent);
        $this->assertEquals(6000, (float) $order->platform_fee); // 6% of 100,000 = 6,000
        $this->assertEquals(94000, (float) $order->organizer_net_amount); // 94% of 100,000 = 94,000
        $this->assertEquals(100000, (float) $order->total_amount);
        $this->assertEquals('CRDB Bank', $order->metadata['payout_provider']);
        $this->assertEquals('0150244983000', $order->metadata['payout_account_number']);
    }
}
