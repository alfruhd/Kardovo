<?php

namespace Tests\Feature;

use App\Models\FinancialBill;
use App\Models\FinancialTransaction;
use App\Models\User;
use App\Notifications\BillReminderNotification;
use App\Services\ExchangeRateService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

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

        $rateData = ExchangeRateService::getRateData();
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

        // Test Weekly / 7 Days filter
        $response7 = $this->actingAs($admin)->get(route('admin.finance', ['period' => '7days']));
        $response7->assertStatus(200);
        $response7->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Finance')
            ->where('filters.period', '7days')
            ->where('metrics.gross_revenue', 0) // 10D transaction is 10 days ago, not in 7 days
            ->has('transactions', 0)
        );

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

        // Test Semi-Annual / 180 Days filter
        $response180 = $this->actingAs($admin)->get(route('admin.finance', ['period' => 'half_year']));
        $response180->assertStatus(200);
        $response180->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Finance')
            ->where('filters.period', 'half_year')
            ->where('metrics.gross_revenue', 600000) // 100k + 200k + 300k
            ->has('transactions', 3)
        );

        // Test Custom Date Range filter (spanning past 30 to 60 days)
        $responseCustom = $this->actingAs($admin)->get(route('admin.finance', [
            'period' => 'custom',
            'from' => now()->subDays(60)->toDateString(),
            'to' => now()->subDays(30)->toDateString(),
        ]));
        $responseCustom->assertStatus(200);
        $responseCustom->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Finance')
            ->where('filters.period', 'custom')
            ->where('metrics.gross_revenue', 200000) // Only the 45D transaction
            ->has('transactions', 1)
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

    public function test_admin_can_export_custom_interval_reports()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        FinancialTransaction::create([
            'transaction_number' => 'TRX-INT-001',
            'type' => 'income',
            'category' => 'pass_sales',
            'title' => 'Weekly Pass Sale',
            'amount' => 450000,
            'currency' => 'TZS',
            'payment_method' => 'M-Pesa',
            'status' => 'completed',
            'transaction_date' => now()->subDays(2),
        ]);

        // PDF Weekly
        $resPdfWeekly = $this->actingAs($admin)->get(route('admin.finance.exportPdf', ['period' => 'weekly']));
        $resPdfWeekly->assertStatus(200);
        $this->assertEquals('application/pdf', $resPdfWeekly->headers->get('content-type'));

        // PDF Quarterly
        $resPdfQuarterly = $this->actingAs($admin)->get(route('admin.finance.exportPdf', ['period' => 'quarterly']));
        $resPdfQuarterly->assertStatus(200);
        $this->assertEquals('application/pdf', $resPdfQuarterly->headers->get('content-type'));

        // PDF Custom Date Range
        $resPdfCustom = $this->actingAs($admin)->get(route('admin.finance.exportPdf', [
            'period' => 'custom',
            'from' => now()->subDays(5)->toDateString(),
            'to' => now()->toDateString(),
        ]));
        $resPdfCustom->assertStatus(200);
        $this->assertEquals('application/pdf', $resPdfCustom->headers->get('content-type'));

        // CSV Custom Date Range
        $resCsvCustom = $this->actingAs($admin)->get(route('admin.finance.export', [
            'period' => 'custom',
            'from' => now()->subDays(5)->toDateString(),
            'to' => now()->toDateString(),
        ]));
        $resCsvCustom->assertStatus(200);
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

    public function test_admin_can_create_billed_expense()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.finance.bills.store'), [
            'vendor_name' => 'NextSMS Tanzania',
            'title' => 'Wholesale Carrier Bulk SMS Bundle',
            'category' => 'carrier_sms_cogs',
            'amount' => 250000,
            'bill_date' => now()->toDateString(),
            'due_date' => now()->addDays(5)->toDateString(),
            'is_recurring' => true,
            'recurrence_period' => 'monthly',
            'payment_method_intended' => 'Bank Wire',
            'reminder_enabled' => true,
            'reminder_days_before' => 3,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('financial_bills', [
            'vendor_name' => 'NextSMS Tanzania',
            'category' => 'carrier_sms_cogs',
            'amount' => 250000,
            'status' => 'pending',
            'is_recurring' => true,
        ]);
    }

    public function test_paying_bill_automatically_creates_ledger_expense_and_spawns_recurring_cycle()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $bill = FinancialBill::create([
            'bill_number' => 'BILL-TEST-001',
            'vendor_name' => 'Meta Platforms Ireland',
            'title' => 'WhatsApp Cloud API Monthly Usage',
            'category' => 'whatsapp_api_cogs',
            'amount' => 180000,
            'currency' => 'TZS',
            'bill_date' => now()->toDateString(),
            'due_date' => now()->addDays(2)->toDateString(),
            'status' => 'pending',
            'is_recurring' => true,
            'recurrence_period' => 'monthly',
            'payment_method_intended' => 'Card',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.finance.bills.pay', $bill->id), [
            'payment_method' => 'Stripe/Card',
            'reference' => 'PAY-CARD-9921',
            'payment_date' => now()->toDateString(),
        ]);

        $response->assertRedirect();
        $bill->refresh();

        // Bill is marked as paid
        $this->assertEquals('paid', $bill->status);
        $this->assertNotNull($bill->financial_transaction_id);

        // Matching FinancialTransaction was automatically created in the ledger
        $this->assertDatabaseHas('financial_transactions', [
            'id' => $bill->financial_transaction_id,
            'type' => 'expense',
            'category' => 'whatsapp_api_cogs',
            'amount' => 180000,
            'payment_method' => 'Stripe/Card',
            'reference' => 'PAY-CARD-9921',
            'status' => 'completed',
        ]);

        // Next monthly recurring bill cycle was automatically spawned
        $this->assertDatabaseHas('financial_bills', [
            'vendor_name' => 'Meta Platforms Ireland',
            'category' => 'whatsapp_api_cogs',
            'status' => 'pending',
            'is_recurring' => true,
            'recurrence_period' => 'monthly',
        ]);
    }

    public function test_admin_finance_view_includes_bills_and_reminders()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        FinancialBill::create([
            'bill_number' => 'BILL-REMIND-001',
            'vendor_name' => 'Contabo Hosting GmbH',
            'title' => 'VPS Server Dedicated Node',
            'category' => 'server_infrastructure',
            'amount' => 95000,
            'currency' => 'TZS',
            'bill_date' => now()->subDays(10)->toDateString(),
            'due_date' => now()->addDays(2)->toDateString(), // Due this week
            'status' => 'pending',
            'is_recurring' => true,
            'recurrence_period' => 'monthly',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.finance'));
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Finance')
            ->has('bills', 1)
            ->has('reminders')
            ->where('reminders.due_this_week_count', 1)
        );
    }

    public function test_check_bill_reminders_command()
    {
        $admin = User::factory()->create(['role' => 'admin', 'email' => 'admin@kardovo.test']);

        // Overdue bill
        FinancialBill::create([
            'bill_number' => 'BILL-OVERDUE-01',
            'vendor_name' => 'Office Rent',
            'title' => 'Dar es Salaam Hub Office Rent',
            'category' => 'operations',
            'amount' => 500000,
            'bill_date' => now()->subMonth()->toDateString(),
            'due_date' => now()->subDays(3)->toDateString(),
            'status' => 'pending',
            'reminder_enabled' => true,
            'reminder_days_before' => 3,
        ]);

        Notification::fake();

        $this->artisan('finance:check-reminders')
            ->assertSuccessful();

        $this->assertDatabaseHas('financial_bills', [
            'bill_number' => 'BILL-OVERDUE-01',
            'status' => 'overdue',
        ]);

        Notification::assertSentTo(
            $admin,
            BillReminderNotification::class
        );
    }
}
