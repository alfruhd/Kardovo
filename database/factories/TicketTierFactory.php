<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\TicketTier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TicketTier>
 */
class TicketTierFactory extends Factory
{
    protected $model = TicketTier::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => fn () => Event::first()?->id ?? Event::create([
                'user_id' => User::first()?->id ?? User::factory()->create()->id,
                'title' => 'Sample Event',
                'event_type' => 'Event',
                'event_date' => now()->addDays(7),
                'venue' => 'Main Hall',
            ])->id,
            'name' => fake()->randomElement(['VIP Pass', 'Regular Admission', 'Early Bird', 'VVIP Table']),
            'description' => fake()->sentence(),
            'price' => fake()->randomElement([15000, 30000, 50000, 100000]),
            'currency' => 'TZS',
            'capacity' => 100,
            'sold_count' => 0,
            'max_per_order' => 10,
            'sales_start_at' => now()->subDay(),
            'sales_end_at' => now()->addMonth(),
            'status' => 'active',
            'sort_order' => 1,
            'color' => '#10b981',
        ];
    }
}
