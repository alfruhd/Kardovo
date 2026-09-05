<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Guest;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeliveryLogDeletionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_delete_delivery_log(): void
    {
        $admin = User::where('role', 'admin')->first();
        $message = Message::first();

        $this->assertNotNull($message);

        $response = $this->actingAs($admin)->delete(route('messaging.destroyLog', $message->id));

        $response->assertStatus(302);
        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    }

    public function test_sub_admin_can_delete_delivery_log_for_assigned_event(): void
    {
        $subAdmin = User::where('role', 'sub_admin')->first();
        if (!$subAdmin) {
            $subAdmin = User::factory()->create(['role' => 'sub_admin']);
        }

        $message = Message::first();
        $event = $message->event;

        // Assign event to sub-admin
        $subAdmin->assignedEvents()->attach($event->id);

        $response = $this->actingAs($subAdmin)->delete(route('messaging.destroyLog', $message->id));

        $response->assertStatus(302);
        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    }

    public function test_customer_cannot_delete_delivery_log(): void
    {
        $customer = User::where('role', 'customer')->first();
        $message = Message::first();

        $response = $this->actingAs($customer)->delete(route('messaging.destroyLog', $message->id));

        $response->assertStatus(403);
        $this->assertDatabaseHas('messages', ['id' => $message->id]);
    }

    public function test_scanner_cannot_delete_delivery_log(): void
    {
        $scanner = User::where('role', 'scanner')->first();
        $message = Message::first();

        $response = $this->actingAs($scanner)->delete(route('messaging.destroyLog', $message->id));

        $response->assertStatus(403);
        $this->assertDatabaseHas('messages', ['id' => $message->id]);
    }
}
