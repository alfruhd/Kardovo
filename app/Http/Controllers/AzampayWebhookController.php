<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AzampayWebhookController extends Controller
{
    public function handleCallback(Request $request)
    {
        Log::info('Azampay Webhook Received:', $request->all());

        // Basic payload validation
        if (! $request->has('transactionid') || ! $request->has('externalId') || ! $request->has('mnoReference')) {
            return response()->json(['success' => false, 'message' => 'Invalid payload'], 400);
        }

        $externalId = $request->input('externalId');

        $transaction = FinancialTransaction::where('transaction_number', $externalId)->first();

        if (! $transaction) {
            Log::error('Azampay Webhook: Transaction not found', ['externalId' => $externalId]);

            return response()->json(['success' => false, 'message' => 'Transaction not found'], 404);
        }

        if ($transaction->status === 'completed') {
            return response()->json(['success' => true, 'message' => 'Already processed'], 200);
        }

        // Check if Azampay says it's successful
        // Note: Azampay callback format typically has a status or message field.
        // Assuming 'message' => 'Transaction Successful' or similar.
        // MNO push usually hits this webhook ONLY on success or definitive failure.
        $status = strtolower($request->input('message', ''));
        if (str_contains($status, 'success') || str_contains($status, 'completed')) {
            $transaction->update([
                'status' => 'completed',
                'reference' => $request->input('mnoReference'),
                'notes' => 'Azampay transaction ID: '.$request->input('transactionid'),
            ]);

            // Credit the wallet
            $wallet = Wallet::find($transaction->wallet_id);
            if ($wallet) {
                $wallet->balance += $transaction->amount;
                $wallet->save();
            }
        } else {
            $transaction->update([
                'status' => 'failed',
                'notes' => 'Azampay transaction failed. '.$request->input('message', ''),
            ]);
        }

        return response()->json(['success' => true]);
    }
}
