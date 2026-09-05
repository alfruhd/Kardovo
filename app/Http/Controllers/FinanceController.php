<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FinancialTransaction;
use App\Models\User;
use App\Models\Event;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            abort(403, 'Financial administration access required.');
        }

        $period = $request->input('period', 'all');
        $typeFilter = $request->input('type', 'all');
        $categoryFilter = $request->input('category', 'all');
        $search = $request->input('search', '');
        $selectedYear = $request->input('year', 'all');

        $query = FinancialTransaction::with(['user:id,name,email,company', 'event:id,title,venue,event_date']);

        if ($period === '30days') {
            $query->where('transaction_date', '>=', now()->subDays(30)->startOfDay());
        } elseif ($period === '90days') {
            $query->where('transaction_date', '>=', now()->subDays(90)->startOfDay());
        } elseif ($period === 'this_year') {
            $query->whereYear('transaction_date', now()->year);
        }

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
            'pass_sales' => (float) $allPeriodTransactions->where('type', 'income')->where('category', 'pass_sales')->where('status', 'completed')->sum('amount'),
            'sms_credits' => (float) $allPeriodTransactions->where('type', 'income')->where('category', 'sms_credits')->where('status', 'completed')->sum('amount'),
            'design_service' => (float) $allPeriodTransactions->where('type', 'income')->where('category', 'design_service')->where('status', 'completed')->sum('amount'),
            'subscription' => (float) $allPeriodTransactions->where('type', 'income')->where('category', 'subscription')->where('status', 'completed')->sum('amount'),
            'other_income' => (float) $allPeriodTransactions->where('type', 'income')->whereNotIn('category', ['pass_sales', 'sms_credits', 'design_service', 'subscription'])->where('status', 'completed')->sum('amount'),
        ];

        $expenseByCategory = [
            'carrier_sms' => (float) $allPeriodTransactions->where('type', 'expense')->where('category', 'carrier_sms_cogs')->where('status', 'completed')->sum('amount'),
            'whatsapp_api' => (float) $allPeriodTransactions->where('type', 'expense')->where('category', 'whatsapp_api_cogs')->where('status', 'completed')->sum('amount'),
            'server_infrastructure' => (float) $allPeriodTransactions->where('type', 'expense')->where('category', 'server_infrastructure')->where('status', 'completed')->sum('amount'),
            'payment_fees' => (float) $allPeriodTransactions->where('type', 'expense')->where('category', 'payment_gateway_fee')->where('status', 'completed')->sum('amount'),
            'operations' => (float) $allPeriodTransactions->where('type', 'expense')->whereIn('category', ['operations', 'marketing', 'other'])->where('status', 'completed')->sum('amount'),
        ];

        // 6-Month rolling trend
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthDate = now()->subMonths($i);
            $year = $monthDate->year;
            $month = $monthDate->month;
            $monthName = $monthDate->format('M Y');

            $mIncome = FinancialTransaction::where('type', 'income')
                ->where('status', 'completed')
                ->whereYear('transaction_date', $year)
                ->whereMonth('transaction_date', $month)
                ->sum('amount');

            $mExpense = FinancialTransaction::where('type', 'expense')
                ->where('status', 'completed')
                ->whereYear('transaction_date', $year)
                ->whereMonth('transaction_date', $month)
                ->sum('amount');

            $monthlyTrend[] = [
                'month' => $monthName,
                'income' => (float) $mIncome,
                'expense' => (float) $mExpense,
                'net' => (float) ($mIncome - $mExpense),
            ];
        }

        // Extract available years from database
        $allTxDates = FinancialTransaction::pluck('transaction_date');
        $availableYears = $allTxDates->map(function ($d) {
            return $d ? Carbon::parse($d)->year : now()->year;
        })->push((int) now()->year)->unique()->sortDesc()->values()->toArray();

        // Compute Yearly Cashflow Summary for all years
        $yearlyCashflow = [];
        foreach ($availableYears as $yr) {
            $yrTxs = FinancialTransaction::whereYear('transaction_date', $yr)
                ->where('status', 'completed')
                ->get();

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

        // Compute Monthly Cashflow for every month
        $monthlyCashflow = [];
        $targetYears = ($selectedYear !== 'all' && in_array((int)$selectedYear, $availableYears)) ? [(int)$selectedYear] : $availableYears;

        foreach ($targetYears as $yr) {
            for ($m = 12; $m >= 1; $m--) {
                $mTxs = FinancialTransaction::whereYear('transaction_date', $yr)
                    ->whereMonth('transaction_date', $m)
                    ->where('status', 'completed')
                    ->get();

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

        if (!empty($search)) {
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

        $organizers = User::where('role', 'customer')->select('id', 'name', 'email', 'company')->get();
        $events = Event::select('id', 'title', 'user_id')->get();
        $fxData = \App\Services\ExchangeRateService::getRateData();

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
            ],
            'fx_rate' => $fxData,
            'income_by_category' => $incomeByCategory,
            'expense_by_category' => $expenseByCategory,
            'monthly_trend' => $monthlyTrend,
            'yearly_cashflow' => $yearlyCashflow,
            'monthly_cashflow' => $monthlyCashflow,
            'available_years' => $availableYears,
            'transactions' => $transactions,
            'organizers' => $organizers,
            'events' => $events,
            'filters' => [
                'period' => $period,
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
        if (!$user->isAdmin()) {
            abort(403);
        }

        $rateData = \App\Services\ExchangeRateService::resetToLive();

        return back()->with('success', "USD/TZS exchange rate successfully synced to " . number_format($rateData['rate'], 2) . " TZS (" . $rateData['source'] . ").");
    }

    public function updateExchangeRate(Request $request)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'rate' => 'required|numeric|min:100|max:100000',
        ]);

        $rateData = \App\Services\ExchangeRateService::setManualRate((float) $validated['rate']);

        return back()->with('success', "USD/TZS exchange rate manually updated to " . number_format($rateData['rate'], 2) . " TZS.");
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
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

        return back()->with('success', 'Financial record (' . $validated['transaction_number'] . ') successfully saved to ledger.');
    }

    public function destroy(Request $request, FinancialTransaction $transaction)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $num = $transaction->transaction_number;
        $transaction->delete();

        return back()->with('success', "Transaction {$num} permanently removed from financial ledger.");
    }

    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $period = $request->input('period', 'all');
        $exportFormat = $request->input('format', 'ledger'); // 'ledger' | 'cashflow'
        $typeFilter = $request->input('type', 'all');
        $categoryFilter = $request->input('category', 'all');
        $search = $request->input('search', '');

        if ($exportFormat === 'cashflow') {
            // Export Monthly Cashflow Statement CSV
            $allTxDates = FinancialTransaction::pluck('transaction_date');
            $availableYears = $allTxDates->map(fn($d) => $d ? Carbon::parse($d)->year : now()->year)->push((int) now()->year)->unique()->sortDesc()->values()->toArray();

            $cashflowRows = [];
            foreach ($availableYears as $yr) {
                for ($m = 12; $m >= 1; $m--) {
                    $mTxs = FinancialTransaction::whereYear('transaction_date', $yr)
                        ->whereMonth('transaction_date', $m)
                        ->where('status', 'completed')
                        ->get();

                    if ($mTxs->isEmpty()) continue;

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
                        'net_margin_pct' => $margin . '%',
                        'transactions' => $mTxs->count(),
                    ];
                }
            }

            $filename = "Kardovo_Cashflow_Statement_" . date('Y-m-d') . ".csv";
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
                    'Transactions Count'
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

        if ($period === '30days') {
            $query->where('transaction_date', '>=', now()->subDays(30)->startOfDay());
        } elseif ($period === '90days') {
            $query->where('transaction_date', '>=', now()->subDays(90)->startOfDay());
        } elseif ($period === 'this_year') {
            $query->whereYear('transaction_date', now()->year);
        }

        if ($typeFilter !== 'all') {
            $query->where('type', $typeFilter);
        }

        if ($categoryFilter !== 'all') {
            $query->where('category', $categoryFilter);
        }

        if (!empty($search)) {
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
        $filename = "Kardovo_Financial_Ledger{$typeSuffix}_" . date('Y-m-d') . ".csv";

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
        if (!$user->isAdmin()) {
            abort(403);
        }

        $period = $request->input('period', 'all');
        $query = FinancialTransaction::with(['user:id,name,email,company', 'event:id,title']);

        if ($period === '30days') {
            $query->where('transaction_date', '>=', now()->subDays(30)->startOfDay());
        } elseif ($period === '90days') {
            $query->where('transaction_date', '>=', now()->subDays(90)->startOfDay());
        } elseif ($period === 'this_year') {
            $query->whereYear('transaction_date', now()->year);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        $grossRevenue = (float) $transactions->where('type', 'income')->where('status', 'completed')->sum('amount');
        $totalExpenses = (float) $transactions->where('type', 'expense')->where('status', 'completed')->sum('amount');
        $directCogs = (float) $transactions->where('type', 'expense')->whereIn('category', ['carrier_sms_cogs', 'whatsapp_api_cogs', 'payment_gateway_fee'])->where('status', 'completed')->sum('amount');
        $grossProfit = (float) ($grossRevenue - $directCogs);
        $grossMarginPct = $grossRevenue > 0 ? round(($grossProfit / $grossRevenue) * 100, 1) : 0;
        $netProfit = (float) ($grossRevenue - $totalExpenses);
        $netMarginPct = $grossRevenue > 0 ? round(($netProfit / $grossRevenue) * 100, 1) : 0;

        $incomeByCategory = [
            'pass_sales' => (float) $transactions->where('type', 'income')->where('category', 'pass_sales')->where('status', 'completed')->sum('amount'),
            'sms_credits' => (float) $transactions->where('type', 'income')->where('category', 'sms_credits')->where('status', 'completed')->sum('amount'),
            'design_service' => (float) $transactions->where('type', 'income')->where('category', 'design_service')->where('status', 'completed')->sum('amount'),
            'subscription' => (float) $transactions->where('type', 'income')->where('category', 'subscription')->where('status', 'completed')->sum('amount'),
            'other_income' => (float) $transactions->where('type', 'income')->whereNotIn('category', ['pass_sales', 'sms_credits', 'design_service', 'subscription'])->where('status', 'completed')->sum('amount'),
        ];

        $expenseByCategory = [
            'carrier_sms' => (float) $transactions->where('type', 'expense')->where('category', 'carrier_sms_cogs')->where('status', 'completed')->sum('amount'),
            'whatsapp_api' => (float) $transactions->where('type', 'expense')->where('category', 'whatsapp_api_cogs')->where('status', 'completed')->sum('amount'),
            'server_infrastructure' => (float) $transactions->where('type', 'expense')->where('category', 'server_infrastructure')->where('status', 'completed')->sum('amount'),
            'payment_fees' => (float) $transactions->where('type', 'expense')->where('category', 'payment_gateway_fee')->where('status', 'completed')->sum('amount'),
            'operations' => (float) $transactions->where('type', 'expense')->whereIn('category', ['operations', 'marketing', 'other'])->where('status', 'completed')->sum('amount'),
        ];

        // Monthly cashflow for PDF
        $allTxDates = FinancialTransaction::pluck('transaction_date');
        $availableYears = $allTxDates->map(fn($d) => $d ? Carbon::parse($d)->year : now()->year)->push((int) now()->year)->unique()->sortDesc()->values()->toArray();

        $monthlyCashflow = [];
        $yearlyCashflow = [];

        foreach ($availableYears as $yr) {
            $yrTxs = FinancialTransaction::whereYear('transaction_date', $yr)->where('status', 'completed')->get();
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
                $mTxs = FinancialTransaction::whereYear('transaction_date', $yr)
                    ->whereMonth('transaction_date', $m)
                    ->where('status', 'completed')
                    ->get();

                if ($mTxs->isEmpty()) continue;

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

        $fxData = \App\Services\ExchangeRateService::getRateData();

        $pdf = Pdf::loadView('pdf.financial_report', [
            'period' => $period,
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

        $filename = "Kardovo_Financial_Statement_{$period}_" . date('Y-m-d') . ".pdf";

        return $pdf->download($filename);
    }
}

