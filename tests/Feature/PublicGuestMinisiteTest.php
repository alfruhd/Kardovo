<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Guest;
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

    public function test_demo_pass_renders_with_luxury_kadijanja_microsite_config(): void
    {
        $response = $this->get(route('guest.demoPass'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/GuestPass')
            ->has('micrositeConfig')
            ->where('micrositeConfig.theme_color', '#3a4634')
            ->where('micrositeConfig.accent_color', '#5C4033')
            ->where('micrositeConfig.primary_name', 'Baraka')
            ->where('micrositeConfig.secondary_name', 'Neema')
            ->where('micrositeConfig.show_intro_animation', true)
            ->where('micrositeConfig.intro_video_url', 'https://www.kadijanja.co.tz/images/rsvp/cover/baja.mp4')
            ->where('micrositeConfig.intro_poster_url', 'https://www.kadijanja.co.tz/images/rsvp/cover/baja.png')
            ->where('micrositeConfig.mc_name', 'Mc MishieBomba')
            ->has('micrositeConfig.wedding_committee', 2)
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

    public function test_event_organizer_can_customize_all_microsite_sections(): void
    {
        $event = Event::with('user')->first();
        $organizer = $event->user;

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

        // Now verify guest viewing this event's card receives the customized config
        $guest = Guest::where('event_id', $event->id)->first();
        $cardResponse = $this->get(route('guest.card', $guest->qr_token));
        $cardResponse->assertStatus(200);
        $cardResponse->assertInertia(fn ($page) => $page
            ->component('Public/GuestPass')
            ->where('micrositeConfig.theme_color', '#1b263b')
            ->where('micrositeConfig.accent_color', '#e0a96d')
            ->where('micrositeConfig.primary_name', 'David')
            ->where('micrositeConfig.secondary_name', 'Sarah')
            ->where('micrositeConfig.mc_name', 'MC Anthony')
        );
    }

    public function test_kj_microsite_route_renders_guest_pass(): void
    {
        $response = $this->get('/kj/A8L0001');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/GuestPass')
            ->has('micrositeConfig')
        );
    }
}
