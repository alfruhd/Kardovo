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
        $package = Package::where('is_active', true)->findOrFail($request->package_id);

        // Enforce minimum card count for Executive package
        if (str_contains(strtolower($package->name), 'executive') && (int) $request->guests_count < 200) {
            return back()->withErrors(['guests_count' => 'The Executive package requires a minimum order of 200 cards.']);
        }

        // Anti-tampering check: calculate price strictly from database package record
        $unitPrice = (float) $package->price;
        if ($unitPrice <= 0) {
            return back()->withErrors(['package_id' => 'Invalid package pricing configuration.']);
        }

        $guestsCount = (int) $request->guests_count;
        $totalAmount = $unitPrice * $guestsCount;
        $externalId = FinancialTransaction::generateTransactionNumber();

        // 1 card entitlement = 1 WhatsApp invitation + 1 SMS notification
        $whatsappAllowance = $guestsCount;
        $smsAllowance = $guestsCount;

        // Record the pending transaction with immutable pricing verification metadata
        $transaction = FinancialTransaction::create([
            'transaction_number' => $externalId,
            'type' => 'income',
            'category' => 'package_purchase',
            'title' => "Package Purchase: {$package->name} ({$guestsCount} cards @ ".number_format($unitPrice)." TZS — {$whatsappAllowance} WhatsApp + {$smsAllowance} SMS) via {$request->provider}",
            'amount' => $totalAmount,
            'currency' => 'TZS',
            'payment_method' => $request->provider,
            'reference' => 'PKG-'.$package->id,
            'user_id' => $user->id,
            'status' => 'pending',
            'transaction_date' => now(),
            'notes' => json_encode([
                'package_id' => $package->id,
                'package_name' => $package->name,
                'verified_unit_price' => $unitPrice,
                'cards_count' => $guestsCount,
                'guests_count' => $guestsCount,
                'whatsapp_messages_included' => $whatsappAllowance,
                'sms_messages_included' => $smsAllowance,
                'total_amount' => $totalAmount,
                'verified_at' => now()->toIso8601String(),
            ]),
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
