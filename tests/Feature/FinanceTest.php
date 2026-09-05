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
        $this->assertTrue(str_contains($response->headers->get('content-disposition'), 'Kardovo_Financial_Ledger_expense_') || str_contains($response->headers->get('content-disposition'), 'Kardovo_Financial_Audit_expense_'));
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

    public function test_admin_can_update_and_refresh_exchange_rate()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Test manual update
        $response = $this->actingAs($admin)->post(route('admin.finance.exchangeRate.update'), [
            'rate' => 2680.50,
        ]);
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $rateData = \App\Services\ExchangeRateService::getRateData();
        $this->assertEquals(2680.50, $rateData['rate']);
        $this->assertTrue($rateData['is_manual']);

        // Test refresh to live
        $refreshResponse = $this->actingAs($admin)->post(route('admin.finance.exchangeRate.refresh'));
        $refreshResponse->assertRedirect();
        $refreshResponse->assertSessionHas('success');
    }

    public function test_period_filters_function_correctly()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // 1. Transaction within 10 days (in 30days, 90days, this_year, all)
        FinancialTransaction::create([
            'transaction_number' => 'TRX-10D',
            'type' => 'income',
            'category' => 'pass_sales',
            'title' => 'Recent 10 Days Sale',
            'amount' => 100000,
            'currency' => 'TZS',
            'payment_method' => 'M-Pesa',
            'status' => 'completed',
            'transaction_date' => now()->subDays(10),
        ]);

        // 2. Transaction 45 days ago (in 90days, this_year, all - NOT in 30days)
        FinancialTransaction::create([
            'transaction_number' => 'TRX-45D',
            'type' => 'income',
            'category' => 'pass_sales',
            'title' => 'Past 45 Days Sale',
            'amount' => 200000,
            'currency' => 'TZS',
            'payment_method' => 'M-Pesa',
            'status' => 'completed',
            'transaction_date' => now()->subDays(45),
        ]);

        // 3. Transaction 120 days ago (in this_year if same year, all - NOT in 30days, NOT in 90days)
        FinancialTransaction::create([
            'transaction_number' => 'TRX-120D',
            'type' => 'income',
            'category' => 'pass_sales',
            'title' => 'Past 120 Days Sale',
            'amount' => 300000,
            'currency' => 'TZS',
            'payment_method' => 'M-Pesa',
            'status' => 'completed',
            'transaction_date' => now()->subDays(120),
        ]);

        // 4. Transaction 2 years ago (only in all - NOT in 30days, 90days, this_year)
        FinancialTransaction::create([
            'transaction_number' => 'TRX-2YR',
            'type' => 'income',
            'category' => 'pass_sales',
            'title' => 'Old Sale 2 Years Ago',
            'amount' => 400000,
            'currency' => 'TZS',
            'payment_method' => 'M-Pesa',
            'status' => 'completed',
            'transaction_date' => now()->subYears(2),
        ]);

        // Test 30 Days filter
        $response30 = $this->actingAs($admin)->get(route('admin.finance', ['period' => '30days']));
        $response30->assertStatus(200);
        $response30->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Finance')
            ->where('filters.period', '30days')
            ->where('metrics.gross_revenue', 100000)
            ->has('transactions', 1)
        );

        // Test 90 Days filter
        $response90 = $this->actingAs($admin)->get(route('admin.finance', ['period' => '90days']));
        $response90->assertStatus(200);
        $response90->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Finance')
            ->where('filters.period', '90days')
            ->where('metrics.gross_revenue', 300000) // 100000 + 200000
            ->has('transactions', 2)
        );

        // Test This Year filter
        $responseYear = $this->actingAs($admin)->get(route('admin.finance', ['period' => 'this_year']));
        $responseYear->assertStatus(200);
        $responseYear->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Finance')
            ->where('filters.period', 'this_year')
            ->where('metrics.gross_revenue', fn ($val) => $val >= 300000)
        );

        // Test All Time filter
        $responseAll = $this->actingAs($admin)->get(route('admin.finance', ['period' => 'all']));
        $responseAll->assertStatus(200);
        $responseAll->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Finance')
            ->where('filters.period', 'all')
            ->where('metrics.gross_revenue', 1000000) // 100k + 200k + 300k + 400k
            ->has('yearly_cashflow')
            ->has('monthly_cashflow')
            ->has('available_years')
            ->has('transactions', 4)
        );
    }

    public function test_admin_can_export_pdf_financial_report()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        FinancialTransaction::create([
            'transaction_number' => 'TRX-PDF-001',
            'type' => 'income',
            'category' => 'pass_sales',
            'title' => 'PDF Report Pass Sale',
            'amount' => 750000,
            'currency' => 'TZS',
            'payment_method' => 'M-Pesa',
            'status' => 'completed',
            'transaction_date' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.finance.exportPdf', ['period' => 'all']));
        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));
        $this->assertTrue(str_contains($response->headers->get('content-disposition'), 'Kardovo_Financial_Statement_all_'));
    }

    public function test_admin_can_export_cashflow_statement_csv()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        FinancialTransaction::create([
            'transaction_number' => 'TRX-CF-001',
            'type' => 'income',
            'category' => 'pass_sales',
            'title' => 'Cashflow Statement Sale',
            'amount' => 500000,
            'currency' => 'TZS',
            'payment_method' => 'M-Pesa',
            'status' => 'completed',
            'transaction_date' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('admin.finance.export', ['format' => 'cashflow']));
        $response->assertStatus(200);
        $this->assertTrue(str_contains($response->headers->get('content-disposition'), 'Kardovo_Cashflow_Statement_'));
    }
}
