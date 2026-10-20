<?php

namespace Tests\Feature;

use App\Models\DiscountCode;
use App\Models\Event;
use App\Models\FinancialTransaction;
use App\Models\PaymentLedgerEntry;
use App\Models\Ticket;
use App\Models\TicketOrder;
use App\Models\TicketTier;
use App\Models\User;
use App\Models\WristbandOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use LogicException;
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

    public function test_public_how_it_works_page_renders_successfully(): void
    {
        $response = $this->get(route('tickets.how-it-works'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/HowItWorks')
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
        $response->assertJson([
            'success' => true,
            'status' => 'PENDING',
            'is_paid' => false,
        ]);

        // Check that order was created with pending payment status
        $this->assertDatabaseHas('ticket_orders', [
            'event_id' => $event->id,
            'buyer_name' => 'Juma Rashidi',
            'buyer_phone' => '255712345678',
            'total_amount' => 40000,
            'payment_status' => 'pending',
        ]);

        // Check that 2 tickets were created with pending status
        $this->assertEquals(2, Ticket::where('event_id', $event->id)->count());
        $this->assertEquals(2, Ticket::where('event_id', $event->id)->where('status', 'pending')->count());

        // Check that tier sold count incremented
        $this->assertEquals(2, $tier->fresh()->sold_count);
    }

    public function test_unpaid_ticket_cannot_be_viewed_downloaded_or_admitted_until_payment_is_verified(): void
    {
        $scanner = User::where('role', 'scanner')->first() ?? User::factory()->create(['role' => 'scanner']);
        $event = Event::first();
        $scanner->assignedEvents()->syncWithoutDetaching([$event->id]);

        $tier = TicketTier::factory()->create(['event_id' => $event->id]);
        $order = TicketOrder::factory()->create([
            'event_id' => $event->id,
            'payment_status' => 'pending',
            'paid_at' => null,
        ]);
        $ticket = Ticket::factory()->create([
            'event_id' => $event->id,
            'ticket_order_id' => $order->id,
            'ticket_tier_id' => $tier->id,
            'ticket_number' => 'TKT-PENDING-001',
            'status' => 'pending',
        ]);

        // 1. Digital pass view must be gated behind TicketPaymentPending (no QR token exposed)
        $passResponse = $this->get(route('tickets.publicPass', $ticket->ticket_number));
        $passResponse->assertStatus(200);
        $passResponse->assertInertia(fn ($page) => $page
            ->component('Public/TicketPaymentPending')
            ->has('ticket')
            ->where('ticket.ticket_number', 'TKT-PENDING-001')
            ->missing('qrDataUri')
        );

        // 2. Download PDF must be strictly forbidden (403)
        $pdfResponse = $this->get(route('tickets.downloadPdf', $ticket->ticket_number));
        $pdfResponse->assertStatus(403);

        // 3. Dispatch actions must be rejected (403)
        $emailResponse = $this->post(route('tickets.sendEmail', $ticket->ticket_number), ['email' => 'attendee@example.com']);
        $emailResponse->assertStatus(403);

        // 4. Gate scanning must be rejected
        $scanResponse = $this->actingAs($scanner)->postJson(route('scanner.validate'), [
            'event_id' => $event->id,
            'qr_code' => $ticket->qr_token,
        ]);
        $scanResponse->assertStatus(200);
        $scanResponse->assertJson([
            'status' => 'rejected',
        ]);
        $this->assertStringContainsString('Payment Unverified', $scanResponse->json('reason'));

        // 5. Verify payment through verified order endpoint
        $verifyResponse = $this->post(route('tickets.verifyPayment', $order->order_number));
        $verifyResponse->assertStatus(200);
        $verifyResponse->assertJson([
            'success' => true,
            'is_paid' => true,
            'status' => 'CONFIRMED',
        ]);

        $this->assertEquals('paid', $order->fresh()->payment_status);
        $this->assertEquals('valid', $ticket->fresh()->status);

        // 6. After payment is verified, digital pass opens with valid QR pass
        $unlockedPassResponse = $this->get(route('tickets.publicPass', $ticket->ticket_number));
        $unlockedPassResponse->assertStatus(200);
        $unlockedPassResponse->assertInertia(fn ($page) => $page
            ->component('Public/DigitalTicketPass')
            ->has('qrDataUri')
        );

        // 7. Download PDF succeeds
        $unlockedPdfResponse = $this->get(route('tickets.downloadPdf', $ticket->ticket_number));
        $unlockedPdfResponse->assertStatus(200);
        $unlockedPdfResponse->assertHeader('content-type', 'application/pdf');

        // 8. Gate scan succeeds and admits ticket holder
        $unlockedScanResponse = $this->actingAs($scanner)->postJson(route('scanner.validate'), [
            'event_id' => $event->id,
            'qr_code' => $ticket->qr_token,
        ]);
        $unlockedScanResponse->assertStatus(200);
        $unlockedScanResponse->assertJson(['status' => 'granted']);
        $this->assertEquals('checked_in', $ticket->fresh()->status);
    }

    public function test_pending_order_success_page_hides_passes_and_requires_payment_verification(): void
    {
        $event = Event::first();
        $order = TicketOrder::factory()->create([
            'event_id' => $event->id,
            'payment_status' => 'pending',
            'paid_at' => null,
        ]);
        Ticket::factory()->count(2)->create([
            'event_id' => $event->id,
            'ticket_order_id' => $order->id,
            'status' => 'pending',
        ]);

        // When order is pending, tickets passed to TicketOrderSuccess must be empty and is_paid must be false
        $response = $this->get(route('tickets.orderSuccess', $order->order_number));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/TicketOrderSuccess')
            ->where('is_paid', false)
            ->has('tickets', 0)
        );

        // Status check endpoint reports pending
        $statusRes = $this->get(route('tickets.orderStatus', $order->order_number));
        $statusRes->assertStatus(200);
        $statusRes->assertJson([
            'order_number' => $order->order_number,
            'payment_status' => 'pending',
            'is_paid' => false,
            'status' => 'PENDING',
        ]);
    }

    public function test_free_tickets_checkout_auto_confirms_and_allows_instant_pass_viewing(): void
    {
        $event = Event::first();
        $event->update(['ticketing_enabled' => true]);
        $freeTier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Free RSVP Pass',
            'price' => 0,
            'capacity' => 50,
            'status' => 'active',
        ]);

        $response = $this->post(route('tickets.checkout', $event->id), [
            'buyer_name' => 'Asha Bakari',
            'buyer_phone' => '0788112233',
            'buyer_email' => 'asha@example.com',
            'items' => [
                ['tier_id' => $freeTier->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'status' => 'CONFIRMED',
            'is_paid' => true,
        ]);

        $order = TicketOrder::where('buyer_phone', '255788112233')->first();
        $this->assertNotNull($order);
        $this->assertEquals('paid', $order->payment_status);

        $ticket = $order->tickets()->first();
        $this->assertNotNull($ticket);
        $this->assertEquals('valid', $ticket->status);

        // Instant pass access granted
        $passResponse = $this->get(route('tickets.publicPass', $ticket->ticket_number));
        $passResponse->assertStatus(200);
        $passResponse->assertInertia(fn ($page) => $page
            ->component('Public/DigitalTicketPass')
            ->has('qrDataUri')
        );
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
            'show_event_details' => false,
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
        $this->assertFalse($config['show_event_details']);
        $this->assertFalse($config['show_confetti']);
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
            'redirect_to' => 'print_tickets',
        ]);

        $response->assertStatus(302);
        $this->assertEquals($initialTicketsCount + 15, Ticket::where('ticket_tier_id', $tier->id)->count());
        $this->assertEquals(15, $tier->fresh()->sold_count);

        $firstBatchTicket = Ticket::where('ticket_tier_id', $tier->id)->latest('id')->first();
        $this->assertEquals('Gate Pass #015', $firstBatchTicket->attendee_name);

        // Second batch continues numbering from #016 and redirects to wristbands print
        $secondResponse = $this->actingAs($organizer)->post(route('events.tickets.batchGenerate', $event->id), [
            'tier_id' => $tier->id,
            'quantity' => 5,
            'attendee_prefix' => 'Gate Pass',
            'redirect_to' => 'print_wristbands',
        ]);

        $secondResponse->assertStatus(302);
        $this->assertEquals(20, $tier->fresh()->sold_count);
        $latestTicket = Ticket::where('ticket_tier_id', $tier->id)->latest('id')->first();
        $this->assertEquals('Gate Pass #020', $latestTicket->attendee_name);
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

    public function test_organizer_can_toggle_sales_without_losing_payout_account(): void
    {
        $event = Event::first();
        $organizer = $event->user;
        $event->update([
            'ticketing_enabled' => false,
            'payout_method' => 'mobile_money',
            'payout_provider' => 'Airtel Money',
            'payout_account_number' => '0688123456',
            'payout_account_name' => 'Kardovo Tester',
            'ticket_instructions' => 'Bring your ID.',
        ]);

        $payload = [
            'ticketing_enabled' => true,
            'ticket_currency' => 'TZS',
            'ticket_instructions' => 'Bring your ID.',
            'ticket_sales_end_at' => '',
            'is_public' => true,
        ];

        $this->actingAs($organizer)
            ->post(route('events.ticketingSettings', $event->id), $payload)
            ->assertSessionHasNoErrors();

        $freshEvent = $event->fresh();
        $this->assertTrue((bool) $freshEvent->ticketing_enabled);
        $this->assertEquals('Airtel Money', $freshEvent->payout_provider);
        $this->assertEquals('0688123456', $freshEvent->payout_account_number);
        $this->assertEquals('Bring your ID.', $freshEvent->ticket_instructions);

        $this->actingAs($organizer)
            ->post(route('events.ticketingSettings', $event->id), [...$payload, 'ticketing_enabled' => false])
            ->assertSessionHasNoErrors();

        $this->assertFalse((bool) $event->fresh()->ticketing_enabled);
        $this->assertEquals('0688123456', $event->fresh()->payout_account_number);
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

    public function test_organizer_can_create_and_manage_discount_codes(): void
    {
        $event = Event::first();
        $organizer = $event->user;

        // 1. Create Discount Code
        $response = $this->actingAs($organizer)->post(route('events.discountCodes.store', $event->id), [
            'code' => 'EARLYBIRD20',
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'max_uses' => 50,
            'expires_at' => now()->addDays(7)->toDateTimeString(),
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('discount_codes', [
            'event_id' => $event->id,
            'code' => 'EARLYBIRD20',
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'is_active' => true,
        ]);

        $discount = DiscountCode::where('code', 'EARLYBIRD20')->first();

        // 2. Toggle Status
        $toggleRes = $this->actingAs($organizer)->patch(route('events.discountCodes.toggle', [$event->id, $discount->id]));
        $toggleRes->assertStatus(302);
        $this->assertFalse($discount->fresh()->is_active);

        // Toggle back on
        $this->actingAs($organizer)->patch(route('events.discountCodes.toggle', [$event->id, $discount->id]));
        $this->assertTrue($discount->fresh()->is_active);

        // 3. Live Validate Discount Endpoint
        $validateRes = $this->postJson(route('tickets.validateDiscount', $event->id), [
            'code' => 'EARLYBIRD20',
            'subtotal' => 100000,
        ]);

        $validateRes->assertStatus(200);
        $validateRes->assertJson([
            'valid' => true,
            'code' => 'EARLYBIRD20',
            'discount_amount' => 20000,
            'new_total' => 80000,
        ]);
    }

    public function test_checkout_applies_discount_code_correctly(): void
    {
        $event = Event::first();
        $event->update([
            'ticketing_enabled' => true,
            'payout_method' => 'bank',
            'payout_provider' => 'NMB Bank',
            'payout_account_number' => '22010045892',
            'payout_account_name' => 'Kardovo Organizer',
        ]);

        $tier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Festival Pass',
            'price' => 50000,
            'capacity' => 100,
            'status' => 'active',
        ]);

        $discount = DiscountCode::create([
            'event_id' => $event->id,
            'code' => 'PROMO10',
            'discount_type' => 'fixed',
            'discount_value' => 10000,
            'is_active' => true,
        ]);

        $response = $this->postJson(route('tickets.checkout', $event->id), [
            'buyer_name' => 'Juma Rashidi',
            'buyer_phone' => '0755123456',
            'discount_code' => 'PROMO10',
            'items' => [
                ['tier_id' => $tier->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200);

        $order = TicketOrder::latest()->first();
        $this->assertNotNull($order);
        $this->assertEquals(50000, (float) $order->subtotal);
        $this->assertEquals(10000, (float) $order->discount_amount);
        $this->assertEquals(40000, (float) $order->total_amount); // 50,000 - 10,000 = 40,000
        $this->assertEquals(2400, (float) $order->platform_fee); // 6% of 40,000 = 2,400
        $this->assertEquals(37600, (float) $order->organizer_net_amount); // 94% of 40,000 = 37,600
        $this->assertEquals($discount->id, $order->discount_code_id);
        $this->assertEquals(1, $discount->fresh()->used_count);
    }

    public function test_organizer_can_order_custom_wristbands_and_view_print_sheet(): void
    {
        $event = Event::first();
        $organizer = $event->user;

        // 1. Place wristband order
        $orderRes = $this->actingAs($organizer)->post(route('events.wristbands.order', $event->id), [
            'material_type' => 'tyvek',
            'quantity' => 200,
            'custom_text' => 'VIP PASS - KARDOVO FESTIVAL',
            'contact_name' => 'John Organizer',
            'contact_phone' => '0712334455',
            'delivery_address' => 'Oysterbay, Dar es Salaam, Tanzania',
        ]);

        $orderRes->assertStatus(302);
        $this->assertDatabaseHas('wristband_orders', [
            'event_id' => $event->id,
            'material_type' => 'tyvek',
            'quantity' => 200,
            'status' => 'requested',
        ]);

        $order = WristbandOrder::where('event_id', $event->id)->latest()->first();
        $this->assertNotNull($order);
        $this->assertNotNull($order->order_number);

        // 2. Access printable wristband sheet
        $printRes = $this->actingAs($organizer)->get(route('events.wristbands.print', $event->id));
        $printRes->assertStatus(200);
        $printRes->assertInertia(fn ($page) => $page
            ->component('Customer/PrintWristbandSheet')
            ->has('event')
            ->has('tickets')
            ->has('tiers')
        );
    }

    public function test_organizer_can_request_pos_terminal(): void
    {
        $event = Event::first();
        $organizer = $event->user;

        $response = $this->actingAs($organizer)->post(route('events.posRequest.store', $event->id), [
            'terminals_count' => 2,
            'required_from_date' => now()->addDays(3)->toDateString(),
            'venue_location' => 'Mlimani City Conference Centre, Dar es Salaam',
            'contact_name' => 'John Organizer',
            'contact_phone' => '0788990011',
            'notes' => 'Need 2 wireless 4G Android POS devices for gate cash & card admissions.',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('pos_terminal_requests', [
            'event_id' => $event->id,
            'terminals_count' => 2,
            'status' => 'pending',
            'contact_phone' => '255788990011',
        ]);
    }

    public function test_scanner_staff_can_issue_pos_door_ticket_sale(): void
    {
        $event = Event::first();
        $organizer = $event->user;

        $tier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Door Admission',
            'price' => 15000,
            'capacity' => 200,
            'status' => 'active',
        ]);

        $response = $this->actingAs($organizer)->postJson(route('scanner.posDoorSale'), [
            'event_id' => $event->id,
            'ticket_tier_id' => $tier->id,
            'attendee_name' => 'Amina Ally',
            'attendee_phone' => '0714998877',
            'payment_method' => 'cash',
            'auto_check_in' => true,
            'gate_label' => 'Gate 1 — Main Entrance',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'ticket' => [
                'attendee_name' => 'Amina Ally',
                'status' => 'checked_in',
            ],
        ]);

        $ticket = Ticket::where('attendee_name', 'Amina Ally')->first();
        $this->assertNotNull($ticket);
        $this->assertEquals('checked_in', $ticket->status);
        $this->assertEquals('Gate 1 — Main Entrance', $ticket->gate_label);

        // Check Ticket Order
        $order = $ticket->ticketOrder;
        $this->assertNotNull($order);
        $this->assertEquals('pos', $order->sales_channel);
        $this->assertEquals('paid', $order->payment_status);
        $this->assertEquals('cash', $order->payment_method);
        $this->assertEquals(15000, (float) $order->total_amount);

        // Check Scan Log was created
        $this->assertDatabaseHas('scan_logs', [
            'event_id' => $event->id,
            'ticket_id' => $ticket->id,
            'status' => 'granted',
            'gate_label' => 'Gate 1 — Main Entrance',
        ]);
    }

    public function test_organizer_can_view_print_wristband_sheet(): void
    {
        $organizer = User::where('role', 'customer')->first();
        $event = Event::first();
        $event->update(['user_id' => $organizer->id, 'ticketing_enabled' => true]);

        $tier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'VIP Access',
            'price' => 50000,
        ]);

        Ticket::factory()->create([
            'event_id' => $event->id,
            'ticket_tier_id' => $tier->id,
            'attendee_name' => 'Baraka Juma',
            'ticket_number' => 'WB-998877',
            'unique_code' => '56648880',
        ]);

        $response = $this->actingAs($organizer)->get(route('events.wristbands.print', $event->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/PrintWristbandSheet')
            ->where('tickets.0.attendee_name', 'Baraka Juma')
        );
    }

    public function test_organizer_can_update_wristband_design_template(): void
    {
        $organizer = User::where('role', 'customer')->first();
        $event = Event::first();
        $event->update(['user_id' => $organizer->id, 'ticketing_enabled' => true]);

        $response = $this->actingAs($organizer)->post(route('events.wristbands.template', $event->id), [
            'template_style' => 'festival_pop',
            'bg_mode' => 'preset',
            'qr_position' => 'left',
            'font_style' => 'chunky_festival',
            'custom_title' => 'SERENGETI SUMMER FEST 2026',
            'custom_role_label' => 'ARTIST',
            'custom_subtitle' => 'ALL ACCESS PASS',
            'show_serial' => true,
            'show_arrows' => true,
            'accent_color' => '#9333EA',
        ]);

        $response->assertRedirect();
        $event->refresh();

        $this->assertNotNull($event->ticket_template_config);
        $this->assertEquals('festival_pop', $event->ticket_template_config['wristband']['template_style']);
        $this->assertEquals('SERENGETI SUMMER FEST 2026', $event->ticket_template_config['wristband']['custom_title']);
        $this->assertEquals('ARTIST', $event->ticket_template_config['wristband']['custom_role_label']);
        $this->assertEquals('left', $event->ticket_template_config['wristband']['qr_position']);
        $this->assertTrue($event->ticket_template_config['wristband']['show_arrows']);
    }

    public function test_checkout_enforces_idempotency_key_and_prevents_duplicate_charges(): void
    {
        $event = Event::first();
        $event->update(['ticketing_enabled' => true]);

        $tier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'VIP Pass',
            'price' => 45000,
            'capacity' => 50,
            'sold_count' => 0,
            'status' => 'active',
        ]);

        $idempotencyKey = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        $payload = [
            'idempotency_key' => $idempotencyKey,
            'buyer_name' => 'Neema Mwakasege',
            'buyer_phone' => '0754112233',
            'buyer_email' => 'neema@example.com',
            'payment_method' => 'M-Pesa',
            'items' => [
                ['tier_id' => $tier->id, 'quantity' => 2],
            ],
        ];

        $initialOrdersCount = TicketOrder::count();

        // 1st checkout request
        $firstRes = $this->postJson(route('tickets.checkout', $event->id), $payload, [
            'Idempotency-Key' => $idempotencyKey,
        ]);

        $firstRes->assertStatus(200);
        $firstRes->assertJson([
            'success' => true,
            'idempotent_replay' => false,
            'idempotency_key' => $idempotencyKey,
            'quantity' => 2,
            'total_amount' => 90000,
        ]);

        $orderNumber = $firstRes->json('order_number');
        $this->assertEquals($initialOrdersCount + 1, TicketOrder::count());
        $this->assertEquals(2, $tier->fresh()->sold_count);

        // 2nd duplicate checkout request (simulating network timeout / retry)
        $secondRes = $this->postJson(route('tickets.checkout', $event->id), $payload, [
            'Idempotency-Key' => $idempotencyKey,
        ]);

        $secondRes->assertStatus(200);
        $secondRes->assertJson([
            'success' => true,
            'idempotent_replay' => true,
            'idempotency_key' => $idempotencyKey,
            'order_number' => $orderNumber,
            'quantity' => 2,
            'total_amount' => 90000,
        ]);

        // Capacity and order count MUST NOT be incremented a second time
        $this->assertEquals($initialOrdersCount + 1, TicketOrder::count());
        $this->assertEquals(2, $tier->fresh()->sold_count);
    }

    public function test_payment_ledger_is_strictly_append_only_and_immutable(): void
    {
        $event = Event::first();
        $event->update(['ticketing_enabled' => true]);

        $tier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Regular Pass',
            'price' => 25000,
            'capacity' => 100,
            'status' => 'active',
        ]);

        $checkoutRes = $this->postJson(route('tickets.checkout', $event->id), [
            'idempotency_key' => '11111111-2222-4333-8444-555555555555',
            'buyer_name' => 'Salim Ahmed',
            'buyer_phone' => '0713889900',
            'payment_method' => 'Tigo Pesa',
            'items' => [
                ['tier_id' => $tier->id, 'quantity' => 1],
            ],
        ]);

        $checkoutRes->assertStatus(200);
        $orderNumber = $checkoutRes->json('order_number');
        $order = TicketOrder::where('order_number', $orderNumber)->firstOrFail();

        // 1. Verify initial intent_created row was written
        $entries = $order->ledgerEntries()->get();
        $this->assertCount(1, $entries);
        $this->assertEquals(PaymentLedgerEntry::STATE_INTENT_CREATED, $entries[0]->state);
        $this->assertEquals(25000, (float) $entries[0]->amount);

        // 2. Verify payment — must append a second 'captured' row without mutating the first row
        $verifyRes = $this->postJson(route('tickets.verifyPayment', $orderNumber));
        $verifyRes->assertStatus(200);
        $verifyRes->assertJson(['success' => true, 'is_paid' => true]);

        $entriesAfterCapture = $order->ledgerEntries()->get();
        $this->assertCount(2, $entriesAfterCapture);
        $this->assertEquals(PaymentLedgerEntry::STATE_INTENT_CREATED, $entriesAfterCapture[0]->state);
        $this->assertEquals(PaymentLedgerEntry::STATE_CAPTURED, $entriesAfterCapture[1]->state);

        // 3. Verify that mutating or deleting an existing ledger entry throws LogicException
        $this->expectException(LogicException::class);
        $entriesAfterCapture[0]->update(['state' => 'refunded']);
    }

    public function test_azampay_webhook_verifies_signature_and_deduplicates_events_in_ledger(): void
    {
        config(['services.azampay.webhook_secret' => 'test_super_secret_hmac_key']);

        $event = Event::first();
        $event->update(['ticketing_enabled' => true]);

        $tier = TicketTier::factory()->create([
            'event_id' => $event->id,
            'name' => 'Arena Pass',
            'price' => 30000,
            'capacity' => 100,
            'status' => 'active',
        ]);

        $checkoutRes = $this->postJson(route('tickets.checkout', $event->id), [
            'idempotency_key' => '99999999-8888-4777-8666-555555555555',
            'buyer_name' => 'Grace Mushi',
            'buyer_phone' => '0766445566',
            'payment_method' => 'M-Pesa',
            'items' => [
                ['tier_id' => $tier->id, 'quantity' => 1],
            ],
        ]);

        $orderNumber = $checkoutRes->json('order_number');
        $order = TicketOrder::where('order_number', $orderNumber)->firstOrFail();
        $tx = FinancialTransaction::where('reference', $order->payment_reference)->firstOrFail();

        $webhookPayload = [
            'event_id' => 'evt_azampay_1001',
            'transactionid' => 'AZM-TX-9001',
            'externalId' => $tx->transaction_number,
            'mnoReference' => 'MPESA-REF-778899',
            'message' => 'Transaction Successful',
            'operator' => 'Mpesa',
        ];

        // 1. Unsigned webhook request must be rejected with 401
        $unsignedRes = $this->postJson('/api/webhooks/azampay', $webhookPayload);
        $unsignedRes->assertStatus(401);
        $this->assertFalse($order->fresh()->isPaid());

        // 2. Signed webhook request succeeds, updates order + transaction, and appends 'captured' ledger row
        $rawBody = json_encode($webhookPayload);
        $signature = hash_hmac('sha256', $rawBody, 'test_super_secret_hmac_key');

        $signedRes = $this->call(
            'POST',
            '/api/webhooks/azampay',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
                'HTTP_X_AZAMPAY_SIGNATURE' => $signature,
            ],
            $rawBody
        );

        $signedRes->assertStatus(200);
        $this->assertTrue($order->fresh()->isPaid());
        $this->assertEquals('completed', $tx->fresh()->status);
        $this->assertCount(2, $order->ledgerEntries()->get());

        // 3. Replaying the exact same signed webhook is deduplicated via provider_event_id
        $replayRes = $this->call(
            'POST',
            '/api/webhooks/azampay',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
                'HTTP_X_AZAMPAY_SIGNATURE' => $signature,
            ],
            $rawBody
        );

        $replayRes->assertStatus(200);
        $replayRes->assertJson([
            'success' => true,
            'idempotent_replay' => true,
        ]);
        $this->assertCount(2, $order->ledgerEntries()->get());
    }

    public function test_how_it_works_page_renders_successfully(): void
    {
        $response = $this->get(route('tickets.how-it-works'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/HowItWorks')
            ->has('status')
        );
    }
}
