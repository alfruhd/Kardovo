<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\FinancialTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

class FinanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_financial_analytics()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        FinancialTransaction::create([
            'transaction_number' => 'TRX-TEST-001',
            'type' => 'income',
            'category' => 'pass_sales',
            'title' => 'Test Pass Sales',
            'amount' => 500000,
            'currency' => 'TZS',
            'payment_method' => 'M-Pesa',
            'status' => 'completed',
            'transaction_date' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.finance'));
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Finance')
            ->has('metrics')
            ->has('monthly_trend')
            ->has('transactions')
        );
    }

    public function test_non_admin_cannot_access_finance()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $response = $this->actingAs($customer)->get(route('admin.finance'));
        $response->assertStatus(403);
    }

    public function test_admin_can_export_filtered_csv()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        FinancialTransaction::create([
            'transaction_number' => 'TRX-EXP-001',
            'type' => 'expense',
            'category' => 'carrier_sms_cogs',
            'title' => 'Bulk SMS NextSMS Wholesale',
            'amount' => 120000,
            'currency' => 'TZS',
            'payment_method' => 'Bank Wire',
            'status' => 'completed',
            'transaction_date' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.finance.export', ['type' => 'expense']));
        $response->assertStatus(200);
        $this->assertTrue(str_contains($response->headers->get('content-disposition'), 'Kardovo_Financial_Audit_expense_'));
    }

    public function test_super_admin_can_update_organizer_role_and_permissions()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $organizer = User::factory()->create([
            'role' => 'customer',
            'status' => 'active',
            'permissions' => [
                'can_create_events' => true,
                'can_send_broadcasts' => true,
            ],
        ]);

        $response = $this->actingAs($admin)->put(route('admin.updateCustomer', $organizer->id), [
            'name' => 'Updated Organizer',
            'email' => $organizer->email,
            'role' => 'sub_admin',
            'status' => 'active',
            'permissions' => [
                'can_create_events' => false,
                'can_send_broadcasts' => false,
                'can_import_guests' => true,
                'can_customize_templates' => false,
                'can_manage_scanners' => true,
                'can_export_data' => false,
            ],
        ]);

        $response->assertRedirect();
        $organizer->refresh();

        $this->assertEquals('sub_admin', $organizer->role);
        $this->assertFalse($organizer->effective_permissions['can_create_events']);
        $this->assertFalse($organizer->effective_permissions['can_send_broadcasts']);
        $this->assertTrue($organizer->effective_permissions['can_import_guests']);
    }

    public function test_organizer_with_disabled_event_creation_permission_cannot_create_event()
    {
        $organizer = User::factory()->create([
            'role' => 'customer',
            'status' => 'active',
            'permissions' => [
                'can_create_events' => false,
            ],
        ]);

        $response = $this->actingAs($organizer)->post(route('events.store'), [
            'title' => 'Blocked Gala Event',
            'event_type' => 'Gala Dinner',
            'event_date' => now()->addDays(10)->toDateString(),
            'venue' => 'Serena Hotel',
            'city' => 'Dar es Salaam',
        ]);

        $response->assertSessionHas('error');
    }
}
