<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\TicketOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TicketOrder>
 */
class TicketOrderFactory extends Factory
{
    protected $model = TicketOrder::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->randomElement([30000, 60000, 100000]);

        return [
            'order_number' => TicketOrder::generateOrderNumber(),
            'event_id' => fn () => Event::first()?->id ?? Event::create([
                'user_id' => User::first()?->id ?? User::factory()->create()->id,
                'title' => 'Sample Event',
                'event_type' => 'Event',
                'event_date' => now()->addDays(7),
                'venue' => 'Main Hall',
            ])->id,
            'user_id' => null,
            'buyer_name' => fake()->name(),
            'buyer_phone' => '2557'.fake()->numerify('########'),
            'buyer_email' => fake()->safeEmail(),
            'subtotal' => $amount,
            'platform_fee' => 1500,
            'total_amount' => $amount,
            'currency' => 'TZS',
            'payment_method' => fake()->randomElement(['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Card']),
            'payment_reference' => 'REF-'.fake()->numerify('######'),
            'payment_status' => 'paid',
            'paid_at' => now(),
            'metadata' => [],
        ];
    }
}
