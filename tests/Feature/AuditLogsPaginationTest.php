<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuditLogsPaginationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_audit_logs_are_paginated_at_50_per_page(): void
    {
        $admin = User::where('role', 'admin')->first();

        AuditLog::query()->delete();

        for ($i = 0; $i < 60; $i++) {
            AuditLog::create([
                'user_id' => $admin->id,
                'action' => 'test_action_'.$i,
                'resource_type' => 'App\Models\User',
                'resource_id' => (string) $admin->id,
                'ip_address' => '127.0.0.1',
                'outcome' => 'success',
            ]);
        }

        $response = $this->actingAs($admin)->get(route('admin.auditLogs'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/AuditLogs')
            ->has('logs.data', 50)
            ->where('logs.per_page', 50)
            ->where('logs.total', 60)
            ->where('logs.last_page', 2)
        );

        // Test page 2 has remaining 10
        $page2Response = $this->actingAs($admin)->get(route('admin.auditLogs', ['page' => 2]));
        $page2Response->assertStatus(200);
        $page2Response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/AuditLogs')
            ->has('logs.data', 10)
            ->where('logs.current_page', 2)
        );
    }

    public function test_legacy_admin_logs_route_redirects_to_audit_logs(): void
    {
        $admin = User::where('role', 'admin')->first();

        $response = $this->actingAs($admin)->get('/admin/logs');

        $response->assertRedirect(route('admin.auditLogs'));
    }
}
