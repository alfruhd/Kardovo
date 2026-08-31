<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FinancialTransaction;
use App\Models\User;
use App\Models\Event;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

        $query = FinancialTransaction::with(['user:id,name,email,company', 'event:id,title,venue,event_date']);

        if ($period === '30days') {
            $query->where('transaction_date', '>=', now()->subDays(30));
        } elseif ($period === '90days') {
            $query->where('transaction_date', '>=', now()->subDays(90));
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
            'income_by_category' => $incomeByCategory,
            'expense_by_category' => $expenseByCategory,
            'monthly_trend' => $monthlyTrend,
            'transactions' => $transactions,
            'organizers' => $organizers,
            'events' => $events,
            'filters' => [
                'period' => $period,
                'type' => $typeFilter,
                'category' => $categoryFilter,
                'search' => $search,
            ],
        ]);
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
        $typeFilter = $request->input('type', 'all');
        $categoryFilter = $request->input('category', 'all');
        $search = $request->input('search', '');

        $query = FinancialTransaction::with(['user:id,name,email,company', 'event:id,title']);

        if ($period === '30days') {
            $query->where('transaction_date', '>=', now()->subDays(30));
        } elseif ($period === '90days') {
            $query->where('transaction_date', '>=', now()->subDays(90));
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
        $filename = "Kardovo_Financial_Audit{$typeSuffix}_" . date('Y-m-d') . ".csv";

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
}
