<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventUpdateSpeedTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_event_update_returns_fast_json_response(): void
    {
        $user = User::first();
        $event = Event::first();

        $response = $this->actingAs($user)
            ->putJson(route('events.update', $event->id), [
                'title' => 'Updated Fast Wedding Reception',
                'event_type' => $event->event_type,
                'event_date' => '2026-09-20',
                'venue' => $event->venue,
                'city' => $event->city,
                'microsite_config' => [
                    'primary_name' => 'Baraka',
                    'secondary_name' => 'Neema',
                    'theme_color' => '#123456',
                ],
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonPath('event.title', 'Updated Fast Wedding Reception');
        $response->assertJsonPath('event.microsite_config.theme_color', '#123456');

        $this->assertDatabaseHas('events', [
            'id' => $event->id,
            'title' => 'Updated Fast Wedding Reception',
        ]);
    }
}
