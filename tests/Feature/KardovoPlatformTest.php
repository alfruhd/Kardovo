<?php

namespace Tests\Feature;

use App\Models\CardTemplate;
use App\Models\Event;
use App\Models\FinancialTransaction;
use App\Models\Guest;
use App\Models\Package;
use App\Models\User;
use App\Services\AzampayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KardovoPlatformTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_new_user_with_no_events_can_view_dashboard(): void
    {
        $newUser = User::factory()->create([
            'role' => 'organizer',
        ]);

        $response = $this->actingAs($newUser)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Dashboard')
            ->has('events', 0)
        );
    }

    public function test_guest_can_view_public_invitation_pass(): void
    {
        $guest = Guest::first();

        $response = $this->get(route('guest.card', $guest->qr_token));

        $response->assertStatus(200);
    }

    public function test_guest_can_submit_one_tap_rsvp(): void
    {
        $guest = Guest::where('rsvp_status', 'pending')->first();

        $response = $this->post(route('guest.rsvp', $guest->qr_token), [
            'status' => 'attending',
        ]);

        $response->assertStatus(302);
        $this->assertEquals('attending', $guest->fresh()->rsvp_status);
        $this->assertNotNull($guest->fresh()->rsvp_at);
    }

    public function test_scanner_can_validate_and_grant_access(): void
    {
        $scanner = User::where('role', 'scanner')->first();
        $event = Event::first();
        $guest = Guest::where('event_id', $event->id)->where('entries_used', 0)->first();

        $response = $this->actingAs($scanner)->postJson(route('scanner.validate'), [
            'event_id' => $event->id,
            'qr_code' => $guest->unique_code,
            'gate_label' => 'Gate 1 — Main VIP Entrance',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'granted');
        $this->assertEquals(1, $guest->fresh()->entries_used);
        $this->assertDatabaseHas('scan_logs', [
            'event_id' => $event->id,
            'guest_id' => $guest->id,
            'status' => 'granted',
        ]);
    }

    public function test_scanner_can_validate_via_card_number_and_url(): void
    {
        $scanner = User::where('role', 'scanner')->first();
        $event = Event::first();
        $guest = Guest::where('event_id', $event->id)->where('entries_used', 0)->first();

        // 1. Test lowercase card_number
        $response = $this->actingAs($scanner)->postJson(route('scanner.validate'), [
            'event_id' => $event->id,
            'qr_code' => strtolower($guest->card_number),
            'gate_label' => 'Gate 1 — Main VIP Entrance',
        ]);
        $response->assertStatus(200);
        $response->assertJsonPath('status', 'granted');

        // 2. Test full QR pass URL
        $guest2 = Guest::where('event_id', $event->id)->where('entries_used', 0)->where('id', '!=', $guest->id)->first();
        if ($guest2) {
            $qrUrl = "http://192.168.100.2:8000/card/{$guest2->qr_token}?ref=camera";
            $response2 = $this->actingAs($scanner)->postJson(route('scanner.validate'), [
                'event_id' => $event->id,
                'qr_code' => $qrUrl,
                'gate_label' => 'Gate 1 — Main VIP Entrance',
            ]);
            $response2->assertStatus(200);
            $response2->assertJsonPath('status', 'granted');
        }
    }

    public function test_scanner_rejects_exceeded_entries(): void
    {
        $scanner = User::where('role', 'scanner')->first();
        $event = Event::first();
        // Set guest entries to max
        $guest = Guest::where('event_id', $event->id)->first();
        $guest->update(['entries_used' => $guest->max_entries]);

        $response = $this->actingAs($scanner)->postJson(route('scanner.validate'), [
            'event_id' => $event->id,
            'qr_code' => $guest->unique_code,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('status', 'rejected');
    }

    public function test_customer_can_import_guests(): void
    {
        $customer = User::where('role', 'customer')->first();
        $event = Event::where('user_id', $customer->id)->first();

        $rawText = "Juma Bakari, +255 711 222 333, Double Entry, 2\nZuwena Ally, +255 722 333 444, Single Entry, 1";

        $response = $this->actingAs($customer)->post(route('guests.import', $event->id), [
            'raw_text' => $rawText,
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('guests', [
            'event_id' => $event->id,
            'name' => 'Juma Bakari',
            'max_entries' => 2,
        ]);
        $this->assertDatabaseHas('guests', [
            'event_id' => $event->id,
            'name' => 'Zuwena Ally',
            'max_entries' => 1,
        ]);
    }

    public function test_customer_can_dispatch_messaging_campaign(): void
    {
        $customer = User::where('role', 'customer')->first();
        $event = Event::where('user_id', $customer->id)->first();

        $response = $this->actingAs($customer)->post(route('messaging.broadcast'), [
            'event_id' => $event->id,
            'channel' => 'whatsapp',
            'target_filter' => 'all',
            'custom_caption' => 'Test broadcast message',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('messages', [
            'event_id' => $event->id,
            'channel' => 'whatsapp',
        ]);
    }

    public function test_admin_and_customer_can_delete_template(): void
    {
        $admin = User::where('role', 'admin')->first();
        $template = CardTemplate::first();

        $response = $this->actingAs($admin)->delete(route('templates.destroy', $template->id));

        $response->assertStatus(302);
        $this->assertDatabaseMissing('card_templates', [
            'id' => $template->id,
        ]);
    }

    public function test_customer_can_access_dashboard(): void
    {
        $customer = User::where('role', 'customer')->first();
        $response = $this->actingAs($customer)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Dashboard')
            ->has('events')
            ->has('overviewStats.invitation_events_count')
            ->has('overviewStats.occasion_events_count')
            ->has('overviewStats.total_tickets_sold')
            ->has('overviewStats.total_ticket_revenue')
        );
    }

    public function test_customer_can_edit_and_delete_their_event(): void
    {
        $customer = User::where('role', 'customer')->first();
        $event = Event::where('user_id', $customer->id)->first();

        // 1. Edit event
        $editResponse = $this->actingAs($customer)->put(route('events.update', $event->id), [
            'title' => 'Updated Wedding Gala 2026',
            'event_type' => 'Alumni Gala',
            'event_date' => '2026-11-20',
            'event_time' => '6:00 PM',
            'venue' => 'Serena Grand Ballroom',
            'city' => 'Dar es Salaam',
            'status' => 'active',
        ]);

        $editResponse->assertStatus(302);
        $this->assertEquals('Updated Wedding Gala 2026', $event->fresh()->title);
        $this->assertEquals('Alumni Gala', $event->fresh()->event_type);

        // 2. Delete event
        $deleteResponse = $this->actingAs($customer)->delete(route('events.destroy', $event->id));
        $deleteResponse->assertStatus(302);
        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }

    public function test_admin_can_edit_and_delete_any_event(): void
    {
        $admin = User::where('role', 'admin')->first();
        $customer = User::where('role', 'customer')->first();
        $event = Event::where('user_id', $customer->id)->first();

        // 1. Admin Edit event
        $editResponse = $this->actingAs($admin)->put(route('events.update', $event->id), [
            'title' => 'Admin Modified Festival',
            'event_type' => 'Concert / Festival',
            'event_date' => '2026-12-31',
            'venue' => 'Mlimani City Complex',
            'city' => 'Dar es Salaam',
            'status' => 'completed',
        ]);

        $editResponse->assertStatus(302);
        $this->assertEquals('Admin Modified Festival', $event->fresh()->title);
        $this->assertEquals('completed', $event->fresh()->status);

        // 2. Admin Delete event
        $deleteResponse = $this->actingAs($admin)->delete(route('events.destroy', $event->id));
        $deleteResponse->assertStatus(302);
        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }

    public function test_customer_can_select_and_assign_custom_template_in_messaging_hub(): void
    {
        $customer = User::where('role', 'customer')->first();
        $event = Event::where('user_id', $customer->id)->first();

        // Create a custom template for this customer
        $customTemplate = CardTemplate::create([
            'user_id' => $customer->id,
            'name' => 'My VIP Custom Gold Pass',
            'template_type' => 'custom_art',
            'headline' => 'EXCLUSIVE VIP ACCESS',
        ]);

        // 1. Check messaging hub returns templates including this custom template
        $response = $this->actingAs($customer)->get(route('messaging.index', ['event_id' => $event->id]));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Messaging')
            ->has('templates')
            ->where('templates', fn ($templates) => collect($templates)->pluck('id')->contains($customTemplate->id))
        );

        // 2. Customer updates the event template via the messaging hub endpoint
        $patchResponse = $this->actingAs($customer)->patch(route('messaging.updateEventTemplate', $event->id), [
            'card_template_id' => $customTemplate->id,
        ]);
        $patchResponse->assertStatus(302);
        $this->assertEquals($customTemplate->id, $event->fresh()->card_template_id);
    }

    public function test_customer_can_upload_and_create_custom_artwork_template(): void
    {
        $customer = User::where('role', 'customer')->first();
        Storage::fake('public');
        $file = UploadedFile::fake()->image('wedding_flyer.png', 800, 1200);

        $response = $this->actingAs($customer)->post(route('templates.store'), [
            'name' => 'Royal Purple Custom Artwork',
            'template_type' => 'custom_art',
            'image_file' => $file,
            'show_category_badge' => false,
            'elements_config' => [
                'show_guest_name' => true,
                'show_qr' => true,
                'show_unique_code' => true,
                'guest_name' => ['x' => 50, 'y' => 71.5, 'fontSize' => 20],
            ],
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('card_templates', [
            'name' => 'Royal Purple Custom Artwork',
            'user_id' => $customer->id,
            'template_type' => 'custom_art',
        ]);
    }

    public function test_admin_can_govern_and_update_customer_account(): void
    {
        $admin = User::where('role', 'admin')->first();
        $customer = User::where('role', 'customer')->first();
        $originalPasswordHash = $customer->password;

        $response = $this->actingAs($admin)->put(route('admin.updateCustomer', $customer->id), [
            'name' => 'Updated Organizer Name',
            'email' => 'updated_organizer@kardovo.test',
            'phone' => '+255 788 123 456',
            'company' => 'Apex Events International',
            'password' => '', // leave blank
            'role' => 'customer',
            'status' => 'active',
            'max_events_limit' => '10',
            'max_whatsapp_limit' => '500',
            'max_sms_limit' => '1000',
            'permissions' => [
                'can_create_events' => true,
                'can_import_guests' => true,
                'can_send_broadcasts' => false,
                'can_customize_templates' => true,
                'can_manage_scanners' => false,
                'can_export_data' => true,
            ],
        ]);

        $response->assertStatus(302);
        $freshCustomer = $customer->fresh();

        $this->assertEquals('Updated Organizer Name', $freshCustomer->name);
        $this->assertEquals('updated_organizer@kardovo.test', $freshCustomer->email);
        $this->assertEquals('+255 788 123 456', $freshCustomer->phone);
        $this->assertEquals('Apex Events International', $freshCustomer->company);
        $this->assertEquals($originalPasswordHash, $freshCustomer->password); // unchanged
        $this->assertEquals(10, $freshCustomer->max_events_limit);
        $this->assertEquals(500, $freshCustomer->max_whatsapp_limit);
        $this->assertEquals(1000, $freshCustomer->max_sms_limit);
        $this->assertFalse($freshCustomer->permissions['can_send_broadcasts']);
        $this->assertFalse($freshCustomer->permissions['can_manage_scanners']);
        $this->assertTrue($freshCustomer->permissions['can_create_events']);
    }

    public function test_admin_can_suspend_organizer_with_reason(): void
    {
        $admin = User::where('role', 'admin')->first();
        $customer = User::where('role', 'customer')->first();

        $response = $this->actingAs($admin)->put(route('admin.updateCustomer', $customer->id), [
            'name' => $customer->name,
            'email' => $customer->email,
            'status' => 'suspended',
            'suspension_reason' => 'Account undergoing annual compliance check.',
        ]);

        $response->assertStatus(302);
        $freshCustomer = $customer->fresh();
        $this->assertEquals('suspended', $freshCustomer->status);
        $this->assertEquals('Account undergoing annual compliance check.', $freshCustomer->suspension_reason);
    }

    public function test_cannot_create_event_with_past_date(): void
    {
        $customer = User::where('role', 'customer')->first();

        $response = $this->actingAs($customer)->post(route('events.store'), [
            'title' => 'Yesterday Party',
            'event_type' => 'Birthday Party',
            'event_date' => now()->subDay()->toDateString(),
            'venue' => 'Serena Hotel',
            'city' => 'Dar es Salaam',
        ]);

        $response->assertSessionHasErrors('event_date');
        $this->assertDatabaseMissing('events', ['title' => 'Yesterday Party']);
    }

    public function test_can_create_event_with_today_or_future_date(): void
    {
        $customer = User::where('role', 'customer')->first();

        $response = $this->actingAs($customer)->post(route('events.store'), [
            'title' => 'Tomorrow Grand Gala',
            'event_type' => 'Corporate Gala',
            'event_date' => now()->addDays(2)->toDateString(),
            'venue' => 'Mlimani City Hall',
            'city' => 'Dar es Salaam',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('events', ['title' => 'Tomorrow Grand Gala']);
    }

    public function test_organizer_scanner_cannot_access_or_scan_other_organizers_events(): void
    {
        $organizerA = User::factory()->create(['role' => 'customer']);
        $organizerB = User::factory()->create(['role' => 'customer']);

        $eventA = Event::create([
            'user_id' => $organizerA->id,
            'title' => 'Organizer A Exclusive Gala',
            'event_type' => 'Gala',
            'event_date' => now()->addDays(5)->toDateString(),
            'venue' => 'Serena Hotel',
            'city' => 'Dar es Salaam',
            'status' => 'active',
        ]);

        $eventB = Event::create([
            'user_id' => $organizerB->id,
            'title' => 'Organizer B Private Wedding',
            'event_type' => 'Wedding Reception',
            'event_date' => now()->addDays(10)->toDateString(),
            'venue' => 'Kunduchi Beach',
            'city' => 'Dar es Salaam',
            'status' => 'active',
        ]);

        $guestB = Guest::create([
            'event_id' => $eventB->id,
            'name' => 'Secret VIP Guest B',
            'phone' => '+255 711 000 111',
            'category' => 'VIP',
            'max_entries' => 1,
            'entries_used' => 0,
        ]);

        // 1. In index(), Organizer A only sees Event A, cannot load Event B via URL
        $response = $this->actingAs($organizerA)->get(route('scanner.index', ['event_id' => $eventB->id]));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Scanner/ScannerApp')
            ->where('activeEvent.id', $eventA->id)
            ->has('events', 1)
        );

        // 2. Organizer A cannot validate scan for Event B (403 Access Denied)
        $validateResponse = $this->actingAs($organizerA)->postJson(route('scanner.validate'), [
            'event_id' => $eventB->id,
            'qr_code' => $guestB->unique_code,
        ]);
        $validateResponse->assertStatus(403);
        $validateResponse->assertJsonPath('status', 'rejected');

        // 3. If guest B pass is scanned at Event A gate, it is rejected and does NOT reveal Event B info
        $validateOtherResponse = $this->actingAs($organizerA)->postJson(route('scanner.validate'), [
            'event_id' => $eventA->id,
            'qr_code' => $guestB->unique_code,
        ]);
        $validateOtherResponse->assertStatus(200);
        $validateOtherResponse->assertJsonPath('status', 'rejected');
        $this->assertNull($validateOtherResponse->json('other_event_title'));
    }

    public function test_sub_admin_is_redirected_to_admin_portal_from_dashboard_and_login(): void
    {
        $subAdmin = User::factory()->create([
            'role' => 'sub_admin',
        ]);

        // 1. Visiting /dashboard redirects to admin portal
        $response = $this->actingAs($subAdmin)->get(route('dashboard'));
        $response->assertRedirect(route('admin.dashboard'));

        // 2. Logging in via store redirects to admin portal
        $loginResponse = $this->post(route('login'), [
            'email' => $subAdmin->email,
            'password' => 'password',
        ]);
        $loginResponse->assertRedirect(route('admin.dashboard'));
    }

    public function test_admin_independent_pages_and_tab_redirects(): void
    {
        $admin = User::where('role', 'admin')->first() ?? User::factory()->create(['role' => 'admin']);

        // 1. Users page loads with Inertia component Admin/Users
        $usersResponse = $this->actingAs($admin)->get(route('admin.users'));
        $usersResponse->assertStatus(200);
        $usersResponse->assertInertia(fn ($page) => $page->component('Admin/Users'));

        // 2. Audit Logs page loads with Inertia component Admin/AuditLogs
        $logsResponse = $this->actingAs($admin)->get(route('admin.auditLogs'));
        $logsResponse->assertStatus(200);
        $logsResponse->assertInertia(fn ($page) => $page->component('Admin/AuditLogs'));

        // 3. Gateways page loads with Inertia component Admin/Gateways
        $gatewaysResponse = $this->actingAs($admin)->get(route('admin.gateways'));
        $gatewaysResponse->assertStatus(200);
        $gatewaysResponse->assertInertia(fn ($page) => $page
            ->component('Admin/Gateways')
            ->has('gateways.whatsapp')
            ->has('gateways.sms')
            ->has('gateways.azampay')
            ->where('gateways.sms.sender_id', 'KARDOVO')
        );

        // 4. Legacy tab redirects
        $this->actingAs($admin)->get('/admin?tab=users')->assertRedirect(route('admin.users'));
        $this->actingAs($admin)->get('/admin?tab=logs')->assertRedirect(route('admin.auditLogs'));
        $this->actingAs($admin)->get('/admin?tab=gateways')->assertRedirect(route('admin.gateways'));
        $this->actingAs($admin)->get('/admin?tab=events')->assertRedirect(route('events.index'));
        $this->actingAs($admin)->get('/admin?tab=templates')->assertRedirect(route('templates.index'));
        $this->actingAs($admin)->get(route('events.index'))->assertStatus(200);
        $this->actingAs($admin)->get(route('templates.index'))->assertStatus(200);
        $this->actingAs($admin)->get(route('ticketing.index'))->assertStatus(200);
    }

    public function test_package_purchase_anti_tampering_and_per_card_quotas(): void
    {
        $organizer = User::factory()->create([
            'role' => 'customer',
            'max_whatsapp_limit' => 0,
            'max_sms_limit' => 0,
        ]);

        $basicPkg = Package::firstOrCreate(
            ['name' => 'Basic'],
            ['price' => 1000, 'description' => '1,000 Tsh per card', 'is_active' => true]
        );

        $executivePkg = Package::firstOrCreate(
            ['name' => 'Executive'],
            ['price' => 2500, 'description' => '2,500 Tsh per card', 'is_active' => true]
        );

        // 1. Executive package requires minimum 200 cards
        $failResponse = $this->actingAs($organizer)->post(route('organizer.pricing.purchase'), [
            'package_id' => $executivePkg->id,
            'provider' => 'Mpesa',
            'mobileNumber' => '0767000000',
            'guests_count' => 50,
        ]);
        $failResponse->assertSessionHasErrors('guests_count');

        // 2. Anti-tampering check: even if malicious client sends amount = 10, the server calculates strictly from package price
        // Mock AzampayService so direct M-Pesa push test doesn't hit external network
        $this->mock(AzampayService::class, function ($mock) {
            $mock->shouldReceive('mnCheckout')->andReturn(['success' => true, 'message' => 'USSD sent']);
        });

        $cardsCount = 100;
        $expectedTotal = (float) $basicPkg->price * $cardsCount; // 1000 * 100 = 100,000 TZS

        $response = $this->actingAs($organizer)->post(route('organizer.pricing.purchase'), [
            'package_id' => $basicPkg->id,
            'provider' => 'Mpesa',
            'mobileNumber' => '0767000000',
            'guests_count' => $cardsCount,
            'amount' => 5, // Attempted tamper - must be ignored!
            'price' => 1,  // Attempted tamper - must be ignored!
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $transaction = FinancialTransaction::where('user_id', $organizer->id)
            ->where('category', 'package_purchase')
            ->latest('id')
            ->first();

        $this->assertNotNull($transaction);
        // Assert server computed price matches verified package price
        $this->assertEquals($expectedTotal, (float) $transaction->amount);
        $this->assertStringContainsString((string) $cardsCount, $transaction->title);

        // Assert 1 card = 1 WhatsApp + 1 SMS message metadata in notes
        $meta = json_decode($transaction->notes, true);
        $this->assertIsArray($meta);
        $this->assertEquals($cardsCount, $meta['cards_count']);
        $this->assertEquals($cardsCount, $meta['whatsapp_messages_included']);
        $this->assertEquals($cardsCount, $meta['sms_messages_included']);
        $this->assertEquals((float) $basicPkg->price, (float) $meta['verified_unit_price']);

        // 3. Webhook completes payment and credits 1 WhatsApp + 1 SMS per card to user
        $webhookResponse = $this->postJson(route('webhooks.azampay'), [
            'transactionid' => 'AZM-TEST-12345',
            'externalId' => $transaction->transaction_number,
            'mnoReference' => 'MNO-REF-998877',
            'message' => 'Transaction Completed Successfully',
        ]);
        $webhookResponse->assertStatus(200);

        $organizer->refresh();
        $this->assertEquals($cardsCount, $organizer->max_whatsapp_limit);
        $this->assertEquals($cardsCount, $organizer->max_sms_limit);
    }

    public function test_organizer_signup_and_signin_with_phone_and_admin_management(): void
    {
        // 1. Organizer signs up with only a phone number
        $signupResponse = $this->post(route('register'), [
            'name' => 'Phone Organizer',
            'phone' => '0789123456',
            'password' => 'Str0ngP@ssw0rd!2026',
            'password_confirmation' => 'Str0ngP@ssw0rd!2026',
        ]);
        $signupResponse->assertRedirect(route('two-factor.index'));

        $user = User::where('name', 'Phone Organizer')->first();
        $this->assertNotNull($user);
        $this->assertEquals('customer', $user->role);
        $this->assertStringContainsString('phone.kardovo.com', $user->email);
        $this->assertStringContainsString('789 123 456', $user->phone);

        // 2. Organizer logs in using their local phone number
        $loginResponseLocal = $this->post(route('login'), [
            'email' => '0789123456',
            'password' => 'Str0ngP@ssw0rd!2026',
        ]);
        $loginResponseLocal->assertRedirect();
        $this->assertAuthenticatedAs($user);

        // Log out
        $this->post(route('logout'));
        $this->assertGuest();

        // 3. Organizer logs in using international format
        $loginResponseIntl = $this->post(route('login'), [
            'email' => '+255 789 123 456',
            'password' => 'Str0ngP@ssw0rd!2026',
        ]);
        $loginResponseIntl->assertRedirect();
        $this->assertAuthenticatedAs($user);

        // 4. Admin creates an organizer with phone number
        $admin = User::where('role', 'admin')->first() ?? User::factory()->create(['role' => 'admin']);
        $adminCreateResponse = $this->actingAs($admin)->post(route('admin.storeCustomer'), [
            'name' => 'VIP Organizer Phone',
            'phone' => '0754987654',
            'password' => 'AdminP@ss123!Safe',
            'role' => 'customer',
        ]);
        $adminCreateResponse->assertSessionHasNoErrors();

        $createdOrganizer = User::where('name', 'VIP Organizer Phone')->first();
        $this->assertNotNull($createdOrganizer);
        $this->assertStringContainsString('754 987 654', $createdOrganizer->phone);

        // 5. Admin updates the organizer's phone number
        $adminUpdateResponse = $this->actingAs($admin)->put(route('admin.updateCustomer', $createdOrganizer->id), [
            'name' => 'VIP Organizer Updated',
            'phone' => '0765112233',
            'role' => 'customer',
        ]);
        $adminUpdateResponse->assertSessionHasNoErrors();

        $createdOrganizer->refresh();
        $this->assertStringContainsString('765 112 233', $createdOrganizer->phone);
    }

    public function test_zero_quota_on_registration_and_blocked_messaging_until_package_payment(): void
    {
        // 1. Register a new user
        $regResponse = $this->post('/register', [
            'name' => 'Zero Quota Organizer',
            'email' => 'zero@kardovo.test',
            'phone' => '0712345678',
            'password' => 'Str0ngP@ssw0rd!2026',
            'password_confirmation' => 'Str0ngP@ssw0rd!2026',
        ]);
        $regResponse->assertRedirect();

        $organizer = User::where('name', 'Zero Quota Organizer')->first();
        $this->assertNotNull($organizer);
        $this->assertSame(0, $organizer->max_whatsapp_limit);
        $this->assertSame(0, $organizer->max_sms_limit);
        $this->assertFalse($organizer->canSendWhatsApp());
        $this->assertFalse($organizer->canSendSms());

        // 2. Create an event with a guest
        $event = Event::create([
            'user_id' => $organizer->id,
            'title' => 'Zero Quota Test Gala',
            'event_type' => 'Gala',
            'event_date' => now()->addDays(5)->toDateString(),
            'venue' => 'Serena Hotel',
            'city' => 'Dar es Salaam',
            'status' => 'active',
        ]);

        $guest = Guest::create([
            'event_id' => $event->id,
            'name' => 'Alice Guest',
            'phone' => '+255712000000',
            'category' => 'General',
            'max_entries' => 1,
            'entries_used' => 0,
        ]);

        // 3. Attempt single message send - must be blocked because WhatsApp quota is 0
        $singleWaResponse = $this->actingAs($organizer)->post(route('messaging.sendSingle', $guest->id), [
            'channel' => 'whatsapp',
        ]);
        $singleWaResponse->assertSessionHas('error');
        $this->assertStringContainsString('quota', strtolower(session('error')));

        // 4. Attempt broadcast message send - must be blocked because WhatsApp quota is 0
        $broadcastWaResponse = $this->actingAs($organizer)->post(route('messaging.broadcast'), [
            'event_id' => $event->id,
            'channel' => 'whatsapp',
            'target_filter' => 'all',
        ]);
        $broadcastWaResponse->assertSessionHas('error');
        $this->assertStringContainsString('Quota Exceeded', session('error'));

        // 5. User purchases package (e.g. 50 cards @ 1000 = 50,000)
        $pkg = Package::firstOrCreate(
            ['name' => 'Standard Package'],
            ['price' => 1000, 'description' => '1,000 Tsh per card', 'is_active' => true]
        );

        $this->mock(AzampayService::class, function ($mock) {
            $mock->shouldReceive('mnCheckout')->andReturn(['success' => true, 'message' => 'USSD sent']);
        });

        $cardsCount = 50;
        $purchaseResponse = $this->actingAs($organizer)->post(route('organizer.pricing.purchase'), [
            'package_id' => $pkg->id,
            'provider' => 'Mpesa',
            'mobileNumber' => '0767000000',
            'guests_count' => $cardsCount,
        ]);
        $purchaseResponse->assertSessionHasNoErrors();

        $transaction = FinancialTransaction::where('user_id', $organizer->id)
            ->where('category', 'package_purchase')
            ->latest('id')
            ->first();
        $this->assertNotNull($transaction);

        // 6. Azampay webhook triggers and successfully credits quotas
        $webhookResponse = $this->postJson(route('webhooks.azampay'), [
            'transactionid' => 'AZM-TEST-ZERO-TO-QUOTA',
            'externalId' => $transaction->transaction_number,
            'mnoReference' => 'MNO-REF-112233',
            'message' => 'Transaction Completed Successfully',
        ]);
        $webhookResponse->assertStatus(200);

        // 7. Verify quotas are credited according to payment (50 cards = 50 WhatsApp + 50 SMS)
        $organizer->refresh();
        $this->assertEquals(50, $organizer->max_whatsapp_limit);
        $this->assertEquals(50, $organizer->max_sms_limit);
        $this->assertTrue($organizer->canSendWhatsApp());
        $this->assertTrue($organizer->canSendSms());
        $this->assertTrue($organizer->canSendWhatsApp(50));
        $this->assertFalse($organizer->canSendWhatsApp(51));

        $stats = $organizer->getMessageQuotaStats();
        $this->assertEquals(50, $stats['whatsapp_limit']);
        $this->assertEquals(50, $stats['whatsapp_remaining']);
        $this->assertEquals(50, $stats['sms_limit']);
        $this->assertEquals(50, $stats['sms_remaining']);
    }
}
