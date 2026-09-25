<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Ticket;
use App\Models\TicketOrder;
use App\Models\TicketTier;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ticket_order_id' => TicketOrder::factory(),
            'event_id' => fn () => Event::first()?->id ?? Event::create([
                'user_id' => User::first()?->id ?? User::factory()->create()->id,
                'title' => 'Sample Event',
                'event_type' => 'Event',
                'event_date' => now()->addDays(7),
                'venue' => 'Main Hall',
            ])->id,
            'ticket_tier_id' => TicketTier::factory(),
            'ticket_number' => Ticket::generateTicketNumber(),
            'unique_code' => Ticket::generateUniqueCode(),
            'qr_token' => Str::random(32),
            'attendee_name' => fake()->name(),
            'attendee_phone' => '2557'.fake()->numerify('########'),
            'attendee_email' => fake()->safeEmail(),
            'price_paid' => 30000,
            'currency' => 'TZS',
            'status' => 'valid',
            'checked_in_at' => null,
            'checked_in_by' => null,
            'gate_label' => 'Main Gate',
            'delivery_channels' => [],
        ];
    }
}
