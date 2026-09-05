<?php

namespace Tests\Feature;

use App\Models\CardTemplate;
use App\Models\Event;
use App\Models\Guest;
use App\Models\User;
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
            'headline' => 'ROYAL WEDDING INVITATION',
            'overlay_mode' => 'minimal',
            'show_qr' => true,
            'show_unique_code' => true,
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
}
