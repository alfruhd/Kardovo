<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\FinancialTransaction;
use App\Models\Package;
use App\Services\AzampayService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $packages = Package::where('is_active', true)->get();

        $transactions = FinancialTransaction::where('user_id', $user->id)
            ->whereIn('category', ['package_purchase', 'direct_payment'])
            ->latest()
            ->take(20)
            ->get();

        $hasEvent = $user && $user->events()->exists();

        return Inertia::render('Organizer/Payments/Index', [
            'packages' => $packages,
            'transactions' => $transactions,
            'has_event' => $hasEvent,
        ]);
    }

    /**
     * Direct payment for a package via AzamPay (no wallet).
     */
    public function purchasePackage(Request $request, AzampayService $azampay)
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'provider' => 'required|string',
            'mobileNumber' => 'required_if:provider,Airtel,Tigo,Halopesa,Azampesa,Mpesa|nullable|string',
            'guests_count' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $package = Package::findOrFail($request->package_id);
        $externalId = FinancialTransaction::generateTransactionNumber();
        $totalAmount = $package->price * $request->guests_count;

        // Record the pending transaction
        $transaction = FinancialTransaction::create([
            'transaction_number' => $externalId,
            'type' => 'income',
            'category' => 'package_purchase',
            'title' => 'Package Purchase: '.$package->name.' ('.$request->guests_count.' guests) via '.$request->provider,
            'amount' => $totalAmount,
            'currency' => 'TZS',
            'payment_method' => $request->provider,
            'reference' => 'PKG-'.$package->id,
            'user_id' => $user->id,
            'status' => 'pending',
            'transaction_date' => now(),
        ]);

        $mobileProviders = ['Airtel', 'Tigo', 'Halopesa', 'Azampesa', 'Mpesa'];

        if (in_array($request->provider, $mobileProviders)) {
            $result = $azampay->mnCheckout(
                $totalAmount,
                $request->mobileNumber,
                $request->provider,
                $externalId
            );

            if ($result['success']) {
                return back()->with('success', 'Payment request sent! Check your phone for the USSD prompt to complete the purchase.');
            }

            $transaction->update(['status' => 'failed', 'notes' => $result['message']]);

            return back()->with('error', $result['message']);
        }

        // Card / Bank / QR / Lipia Link — hosted checkout (integration pending)
        $transaction->update(['status' => 'failed', 'notes' => 'Hosted checkout pending for '.$request->provider]);

        return back()->with('error', 'Checkout via '.$request->provider.' is currently being integrated. Please use a mobile money option.');
    }

    public function receipt(Request $request, FinancialTransaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        return Inertia::render('Organizer/Payments/Receipt', [
            'transaction' => $transaction,
            'user' => $request->user(),
        ]);
    }
}
