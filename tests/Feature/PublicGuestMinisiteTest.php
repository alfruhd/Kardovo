<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\FinancialTransaction;
use App\Models\Guest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicGuestMinisiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_demo_pass_renders_with_luxury_sacred_garden_microsite_config(): void
    {
        $response = $this->get(route('guest.demoPass'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/GuestPass')
            ->has('micrositeConfig')
            ->where('micrositeConfig.theme_color', '#f9f0e0')
            ->where('micrositeConfig.accent_color', '#a67d2b')
            ->where('micrositeConfig.primary_name', 'Zohan')
            ->where('micrositeConfig.secondary_name', 'Rose')
            ->where('micrositeConfig.show_intro_animation', true)
            ->where('micrositeConfig.intro_video_url', 'https://res.cloudinary.com/ukb8xb7m/video/upload/v1787037654/1782224012851_1_m6ww6v.mp4')
            ->where('micrositeConfig.intro_poster_url', 'https://res.cloudinary.com/ukb8xb7m/image/upload/v1787037630/ChatGPT_Image_Jun_23_2026_04_40_29_PM_4_piptqn.png')
            ->where('micrositeConfig.swans_video_url', 'https://res.cloudinary.com/ukb8xb7m/video/upload/v1787037092/Swans2_1_qwzsod.mov')
            ->has('micrositeConfig.programme')
        );
    }

    public function test_guest_can_submit_rsvp_with_heartfelt_message(): void
    {
        $guest = Guest::first();

        $response = $this->post(route('guest.rsvp', $guest->qr_token), [
            'status' => 'attending',
            'message' => 'Congratulations Babu & Jasmine! Can not wait to celebrate with you both!',
        ]);

        $response->assertStatus(302);
        $this->assertEquals('attending', $guest->fresh()->rsvp_status);
        $this->assertEquals('Congratulations Babu & Jasmine! Can not wait to celebrate with you both!', $guest->fresh()->notes);
    }

    public function test_organizer_without_executive_package_or_override_cannot_customize_microsite(): void
    {
        $event = Event::with('user')->first();
        $organizer = $event->user;

        // Ensure organizer does not have executive package or admin override
        $organizer->update([
            'role' => 'customer',
            'permissions' => array_merge(User::defaultPermissions(), ['can_customize_microsite' => false]),
        ]);

        $response = $this->actingAs($organizer)->put(route('events.update', $event->id), [
            'title' => $event->title,
            'event_type' => $event->event_type,
            'event_date' => $event->event_date->format('Y-m-d'),
            'event_time' => $event->event_time,
            'venue' => $event->venue,
            'city' => $event->city,
            'microsite_config' => [
                'theme_color' => '#1b263b',
                'primary_name' => 'David',
            ],
        ]);

        $response->assertStatus(302);
        $this->assertNull($event->fresh()->microsite_config);

        // Guest pass should NOT have microsite enabled
        $guest = Guest::where('event_id', $event->id)->first();
        $cardResponse = $this->get(route('guest.card', $guest->qr_token));
        $cardResponse->assertStatus(200);
        $cardResponse->assertInertia(fn ($page) => $page
            ->component('Public/GuestPass')
            ->where('hasMicrosite', false)
            ->where('micrositeConfig', null)
        );
    }

    public function test_event_organizer_with_executive_package_or_admin_override_can_customize_microsite(): void
    {
        $event = Event::with('user')->first();
        $organizer = $event->user;

        // Grant admin override permission for microsite
        $organizer->update([
            'permissions' => array_merge(User::defaultPermissions(), ['can_customize_microsite' => true]),
        ]);

        $customConfig = [
            'theme_color' => '#1b263b',
            'accent_color' => '#e0a96d',
            'cover_photo' => 'https://example.com/custom-photo.jpg',
            'primary_name' => 'David',
            'secondary_name' => 'Sarah',
            'couple_title' => 'David & Sarah',
            'event_date_formatted' => '12 . 12 . 2026',
            'host_honor_text' => 'The families invite you with great joy',
            'invitation_text' => 'to celebrate the wedding of David & Sarah',
            'reception_title' => 'Serena Hotel Diamond Ballroom',
            'reception_subtitle' => 'An evening of joy and dancing.',
            'reception_time_badge' => 'Saturday, 12th December 2026, 6:00 PM',
            'mc_name' => 'MC Anthony',
            'mc_badge' => 'Master of Ceremonies',
            'mc_bio' => 'Celebrated host bringing cheer to the night.',
            'mc_hashtag' => '#DAVIDSARAH2026',
            'wedding_committee' => [
                ['name' => 'John Doe', 'phone' => '0712345678'],
            ],
            'programme' => [
                ['time' => '6:00 PM', 'title' => 'Red Carpet Arrivals', 'note' => 'Main Foyer'],
            ],
        ];

        $response = $this->actingAs($organizer)->put(route('events.update', $event->id), [
            'title' => $event->title,
            'event_type' => $event->event_type,
            'event_date' => $event->event_date->format('Y-m-d'),
            'event_time' => $event->event_time,
            'venue' => $event->venue,
            'city' => $event->city,
            'description' => $event->description,
            'microsite_config' => $customConfig,
        ]);

        $response->assertStatus(302);
        $this->assertEquals('#1b263b', $event->fresh()->microsite_config['theme_color']);
        $this->assertEquals('David', $event->fresh()->microsite_config['primary_name']);
        $this->assertEquals('MC Anthony', $event->fresh()->microsite_config['mc_name']);

        // Now verify guest viewing this event's card receives the customized config and hasMicrosite is true
        $guest = Guest::where('event_id', $event->id)->first();
        $cardResponse = $this->get(route('guest.card', $guest->qr_token));
        $cardResponse->assertStatus(200);
        $cardResponse->assertInertia(fn ($page) => $page
            ->component('Public/GuestPass')
            ->where('hasMicrosite', true)
            ->where('micrositeConfig.theme_color', '#1b263b')
            ->where('micrositeConfig.accent_color', '#e0a96d')
            ->where('micrositeConfig.primary_name', 'David')
            ->where('micrositeConfig.secondary_name', 'Sarah')
            ->where('micrositeConfig.mc_name', 'MC Anthony')
        );
    }

    public function test_purchased_executive_package_enables_microsite(): void
    {
        $event = Event::with('user')->first();
        $organizer = $event->user;

        // Ensure no direct admin permission override
        $organizer->update([
            'permissions' => array_merge(User::defaultPermissions(), ['can_customize_microsite' => false]),
        ]);

        // Create completed Executive Package transaction
        FinancialTransaction::create([
            'transaction_number' => 'TRX-TEST-EXEC-01',
            'type' => 'income',
            'category' => 'package_purchase',
            'title' => 'Package Purchase: Executive (200 cards @ 2,500 TZS)',
            'amount' => 500000,
            'currency' => 'TZS',
            'payment_method' => 'Airtel',
            'reference' => 'PKG-4',
            'user_id' => $organizer->id,
            'status' => 'completed',
            'transaction_date' => now(),
            'notes' => json_encode(['package_id' => 4, 'package_name' => 'Executive']),
        ]);

        $this->assertTrue($organizer->fresh()->hasPurchasedExecutivePackage());
        $this->assertTrue($organizer->fresh()->canCustomizeMicrosite());
        $this->assertTrue($event->fresh()->hasMicrositeEnabled());

        $guest = Guest::where('event_id', $event->id)->first();
        $cardResponse = $this->get(route('guest.card', $guest->qr_token));
        $cardResponse->assertStatus(200);
        $cardResponse->assertInertia(fn ($page) => $page
            ->component('Public/GuestPass')
            ->where('hasMicrosite', true)
            ->has('micrositeConfig')
        );
    }

    public function test_event_admin_override_enables_microsite_without_package(): void
    {
        $event = Event::with('user')->first();
        $organizer = $event->user;

        $organizer->update([
            'permissions' => array_merge(User::defaultPermissions(), ['can_customize_microsite' => false]),
        ]);

        // Event-specific admin override
        $event->update([
            'microsite_config' => ['admin_override' => true],
        ]);

        $this->assertTrue($event->fresh()->hasMicrositeEnabled());

        $guest = Guest::where('event_id', $event->id)->first();
        $cardResponse = $this->get(route('guest.card', $guest->qr_token));
        $cardResponse->assertStatus(200);
        $cardResponse->assertInertia(fn ($page) => $page
            ->component('Public/GuestPass')
            ->where('hasMicrosite', true)
        );
    }

    public function test_kj_microsite_route_renders_guest_pass(): void
    {
        $guest = Guest::first();
        $guest->event->update(['microsite_config' => ['admin_override' => true]]);

        $response = $this->get('/kj/'.$guest->unique_code);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/GuestPass')
            ->where('hasMicrosite', true)
            ->has('micrositeConfig')
        );
    }
}
