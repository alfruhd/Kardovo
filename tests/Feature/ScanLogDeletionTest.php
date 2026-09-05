<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\ScanLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScanLogDeletionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_delete_individual_scan_log(): void
    {
        $admin = User::where('role', 'admin')->first();
        $scanLog = ScanLog::first();

        $this->assertNotNull($scanLog);

        $response = $this->actingAs($admin)->delete(route('admin.destroyScanLog', $scanLog->id));

        $response->assertStatus(302);
        $this->assertDatabaseMissing('scan_logs', ['id' => $scanLog->id]);
    }

    public function test_admin_can_clear_all_scan_logs(): void
    {
        $admin = User::where('role', 'admin')->first();
        $this->assertGreaterThan(0, ScanLog::count());

        $response = $this->actingAs($admin)->delete(route('admin.clearScanLogs'));

        $response->assertStatus(302);
        $this->assertEquals(0, ScanLog::count());
    }

    public function test_sub_admin_can_delete_scan_log_for_assigned_event(): void
    {
        $subAdmin = User::where('role', 'sub_admin')->first();
        if (! $subAdmin) {
            $subAdmin = User::factory()->create(['role' => 'sub_admin']);
        }

        $scanLog = ScanLog::first();
        $event = $scanLog->event;

        // Assign event to sub-admin
        $subAdmin->assignedEvents()->attach($event->id);

        $response = $this->actingAs($subAdmin)->delete(route('admin.destroyScanLog', $scanLog->id));

        $response->assertStatus(302);
        $this->assertDatabaseMissing('scan_logs', ['id' => $scanLog->id]);
    }

    public function test_customer_can_delete_scan_log_for_own_event(): void
    {
        $scanLog = ScanLog::first();
        $event = $scanLog->event;
        $customer = $event->user;

        $response = $this->actingAs($customer)->delete(route('events.destroyScanLog', [$event->id, $scanLog->id]));

        $response->assertStatus(302);
        $this->assertDatabaseMissing('scan_logs', ['id' => $scanLog->id]);
    }

    public function test_customer_cannot_delete_scan_log_from_admin_route(): void
    {
        $customer = User::where('role', 'customer')->first();
        $scanLog = ScanLog::first();

        $response = $this->actingAs($customer)->delete(route('admin.destroyScanLog', $scanLog->id));

        $response->assertStatus(403);
        $this->assertDatabaseHas('scan_logs', ['id' => $scanLog->id]);
    }

    public function test_customer_cannot_clear_all_scan_logs(): void
    {
        $customer = User::where('role', 'customer')->first();

        $response = $this->actingAs($customer)->delete(route('admin.clearScanLogs'));

        $response->assertStatus(403);
        $this->assertGreaterThan(0, ScanLog::count());
    }

    public function test_scanner_cannot_delete_scan_log(): void
    {
        $scanner = User::where('role', 'scanner')->first();
        $scanLog = ScanLog::first();
        $event = $scanLog->event;

        $response = $this->actingAs($scanner)->delete(route('events.destroyScanLog', [$event->id, $scanLog->id]));
        $response->assertStatus(403);

        $response2 = $this->actingAs($scanner)->delete(route('admin.destroyScanLog', $scanLog->id));
        $response2->assertStatus(403);

        $this->assertDatabaseHas('scan_logs', ['id' => $scanLog->id]);
    }

    public function test_customer_can_clear_all_scan_logs_for_own_event(): void
    {
        $scanLog = ScanLog::first();
        $event = $scanLog->event;
        $customer = $event->user;

        $this->assertGreaterThan(0, ScanLog::where('event_id', $event->id)->count());

        $response = $this->actingAs($customer)->delete(route('events.clearScanLogs', $event->id));

        $response->assertStatus(302);
        $this->assertEquals(0, ScanLog::where('event_id', $event->id)->count());
    }

    public function test_customer_cannot_clear_scan_logs_for_other_customer_event(): void
    {
        $scanLog = ScanLog::first();
        $event = $scanLog->event;
        $otherCustomer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($otherCustomer)->delete(route('events.clearScanLogs', $event->id));

        $response->assertStatus(403);
        $this->assertGreaterThan(0, ScanLog::where('event_id', $event->id)->count());
    }

    public function test_customer_can_clear_all_guests_for_own_event(): void
    {
        $customer = User::where('role', 'customer')->first();
        $event = $customer->events()->first();

        $this->assertNotNull($event);
        $this->assertGreaterThan(0, $event->guests()->count());

        $response = $this->actingAs($customer)->delete(route('guests.clearAll', $event->id));

        $response->assertStatus(302);
        $this->assertEquals(0, $event->guests()->count());
    }

    public function test_customer_cannot_clear_guests_for_other_customer_event(): void
    {
        $customer = User::where('role', 'customer')->first();
        $event = $customer->events()->first();
        $otherCustomer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($otherCustomer)->delete(route('guests.clearAll', $event->id));

        $response->assertStatus(403);
        $this->assertGreaterThan(0, $event->guests()->count());
    }
}
