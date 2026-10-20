<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Guest;
use App\Models\PledgePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PledgeController extends Controller
{
    public function updateSettings(Request $request, Event $event)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403);
        }

        $validated = $request->validate([
            'pledge_target' => 'nullable|numeric|min:0',
            'pledge_currency' => 'nullable|string|max:10',
            'pledges_enabled' => 'nullable|boolean',
            'pledge_deadline' => 'nullable|date',
            'pledge_settings' => 'nullable|array',
            'pledge_settings.lipa_number' => 'nullable|string|max:100',
            'pledge_settings.bank_name' => 'nullable|string|max:100',
            'pledge_settings.account_number' => 'nullable|string|max:100',
            'pledge_settings.account_name' => 'nullable|string|max:100',
            'pledge_settings.instructions' => 'nullable|string|max:500',
        ]);

        $event->update([
            'pledge_target' => $validated['pledge_target'] ?? 0,
            'pledge_currency' => $validated['pledge_currency'] ?? 'TZS',
            'pledges_enabled' => $request->boolean('pledges_enabled', true),
            'pledge_deadline' => $validated['pledge_deadline'] ?? null,
            'pledge_settings' => $validated['pledge_settings'] ?? null,
        ]);

        return back()->with('success', 'Pledge & contribution campaign settings updated successfully.');
    }

    public function storePledge(Request $request, Event $event)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403);
        }

        $validated = $request->validate([
            'guest_id' => 'nullable|exists:guests,id',
            'name' => 'required_without:guest_id|nullable|string|max:255',
            'phone' => 'required_without:guest_id|nullable|string|max:30',
            'category' => 'nullable|string|max:50',
            'pledge_amount' => 'required|numeric|min:0',
            'pledge_deadline' => 'nullable|date',
            'initial_paid' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|max:30',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $guest = DB::transaction(function () use ($event, $validated, $user) {
            if (! empty($validated['guest_id'])) {
                $guest = $event->guests()->findOrFail($validated['guest_id']);
                $guest->update([
                    'pledge_amount' => $validated['pledge_amount'],
                    'pledge_deadline' => $validated['pledge_deadline'] ?? $guest->pledge_deadline,
                ]);
            } else {
                $guest = $event->guests()->create([
                    'name' => $validated['name'],
                    'phone' => $validated['phone'] ?? null,
                    'category' => $validated['category'] ?? 'Contributor',
                    'max_entries' => 1,
                    'pledge_amount' => $validated['pledge_amount'],
                    'pledge_deadline' => $validated['pledge_deadline'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                ]);
            }

            if (! empty($validated['initial_paid']) && floatval($validated['initial_paid']) > 0) {
                PledgePayment::create([
                    'event_id' => $event->id,
                    'guest_id' => $guest->id,
                    'user_id' => $user->id,
                    'amount' => $validated['initial_paid'],
                    'payment_method' => $validated['payment_method'] ?? 'cash',
                    'reference' => $validated['reference'] ?? null,
                    'payment_date' => now()->toDateString(),
                    'notes' => 'Initial payment upon recording pledge',
                ]);
            } else {
                $guest->recalculatePledgePaid();
            }

            return $guest;
        });

        return back()->with('success', "Pledge for {$guest->name} recorded successfully.");
    }

    public function recordPayment(Request $request, Event $event, Guest $guest)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists() || $guest->event_id !== $event->id) {
            abort(403);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string|max:30',
            'reference' => 'nullable|string|max:100',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($event, $guest, $user, $validated) {
            PledgePayment::create([
                'event_id' => $event->id,
                'guest_id' => $guest->id,
                'user_id' => $user->id,
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'reference' => $validated['reference'] ?? null,
                'payment_date' => $validated['payment_date'] ?? now()->toDateString(),
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return back()->with('success', "Payment of {$event->pledge_currency} ".number_format($validated['amount'])." recorded for {$guest->name}.");
    }

    public function deletePayment(Request $request, Event $event, PledgePayment $payment)
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists() || $payment->event_id !== $event->id) {
            abort(403);
        }

        DB::transaction(function () use ($payment) {
            $payment->delete();
        });

        return back()->with('success', 'Payment installment removed and guest balance updated.');
    }

    public function exportReport(Request $request, Event $event): StreamedResponse
    {
        $user = $request->user();
        if (! Event::accessibleBy($user)->where('id', $event->id)->exists()) {
            abort(403);
        }

        $status = $request->query('status', $request->query('filter'));

        $query = $event->guests()->with(['pledgePayments'])->orderBy('name');

        if ($status === 'completed') {
            $query->whereIn('pledge_status', ['completed', 'overpaid']);
        } elseif ($status === 'partial') {
            $query->where('pledge_status', 'partial');
        } elseif ($status === 'unpaid') {
            $query->where(function ($q) {
                $q->where('pledge_status', 'pledged')
                    ->orWhere(function ($q2) {
                        $q2->where('pledge_amount', '>', 0)
                            ->where('paid_amount', '<=', 0);
                    })
                    ->orWhere(function ($q3) {
                        $q3->where('pledge_amount', '<=', 0)
                            ->where('paid_amount', '<=', 0);
                    });
            });
        } elseif ($status === 'has_pledge') {
            $query->where(function ($q) {
                $q->where('pledge_amount', '>', 0)
                    ->orWhere('paid_amount', '>', 0);
            });
        }

        $contributors = $query->get();

        $currency = $event->pledge_currency ?: 'TZS';
        $filename = 'Pledges_Ledger_'.Str::slug($event->title).'_'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($contributors, $currency) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM for Microsoft Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['Name', 'Phone', 'Category', "Pledged ({$currency})", "Paid ({$currency})", "Balance ({$currency})", 'Status', 'Deadline', 'Last Payment Date']);

            foreach ($contributors as $guest) {
                $lastPayment = $guest->pledgePayments->first();
                $pledge = (float) ($guest->pledge_amount ?? 0);
                $paid = (float) ($guest->paid_amount ?? 0);
                $balance = max(0.0, round($pledge - $paid, 2));

                $statusLabel = 'PENDING';
                if ($guest->pledge_status === 'completed' || $guest->pledge_status === 'overpaid' || ($pledge > 0 && $paid >= $pledge)) {
                    $statusLabel = 'COMPLETED';
                } elseif ($guest->pledge_status === 'partial' || ($paid > 0 && $paid < $pledge)) {
                    $statusLabel = 'PARTIAL';
                }

                $deadlineStr = 'N/A';
                if ($guest->pledge_deadline) {
                    $deadlineStr = $guest->pledge_deadline instanceof \DateTimeInterface
                        ? $guest->pledge_deadline->format('Y-m-d')
                        : (string) $guest->pledge_deadline;
                }

                $lastPaymentStr = 'N/A';
                if ($lastPayment && $lastPayment->payment_date) {
                    $lastPaymentStr = $lastPayment->payment_date instanceof \DateTimeInterface
                        ? $lastPayment->payment_date->format('Y-m-d')
                        : (string) $lastPayment->payment_date;
                }

                fputcsv($handle, [
                    $guest->name,
                    $guest->phone ?: 'N/A',
                    $guest->category ?: 'General',
                    number_format($pledge, 2, '.', ''),
                    number_format($paid, 2, '.', ''),
                    number_format($balance, 2, '.', ''),
                    $statusLabel,
                    $deadlineStr,
                    $lastPaymentStr,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
