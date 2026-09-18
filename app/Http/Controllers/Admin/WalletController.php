<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FinancialTransaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WalletController extends Controller
{
    public function index()
    {
        $wallets = Wallet::with('user')->paginate(15);

        return Inertia::render('Admin/Wallets/Index', [
            'wallets' => $wallets,
        ]);
    }

    public function adjustBalance(Request $request, Wallet $wallet)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'type' => 'required|in:credit,debit',
            'notes' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($request, $wallet) {
            if ($request->type === 'credit') {
                $wallet->balance += $request->amount;
                $transactionType = 'income';
            } else {
                if ($wallet->balance < $request->amount) {
                    throw new \Exception('Insufficient balance for this debit.');
                }
                $wallet->balance -= $request->amount;
                $transactionType = 'expense';
            }
            $wallet->save();

            FinancialTransaction::create([
                'transaction_number' => FinancialTransaction::generateTransactionNumber(),
                'type' => $transactionType,
                'category' => 'wallet_adjustment',
                'title' => 'Admin Adjustment: '.$request->type,
                'amount' => $request->amount,
                'currency' => $wallet->currency,
                'payment_method' => 'Manual',
                'reference' => 'Admin-'.auth()->id(),
                'user_id' => $wallet->user_id,
                'wallet_id' => $wallet->id,
                'status' => 'completed',
                'notes' => $request->notes,
                'transaction_date' => now(),
            ]);
        });

        return back()->with('success', 'Wallet balance adjusted successfully.');
    }
}
