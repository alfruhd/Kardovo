<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\FinancialBill;
use App\Models\FinancialTransaction;
use App\Models\User;
use App\Notifications\BillReminderNotification;
use App\Services\ExchangeRateService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403, 'Financial administration access required.');
        }

        $period = $request->input('period', 'all');
        $typeFilter = $request->input('type', 'all');
        $categoryFilter = $request->input('category', 'all');
        $search = $request->input('search', '');
        $selectedYear = $request->input('year', 'all');

        $query = FinancialTransaction::with(['user:id,name,email,company', 'event:id,title,venue,event_date']);

        $this->applyPeriodFilter($query, $request);

        $allPeriodTransactions = (clone $query)->get();

        $grossRevenue = (float) $allPeriodTransactions->where('type', 'income')->where('status', 'completed')->sum('amount');
        $totalExpenses = (float) $allPeriodTransactions->where('type', 'expense')->where('status', 'completed')->sum('amount');

        $directCogs = (float) $allPeriodTransactions->where('type', 'expense')
            ->whereIn('category', ['carrier_sms_cogs', 'whatsapp_api_cogs', 'payment_gateway_fee'])
            ->where('status', 'completed')
            ->sum('amount');

        $grossProfit = (float) ($grossRevenue - $directCogs);
        $grossMarginPct = $grossRevenue > 0 ? round(($grossProfit / $grossRevenue) * 100, 1) : 0;

        $netProfit = (float) ($grossRevenue - $totalExpenses);
        $netMarginPct = $grossRevenue > 0 ? round(($netProfit / $grossRevenue) * 100, 1) : 0;

        $pendingIncome = (float) $allPeriodTransactions->where('type', 'income')->where('status', 'pending')->sum('amount');
        $pendingExpenses = (float) $allPeriodTransactions->where('type', 'expense')->where('status', 'pending')->sum('amount');

        $incomeByCategory = [
            'package_purchase' => (float) $allPeriodTransactions->where('type', 'income')->where('category', 'package_purchase')->where('status', 'completed')->sum('amount'),
            'pass_sales' => (float) $allPeriodTransactions->where('type', 'income')->where('category', 'pass_sales')->where('status', 'completed')->sum('amount'),
            'sms_credits' => (float) $allPeriodTransactions->where('type', 'income')->where('category', 'sms_credits')->where('status', 'completed')->sum('amount'),
            'design_service' => (float) $allPeriodTransactions->where('type', 'income')->where('category', 'design_service')->where('status', 'completed')->sum('amount'),
            'subscription' => (float) $allPeriodTransactions->where('type', 'income')->where('category', 'subscription')->where('status', 'completed')->sum('amount'),
            'other_income' => (float) $allPeriodTransactions->where('type', 'income')->whereNotIn('category', ['package_purchase', 'pass_sales', 'sms_credits', 'design_service', 'subscription'])->where('status', 'completed')->sum('amount'),
        ];

        $expenseByCategory = [
            'carrier_sms' => (float) $allPeriodTransactions->where('type', 'expense')->where('category', 'carrier_sms_cogs')->where('status', 'completed')->sum('amount'),
            'whatsapp_api' => (float) $allPeriodTransactions->where('type', 'expense')->where('category', 'whatsapp_api_cogs')->where('status', 'completed')->sum('amount'),
            'server_infrastructure' => (float) $allPeriodTransactions->where('type', 'expense')->where('category', 'server_infrastructure')->where('status', 'completed')->sum('amount'),
            'payment_fees' => (float) $allPeriodTransactions->where('type', 'expense')->where('category', 'payment_gateway_fee')->where('status', 'completed')->sum('amount'),
            'operations' => (float) $allPeriodTransactions->where('type', 'expense')->whereIn('category', ['operations', 'marketing', 'other'])->where('status', 'completed')->sum('amount'),
        ];

        // 6-Month rolling trend
        $allCompletedTxs = FinancialTransaction::where('status', 'completed')
            ->get(['id', 'amount', 'type', 'category', 'transaction_date']);

        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = now()->subMonths($i);
            $year = $monthDate->year;
            $month = $monthDate->month;
            $monthName = $monthDate->format('M Y');

            $matching = $allCompletedTxs->filter(function ($tx) use ($year, $month) {
                if (! $tx->transaction_date) {
                    return false;
                }
                $d = Carbon::parse($tx->transaction_date);

                return $d->year === $year && $d->month === $month;
            });

            $mIncome = (float) $matching->where('type', 'income')->sum('amount');
            $mExpense = (float) $matching->where('type', 'expense')->sum('amount');

            $monthlyTrend[] = [
                'month' => $monthName,
                'income' => $mIncome,
                'expense' => $mExpense,
                'net' => (float) ($mIncome - $mExpense),
            ];
        }

        // Extract available years from database
        $availableYears = $allCompletedTxs->toBase()->map(function ($tx) {
            return $tx->transaction_date ? Carbon::parse($tx->transaction_date)->year : (int) now()->year;
        })->push((int) now()->year)->unique()->sortDesc()->values()->toArray();

        // Compute Yearly Cashflow Summary for all years in memory
        $yearlyCashflow = [];
        foreach ($availableYears as $yr) {
            $yrTxs = $allCompletedTxs->filter(function ($tx) use ($yr) {
                return $tx->transaction_date && Carbon::parse($tx->transaction_date)->year === (int) $yr;
            });

            $yrInflow = (float) $yrTxs->where('type', 'income')->sum('amount');
            $yrOutflow = (float) $yrTxs->where('type', 'expense')->sum('amount');
            $yrCogs = (float) $yrTxs->where('type', 'expense')->whereIn('category', ['carrier_sms_cogs', 'whatsapp_api_cogs', 'payment_gateway_fee'])->sum('amount');
            $yrNet = (float) ($yrInflow - $yrOutflow);
            $yrMargin = $yrInflow > 0 ? round(($yrNet / $yrInflow) * 100, 1) : 0;
            $yrGrossMargin = $yrInflow > 0 ? round((($yrInflow - $yrCogs) / $yrInflow) * 100, 1) : 0;

            $yearlyCashflow[] = [
                'year' => (int) $yr,
                'gross_revenue' => $yrInflow,
                'total_expenses' => $yrOutflow,
                'direct_cogs' => $yrCogs,
                'gross_profit' => (float) ($yrInflow - $yrCogs),
                'gross_margin_pct' => $yrGrossMargin,
                'net_profit' => $yrNet,
                'net_margin_pct' => $yrMargin,
                'transactions_count' => $yrTxs->count(),
            ];
        }

        // Compute Monthly Cashflow for every month in memory
        $monthlyCashflow = [];
        $targetYears = ($selectedYear !== 'all' && in_array((int) $selectedYear, $availableYears)) ? [(int) $selectedYear] : $availableYears;

        foreach ($targetYears as $yr) {
            for ($m = 12; $m >= 1; $m--) {
                $mTxs = $allCompletedTxs->filter(function ($tx) use ($yr, $m) {
                    if (! $tx->transaction_date) {
                        return false;
                    }
                    $d = Carbon::parse($tx->transaction_date);

                    return $d->year === (int) $yr && $d->month === (int) $m;
                });

                if ($mTxs->isEmpty() && $selectedYear === 'all') {
                    continue; // Skip empty months if viewing all years combined
                }

                $mInflow = (float) $mTxs->where('type', 'income')->sum('amount');
                $mOutflow = (float) $mTxs->where('type', 'expense')->sum('amount');
                $mCogs = (float) $mTxs->where('type', 'expense')->whereIn('category', ['carrier_sms_cogs', 'whatsapp_api_cogs', 'payment_gateway_fee'])->sum('amount');
                $mNet = (float) ($mInflow - $mOutflow);
                $mMargin = $mInflow > 0 ? round(($mNet / $mInflow) * 100, 1) : 0;
                $dateObj = Carbon::createFromDate($yr, $m, 1);

                $monthlyCashflow[] = [
                    'year' => $yr,
                    'month' => $m,
                    'month_name' => $dateObj->format('M Y'),
                    'month_short' => $dateObj->format('M'),
                    'inflow' => $mInflow,
                    'outflow' => $mOutflow,
                    'direct_cogs' => $mCogs,
                    'gross_profit' => (float) ($mInflow - $mCogs),
                    'net_cashflow' => $mNet,
                    'net_margin_pct' => $mMargin,
                    'transactions_count' => $mTxs->count(),
                ];
            }
        }

        if ($typeFilter !== 'all') {
            $query->where('type', $typeFilter);
        }

        if ($categoryFilter !== 'all') {
            $query->where('category', $categoryFilter);
        }

        if (! empty($search)) {
            $s = strtolower($search);
            $query->where(function ($q) use ($s) {
                $q->where('transaction_number', 'like', "%{$s}%")
                    ->orWhere('title', 'like', "%{$s}%")
                    ->orWhere('reference', 'like', "%{$s}%")
                    ->orWhere('payment_method', 'like', "%{$s}%")
                    ->orWhereHas('user', function ($uq) use ($s) {
                        $uq->where('name', 'like', "%{$s}%")
                            ->orWhere('email', 'like', "%{$s}%")
                            ->orWhere('company', 'like', "%{$s}%");
                    });
            });
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        // ─── Billed Expenses & Accounts Payable (AP) ───
        $allBills = FinancialBill::with('transaction')
            ->orderByRaw("CASE WHEN status = 'overdue' THEN 1 WHEN status = 'pending' THEN 2 ELSE 3 END")
            ->orderBy('due_date', 'asc')
            ->get();

        $today = Carbon::today();
        foreach ($allBills as $b) {
            if ($b->status === 'pending' && Carbon::parse($b->due_date)->isPast() && ! Carbon::parse($b->due_date)->isToday()) {
                $b->status = 'overdue';
                $b->saveQuietly();
            }
        }

        $pendingOrOverdueBills = $allBills->whereIn('status', ['pending', 'overdue']);
        $totalPendingPayables = (float) $pendingOrOverdueBills->sum('amount');
        $overdueBills = $allBills->where('status', 'overdue');
        $overdueCount = $overdueBills->count();
        $overdueAmount = (float) $overdueBills->sum('amount');

        $dueThisWeekBills = $allBills->filter(function ($b) use ($today) {
            if ($b->status !== 'pending') {
                return false;
            }
            $d = Carbon::parse($b->due_date);

            return $d->gte($today) && $d->lte($today->copy()->addDays(7));
        });
        $dueThisWeekCount = $dueThisWeekBills->count();
        $dueThisWeekAmount = (float) $dueThisWeekBills->sum('amount');

        $reminders = [
            'overdue_count' => $overdueCount,
            'overdue_amount' => $overdueAmount,
            'due_this_week_count' => $dueThisWeekCount,
            'due_this_week_amount' => $dueThisWeekAmount,
            'total_pending_payables' => $totalPendingPayables,
            'critical_alerts' => $overdueBills->concat($dueThisWeekBills)->map(function ($b) use ($today) {
                $dueDate = Carbon::parse($b->due_date);
                $isOverdue = $dueDate->isPast() && ! $dueDate->isToday();
                $diff = (int) $today->diffInDays($dueDate, false);

                return [
                    'id' => $b->id,
                    'bill_number' => $b->bill_number,
                    'vendor_name' => $b->vendor_name,
                    'title' => $b->title,
                    'amount' => (float) $b->amount,
                    'category' => $b->category,
                    'due_date' => $b->due_date ? Carbon::parse($b->due_date)->format('Y-m-d') : null,
                    'is_overdue' => $isOverdue,
                    'days_remaining' => $diff,
                    'reminder_enabled' => (bool) $b->reminder_enabled,
                    'reminded_at' => $b->reminded_at?->format('Y-m-d H:i'),
                ];
            })->values()->toArray(),
        ];

        $organizers = User::where('role', 'customer')->select('id', 'name', 'email', 'company')->get();
        $events = Event::select('id', 'title', 'user_id')->get();
        $fxData = ExchangeRateService::getRateData();

        return Inertia::render('Admin/Finance', [
            'metrics' => [
                'gross_revenue' => $grossRevenue,
                'total_expenses' => $totalExpenses,
                'direct_cogs' => $directCogs,
                'gross_profit' => $grossProfit,
                'gross_margin_pct' => $grossMarginPct,
                'net_profit' => $netProfit,
                'net_margin_pct' => $netMarginPct,
                'pending_income' => $pendingIncome,
                'pending_expenses' => $pendingExpenses,
                'total_transactions_count' => $allPeriodTransactions->count(),
                'total_pending_payables' => $totalPendingPayables,
                'overdue_bills_count' => $overdueCount,
                'due_this_week_count' => $dueThisWeekCount,
            ],
            'fx_rate' => $fxData,
            'income_by_category' => $incomeByCategory,
            'expense_by_category' => $expenseByCategory,
            'monthly_trend' => $monthlyTrend,
            'yearly_cashflow' => $yearlyCashflow,
            'monthly_cashflow' => $monthlyCashflow,
            'available_years' => $availableYears,
            'transactions' => $transactions,
            'bills' => $allBills,
            'reminders' => $reminders,
            'organizers' => $organizers,
            'events' => $events,
            'filters' => [
                'period' => $period,
                'from' => $request->input('from', ''),
                'to' => $request->input('to', ''),
                'period_label' => $this->getPeriodLabel($request),
                'year' => $selectedYear,
                'type' => $typeFilter,
                'category' => $categoryFilter,
                'search' => $search,
            ],
        ]);
    }

    public function refreshExchangeRate(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $rateData = ExchangeRateService::resetToLive();

        return back()->with('success', 'USD/TZS exchange rate successfully synced to '.number_format($rateData['rate'], 2).' TZS ('.$rateData['source'].').');
    }

    public function updateExchangeRate(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'rate' => 'required|numeric|min:100|max:100000',
        ]);

        $rateData = ExchangeRateService::setManualRate((float) $validated['rate']);

        return back()->with('success', 'USD/TZS exchange rate manually updated to '.number_format($rateData['rate'], 2).' TZS.');
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1',
            'currency' => 'nullable|string|max:10',
            'payment_method' => 'required|string|max:50',
            'reference' => 'nullable|string|max:100',
            'user_id' => 'nullable|exists:users,id',
            'event_id' => 'nullable|exists:events,id',
            'status' => 'required|in:completed,pending,refunded,failed',
            'notes' => 'nullable|string|max:1000',
            'transaction_date' => 'required|date',
        ]);

        $validated['transaction_number'] = FinancialTransaction::generateTransactionNumber();
        $validated['currency'] = $validated['currency'] ?? 'TZS';

        FinancialTransaction::create($validated);

        return back()->with('success', 'Financial record ('.$validated['transaction_number'].') successfully saved to ledger.');
    }

    public function destroy(Request $request, FinancialTransaction $transaction)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $num = $transaction->transaction_number;
        $transaction->delete();

        return back()->with('success', "Transaction {$num} permanently removed from financial ledger.");
    }

    public function storeBill(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'vendor_name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:50',
            'amount' => 'required|numeric|min:1',
            'currency' => 'nullable|string|max:10',
            'bill_date' => 'required|date',
            'due_date' => 'required|date',
            'is_recurring' => 'boolean',
            'recurrence_period' => 'nullable|in:monthly,quarterly,yearly',
            'payment_method_intended' => 'nullable|string|max:50',
            'vendor_account_reference' => 'nullable|string|max:100',
            'reminder_enabled' => 'boolean',
            'reminder_days_before' => 'integer|min:0|max:60',
            'notes' => 'nullable|string|max:1000',
        ]);

        $validated['bill_number'] = FinancialBill::generateBillNumber();
        $validated['currency'] = $validated['currency'] ?? 'TZS';
        $validated['status'] = Carbon::parse($validated['due_date'])->isPast() && ! Carbon::parse($validated['due_date'])->isToday() ? 'overdue' : 'pending';

        $bill = FinancialBill::create($validated);

        return back()->with('success', "Billed expense {$bill->bill_number} for {$bill->vendor_name} created.");
    }

    public function updateBill(Request $request, FinancialBill $bill)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'vendor_name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:50',
            'amount' => 'required|numeric|min:1',
            'currency' => 'nullable|string|max:10',
            'bill_date' => 'required|date',
            'due_date' => 'required|date',
            'is_recurring' => 'boolean',
            'recurrence_period' => 'nullable|in:monthly,quarterly,yearly',
            'payment_method_intended' => 'nullable|string|max:50',
            'vendor_account_reference' => 'nullable|string|max:100',
            'reminder_enabled' => 'boolean',
            'reminder_days_before' => 'integer|min:0|max:60',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($bill->status !== 'paid') {
            $validated['status'] = Carbon::parse($validated['due_date'])->isPast() && ! Carbon::parse($validated['due_date'])->isToday() ? 'overdue' : 'pending';
        }

        $bill->update($validated);

        return back()->with('success', "Billed expense {$bill->bill_number} updated.");
    }

    public function payBill(Request $request, FinancialBill $bill)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'payment_method' => 'required|string|max:50',
            'reference' => 'nullable|string|max:100',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $paymentDate = ! empty($validated['payment_date']) ? Carbon::parse($validated['payment_date']) : now();
        $paymentMethod = $validated['payment_method'];
        $ref = $validated['reference'] ?? $bill->bill_number;

        // 1. Create matching completed expense in FinancialTransaction ledger
        $transaction = FinancialTransaction::create([
            'transaction_number' => FinancialTransaction::generateTransactionNumber(),
            'type' => 'expense',
            'category' => $bill->category,
            'title' => "Bill Settlement: {$bill->vendor_name} ({$bill->title})",
            'amount' => $bill->amount,
            'currency' => $bill->currency,
            'payment_method' => $paymentMethod,
            'reference' => $ref,
            'status' => 'completed',
            'transaction_date' => $paymentDate,
            'notes' => "Settlement for {$bill->bill_number}. ".($validated['notes'] ?? ''),
        ]);

        // 2. Mark current bill as paid
        $bill->update([
            'status' => 'paid',
            'financial_transaction_id' => $transaction->id,
        ]);

        // 3. If recurring, automatically spawn the next cycle's pending bill!
        $nextBillMsg = '';
        if ($bill->is_recurring && $bill->recurrence_period) {
            $nextBillDate = Carbon::parse($bill->bill_date);
            $nextDueDate = Carbon::parse($bill->due_date);

            if ($bill->recurrence_period === 'monthly') {
                $nextBillDate = $nextBillDate->addMonth();
                $nextDueDate = $nextDueDate->addMonth();
            } elseif ($bill->recurrence_period === 'quarterly') {
                $nextBillDate = $nextBillDate->addMonths(3);
                $nextDueDate = $nextDueDate->addMonths(3);
            } elseif ($bill->recurrence_period === 'yearly') {
                $nextBillDate = $nextBillDate->addYear();
                $nextDueDate = $nextDueDate->addYear();
            }

            $nextBill = FinancialBill::create([
                'bill_number' => FinancialBill::generateBillNumber(),
                'vendor_name' => $bill->vendor_name,
                'title' => $bill->title,
                'category' => $bill->category,
                'amount' => $bill->amount,
                'currency' => $bill->currency,
                'bill_date' => $nextBillDate,
                'due_date' => $nextDueDate,
                'status' => 'pending',
                'is_recurring' => true,
                'recurrence_period' => $bill->recurrence_period,
                'payment_method_intended' => $bill->payment_method_intended,
                'vendor_account_reference' => $bill->vendor_account_reference,
                'reminder_enabled' => $bill->reminder_enabled,
                'reminder_days_before' => $bill->reminder_days_before,
                'notes' => $bill->notes,
            ]);

            $nextBillMsg = " Next recurring cycle ({$nextBill->bill_number}) scheduled for {$nextDueDate->format('M d, Y')}.";
        }

        return back()->with('success', "Bill {$bill->bill_number} marked as paid and logged to financial ledger ({$transaction->transaction_number}).{$nextBillMsg}");
    }

    public function destroyBill(Request $request, FinancialBill $bill)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $num = $bill->bill_number;
        $bill->delete();

        return back()->with('success', "Billed expense {$num} deleted.");
    }

    public function remindBill(Request $request, FinancialBill $bill)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        try {
            $user->notify(new BillReminderNotification($bill));
            $bill->update(['reminded_at' => now()]);

            return back()->with('success', "Due-date reminder alert dispatched to {$user->email} for {$bill->bill_number}.");
        } catch (\Throwable $e) {
            return back()->with('error', "Could not send email reminder: {$e->getMessage()}");
        }
    }

    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $period = $request->input('period', 'all');
        $exportFormat = $request->input('format', 'ledger'); // 'ledger' | 'cashflow'
        $typeFilter = $request->input('type', 'all');
        $categoryFilter = $request->input('category', 'all');
        $search = $request->input('search', '');

        if ($exportFormat === 'cashflow') {
            // Export Monthly Cashflow Statement CSV
            $allCompletedTxs = FinancialTransaction::where('status', 'completed')
                ->get(['amount', 'type', 'category', 'transaction_date']);

            $availableYears = $allCompletedTxs->toBase()->map(fn ($d) => $d->transaction_date ? Carbon::parse($d->transaction_date)->year : (int) now()->year)->push((int) now()->year)->unique()->sortDesc()->values()->toArray();

            $cashflowRows = [];
            foreach ($availableYears as $yr) {
                for ($m = 12; $m >= 1; $m--) {
                    $mTxs = $allCompletedTxs->filter(function ($tx) use ($yr, $m) {
                        if (! $tx->transaction_date) {
                            return false;
                        }
                        $d = Carbon::parse($tx->transaction_date);

                        return $d->year === (int) $yr && $d->month === (int) $m;
                    });

                    if ($mTxs->isEmpty()) {
                        continue;
                    }

                    $inflow = (float) $mTxs->where('type', 'income')->sum('amount');
                    $outflow = (float) $mTxs->where('type', 'expense')->sum('amount');
                    $cogs = (float) $mTxs->where('type', 'expense')->whereIn('category', ['carrier_sms_cogs', 'whatsapp_api_cogs', 'payment_gateway_fee'])->sum('amount');
                    $net = (float) ($inflow - $outflow);
                    $margin = $inflow > 0 ? round(($net / $inflow) * 100, 1) : 0;

                    $cashflowRows[] = [
                        'period' => Carbon::createFromDate($yr, $m, 1)->format('F Y'),
                        'year' => $yr,
                        'month' => $m,
                        'inflow' => $inflow,
                        'outflow' => $outflow,
                        'cogs' => $cogs,
                        'net_cashflow' => $net,
                        'net_margin_pct' => $margin.'%',
                        'transactions' => $mTxs->count(),
                    ];
                }
            }

            $filename = 'Kardovo_Cashflow_Statement_'.date('Y-m-d').'.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            return response()->stream(function () use ($cashflowRows) {
                $handle = fopen('php://output', 'w');
                fputcsv($handle, [
                    'Month / Year',
                    'Year',
                    'Month',
                    'Inflow (Gross Revenue TZS)',
                    'Outflow (Operating Expenses TZS)',
                    'Direct COGS (TZS)',
                    'Net Cashflow (TZS)',
                    'Net Margin (%)',
                    'Transactions Count',
                ]);

                foreach ($cashflowRows as $row) {
                    fputcsv($handle, [
                        $row['period'],
                        $row['year'],
                        $row['month'],
                        number_format($row['inflow'], 2, '.', ''),
                        number_format($row['outflow'], 2, '.', ''),
                        number_format($row['cogs'], 2, '.', ''),
                        number_format($row['net_cashflow'], 2, '.', ''),
                        $row['net_margin_pct'],
                        $row['transactions'],
                    ]);
                }
                fclose($handle);
            }, 200, $headers);
        }

        // Standard Ledger CSV
        $query = FinancialTransaction::with(['user:id,name,email,company', 'event:id,title']);

        $this->applyPeriodFilter($query, $request);

        if ($typeFilter !== 'all') {
            $query->where('type', $typeFilter);
        }

        if ($categoryFilter !== 'all') {
            $query->where('category', $categoryFilter);
        }

        if (! empty($search)) {
            $s = strtolower($search);
            $query->where(function ($q) use ($s) {
                $q->where('transaction_number', 'like', "%{$s}%")
                    ->orWhere('title', 'like', "%{$s}%")
                    ->orWhere('reference', 'like', "%{$s}%")
                    ->orWhere('payment_method', 'like', "%{$s}%")
                    ->orWhereHas('user', function ($uq) use ($s) {
                        $uq->where('name', 'like', "%{$s}%")
                            ->orWhere('email', 'like', "%{$s}%")
                            ->orWhere('company', 'like', "%{$s}%");
                    });
            });
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        $typeSuffix = $typeFilter !== 'all' ? "_{$typeFilter}" : '';
        $filename = "Kardovo_Financial_Ledger{$typeSuffix}_".date('Y-m-d').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Transaction ID',
                'Type',
                'Category',
                'Title',
                'Amount (TZS)',
                'Payment Method',
                'Reference Code',
                'Customer / Organizer',
                'Event Title',
                'Status',
                'Date',
                'Notes',
            ]);

            foreach ($transactions as $t) {
                fputcsv($handle, [
                    $t->transaction_number,
                    strtoupper($t->type),
                    $t->category,
                    $t->title,
                    number_format($t->amount, 2, '.', ''),
                    $t->payment_method,
                    $t->reference ?? 'N/A',
                    $t->user?->name ?? 'System / Direct',
                    $t->event?->title ?? 'N/A',
                    strtoupper($t->status),
                    $t->transaction_date?->format('Y-m-d H:i:s'),
                    $t->notes ?? '',
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403);
        }

        $period = $request->input('period', 'all');
        $query = FinancialTransaction::with(['user:id,name,email,company', 'event:id,title']);

        $this->applyPeriodFilter($query, $request);

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        $grossRevenue = (float) $transactions->where('type', 'income')->where('status', 'completed')->sum('amount');
        $totalExpenses = (float) $transactions->where('type', 'expense')->where('status', 'completed')->sum('amount');
        $directCogs = (float) $transactions->where('type', 'expense')->whereIn('category', ['carrier_sms_cogs', 'whatsapp_api_cogs', 'payment_gateway_fee'])->where('status', 'completed')->sum('amount');
        $grossProfit = (float) ($grossRevenue - $directCogs);
        $grossMarginPct = $grossRevenue > 0 ? round(($grossProfit / $grossRevenue) * 100, 1) : 0;
        $netProfit = (float) ($grossRevenue - $totalExpenses);
        $netMarginPct = $grossRevenue > 0 ? round(($netProfit / $grossRevenue) * 100, 1) : 0;

        $incomeByCategory = [
            'package_purchase' => (float) $transactions->where('type', 'income')->where('category', 'package_purchase')->where('status', 'completed')->sum('amount'),
            'pass_sales' => (float) $transactions->where('type', 'income')->where('category', 'pass_sales')->where('status', 'completed')->sum('amount'),
            'sms_credits' => (float) $transactions->where('type', 'income')->where('category', 'sms_credits')->where('status', 'completed')->sum('amount'),
            'design_service' => (float) $transactions->where('type', 'income')->where('category', 'design_service')->where('status', 'completed')->sum('amount'),
            'subscription' => (float) $transactions->where('type', 'income')->where('category', 'subscription')->where('status', 'completed')->sum('amount'),
            'other_income' => (float) $transactions->where('type', 'income')->whereNotIn('category', ['package_purchase', 'pass_sales', 'sms_credits', 'design_service', 'subscription'])->where('status', 'completed')->sum('amount'),
        ];

        $expenseByCategory = [
            'carrier_sms' => (float) $transactions->where('type', 'expense')->where('category', 'carrier_sms_cogs')->where('status', 'completed')->sum('amount'),
            'whatsapp_api' => (float) $transactions->where('type', 'expense')->where('category', 'whatsapp_api_cogs')->where('status', 'completed')->sum('amount'),
            'server_infrastructure' => (float) $transactions->where('type', 'expense')->where('category', 'server_infrastructure')->where('status', 'completed')->sum('amount'),
            'payment_fees' => (float) $transactions->where('type', 'expense')->where('category', 'payment_gateway_fee')->where('status', 'completed')->sum('amount'),
            'operations' => (float) $transactions->where('type', 'expense')->whereIn('category', ['operations', 'marketing', 'other'])->where('status', 'completed')->sum('amount'),
        ];

        // Monthly cashflow for PDF
        $allCompletedTxs = FinancialTransaction::where('status', 'completed')
            ->get(['amount', 'type', 'category', 'transaction_date']);

        $availableYears = $allCompletedTxs->toBase()->map(fn ($d) => $d->transaction_date ? Carbon::parse($d->transaction_date)->year : (int) now()->year)->push((int) now()->year)->unique()->sortDesc()->values()->toArray();

        $monthlyCashflow = [];
        $yearlyCashflow = [];

        foreach ($availableYears as $yr) {
            $yrTxs = $allCompletedTxs->filter(function ($tx) use ($yr) {
                return $tx->transaction_date && Carbon::parse($tx->transaction_date)->year === (int) $yr;
            });
            $yrInflow = (float) $yrTxs->where('type', 'income')->sum('amount');
            $yrOutflow = (float) $yrTxs->where('type', 'expense')->sum('amount');
            $yrCogs = (float) $yrTxs->where('type', 'expense')->whereIn('category', ['carrier_sms_cogs', 'whatsapp_api_cogs', 'payment_gateway_fee'])->sum('amount');
            $yrNet = (float) ($yrInflow - $yrOutflow);
            $yrMargin = $yrInflow > 0 ? round(($yrNet / $yrInflow) * 100, 1) : 0;

            $yearlyCashflow[] = [
                'year' => (int) $yr,
                'gross_revenue' => $yrInflow,
                'total_expenses' => $yrOutflow,
                'direct_cogs' => $yrCogs,
                'gross_profit' => (float) ($yrInflow - $yrCogs),
                'gross_margin_pct' => $yrInflow > 0 ? round((($yrInflow - $yrCogs) / $yrInflow) * 100, 1) : 0,
                'net_profit' => $yrNet,
                'net_margin_pct' => $yrMargin,
                'transactions_count' => $yrTxs->count(),
            ];

            for ($m = 12; $m >= 1; $m--) {
                $mTxs = $allCompletedTxs->filter(function ($tx) use ($yr, $m) {
                    if (! $tx->transaction_date) {
                        return false;
                    }
                    $d = Carbon::parse($tx->transaction_date);

                    return $d->year === (int) $yr && $d->month === (int) $m;
                });

                if ($mTxs->isEmpty()) {
                    continue;
                }

                $mInflow = (float) $mTxs->where('type', 'income')->sum('amount');
                $mOutflow = (float) $mTxs->where('type', 'expense')->sum('amount');
                $mCogs = (float) $mTxs->where('type', 'expense')->whereIn('category', ['carrier_sms_cogs', 'whatsapp_api_cogs', 'payment_gateway_fee'])->sum('amount');
                $mNet = (float) ($mInflow - $mOutflow);
                $mMargin = $mInflow > 0 ? round(($mNet / $mInflow) * 100, 1) : 0;

                $monthlyCashflow[] = [
                    'year' => $yr,
                    'month' => $m,
                    'month_name' => Carbon::createFromDate($yr, $m, 1)->format('M Y'),
                    'inflow' => $mInflow,
                    'outflow' => $mOutflow,
                    'direct_cogs' => $mCogs,
                    'net_cashflow' => $mNet,
                    'net_margin_pct' => $mMargin,
                ];
            }
        }

        $fxData = ExchangeRateService::getRateData();

        $pdf = Pdf::loadView('pdf.financial_report', [
            'period' => $period,
            'period_label' => $this->getPeriodLabel($request),
            'metrics' => [
                'gross_revenue' => $grossRevenue,
                'total_expenses' => $totalExpenses,
                'direct_cogs' => $directCogs,
                'gross_profit' => $grossProfit,
                'gross_margin_pct' => $grossMarginPct,
                'net_profit' => $netProfit,
                'net_margin_pct' => $netMarginPct,
            ],
            'fx_rate' => $fxData,
            'income_by_category' => $incomeByCategory,
            'expense_by_category' => $expenseByCategory,
            'monthly_cashflow' => $monthlyCashflow,
            'yearly_cashflow' => $yearlyCashflow,
            'transactions' => $transactions,
            'generated_by' => $user->name,
        ])->setPaper('a4', 'portrait');

        $filename = "Kardovo_Financial_Statement_{$period}_".date('Y-m-d').'.pdf';

        return $pdf->download($filename);
    }

    protected function applyPeriodFilter($query, Request $request): void
    {
        $period = $request->input('period', 'all');
        $from = $request->input('from') ?: $request->input('start_date');
        $to = $request->input('to') ?: $request->input('end_date');

        if ($period === '7days' || $period === 'weekly') {
            $query->where('transaction_date', '>=', now()->subDays(7)->startOfDay());
        } elseif ($period === '30days' || $period === 'monthly') {
            $query->where('transaction_date', '>=', now()->subDays(30)->startOfDay());
        } elseif ($period === '90days' || $period === 'quarterly') {
            $query->where('transaction_date', '>=', now()->subDays(90)->startOfDay());
        } elseif ($period === 'half_year' || $period === 'semi_annual' || $period === '180days') {
            $query->where('transaction_date', '>=', now()->subDays(180)->startOfDay());
        } elseif ($period === 'this_year' || $period === 'annual') {
            $query->whereYear('transaction_date', now()->year);
        } elseif ($period === 'custom') {
            if ($from) {
                $query->where('transaction_date', '>=', Carbon::parse($from)->startOfDay());
            }
            if ($to) {
                $query->where('transaction_date', '<=', Carbon::parse($to)->endOfDay());
            }
        }
    }

    protected function getPeriodLabel(Request $request): string
    {
        $period = $request->input('period', 'all');
        $from = $request->input('from') ?: $request->input('start_date');
        $to = $request->input('to') ?: $request->input('end_date');

        return match ($period) {
            '7days', 'weekly' => 'Weekly (Past 7 Days)',
            '30days', 'monthly' => 'Monthly (Past 30 Days)',
            '90days', 'quarterly' => 'Quarterly (Past 90 Days)',
            'half_year', 'semi_annual', '180days' => 'Semi-Annual (Past 6 Months)',
            'this_year', 'annual' => 'Annual (Year '.now()->year.')',
            'custom' => 'Custom Period ('.($from ? Carbon::parse($from)->format('M d, Y') : 'Start').' to '.($to ? Carbon::parse($to)->format('M d, Y') : 'End').')',
            default => 'All Time',
        };
    }
}
