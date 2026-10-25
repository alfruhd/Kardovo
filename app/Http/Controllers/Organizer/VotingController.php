<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\VoteOrder;
use App\Models\VotingCandidate;
use App\Models\VotingCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VotingController extends Controller
{
    protected function authorizeEvent(Request $request, Event $event): void
    {
        $user = $request->user();
        if ($user && ! $user->isAdmin() && ! $user->isSubAdmin()) {
            if (! $user->canAccessVoting() || ($user->status ?? 'active') === 'suspended') {
                abort(403, 'Access Restricted: Your account does not have permission to manage the Voting Portal.');
            }
            if ($event->user_id !== $user->id) {
                abort(403, 'Unauthorized access to event voting.');
            }
        }
    }

    /**
     * Update voting configuration settings for an event.
     */
    public function updateSettings(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeEvent($request, $event);

        $validated = $request->validate([
            'voting_enabled' => 'required|boolean',
            'voting_start_at' => 'nullable|date',
            'voting_end_at' => 'nullable|date|after_or_equal:voting_start_at',
            'voting_visible_tallies' => 'nullable|boolean',
            'voting_instructions' => 'nullable|string|max:2000',
            'voting_banner' => 'nullable|image|max:3072',
        ]);

        if (! array_key_exists('voting_visible_tallies', $validated) || $validated['voting_visible_tallies'] === null) {
            unset($validated['voting_visible_tallies']);
        }

        if ($request->hasFile('voting_banner')) {
            $path = $request->file('voting_banner')->store('voting_banners', 'public');
            $validated['voting_banner'] = '/storage/'.$path;
        }

        $event->update($validated);

        return back()->with('success', 'Voting settings updated successfully.');
    }

    /**
     * Create a new category for the event.
     */
    public function storeCategory(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeEvent($request, $event);

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string|max:1000',
            'is_paid' => 'required|boolean',
            'pricing_tiers' => 'nullable|array',
            'pricing_tiers.*.quantity' => 'required_with:pricing_tiers|integer|min:1',
            'pricing_tiers.*.amount' => 'required_with:pricing_tiers|numeric|min:0',
            'max_selections' => 'nullable|integer|min:1|max:10',
            'sort_order' => 'nullable|integer',
        ]);

        $pricingTiers = $validated['pricing_tiers'] ?? null;
        if ($validated['is_paid'] && empty($pricingTiers)) {
            $pricingTiers = VotingCategory::defaultPricingTiers();
        }

        $event->votingCategories()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_paid' => $validated['is_paid'],
            'pricing_tiers' => $pricingTiers,
            'max_selections' => $validated['max_selections'] ?? 1,
            'sort_order' => $validated['sort_order'] ?? 0,
            'status' => 'active',
        ]);

        return back()->with('success', 'Voting category created successfully.');
    }

    /**
     * Update an existing voting category.
     */
    public function updateCategory(Request $request, Event $event, VotingCategory $category): RedirectResponse
    {
        $this->authorizeEvent($request, $event);

        if ($category->event_id !== $event->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string|max:1000',
            'is_paid' => 'required|boolean',
            'pricing_tiers' => 'nullable|array',
            'pricing_tiers.*.quantity' => 'required_with:pricing_tiers|integer|min:1',
            'pricing_tiers.*.amount' => 'required_with:pricing_tiers|numeric|min:0',
            'max_selections' => 'nullable|integer|min:1|max:10',
            'sort_order' => 'nullable|integer',
            'status' => 'nullable|in:active,closed',
        ]);

        $category->update($validated);

        return back()->with('success', 'Voting category updated successfully.');
    }

    /**
     * Delete a category and its candidates.
     */
    public function destroyCategory(Request $request, Event $event, VotingCategory $category): RedirectResponse
    {
        $this->authorizeEvent($request, $event);

        if ($category->event_id !== $event->id) {
            abort(404);
        }

        $category->delete();

        return back()->with('success', 'Voting category removed.');
    }

    /**
     * Add a nominee/contestant to a category.
     */
    public function storeCandidate(Request $request, Event $event, VotingCategory $category): RedirectResponse
    {
        $this->authorizeEvent($request, $event);

        if ($category->event_id !== $event->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'candidate_number' => 'nullable|string|max:50',
            'bio' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|max:3072',
            'sort_order' => 'nullable|integer',
        ]);

        $photoUrl = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('voting_candidates', 'public');
            $photoUrl = '/storage/'.$path;
        }

        // Auto-assign candidate number if missing (e.g. #01, #02)
        if (empty($validated['candidate_number'])) {
            $count = $category->candidates()->count() + 1;
            $validated['candidate_number'] = sprintf('%02d', $count);
        }

        $category->candidates()->create([
            'event_id' => $event->id,
            'name' => $validated['name'],
            'candidate_number' => $validated['candidate_number'],
            'bio' => $validated['bio'] ?? null,
            'photo_url' => $photoUrl,
            'sort_order' => $validated['sort_order'] ?? 0,
            'status' => 'active',
        ]);

        return back()->with('success', 'Contestant added successfully.');
    }

    /**
     * Update contestant details.
     */
    public function updateCandidate(Request $request, Event $event, VotingCandidate $candidate): RedirectResponse
    {
        $this->authorizeEvent($request, $event);

        if ($candidate->event_id !== $event->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'candidate_number' => 'nullable|string|max:50',
            'bio' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|max:3072',
            'sort_order' => 'nullable|integer',
            'status' => 'nullable|in:active,disqualified,withdrawn',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('voting_candidates', 'public');
            $validated['photo_url'] = '/storage/'.$path;
        }
        unset($validated['photo']);

        $candidate->update($validated);

        return back()->with('success', 'Contestant updated successfully.');
    }

    /**
     * Remove contestant.
     */
    public function destroyCandidate(Request $request, Event $event, VotingCandidate $candidate): RedirectResponse
    {
        $this->authorizeEvent($request, $event);

        if ($candidate->event_id !== $event->id) {
            abort(404);
        }

        $candidate->delete();

        return back()->with('success', 'Contestant removed.');
    }

    /**
     * Record a manual offline/cash vote for a contestant.
     */
    public function storeManualVote(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeEvent($request, $event);

        $validated = $request->validate([
            'voting_category_id' => 'required|exists:voting_categories,id',
            'voting_candidate_id' => 'required|exists:voting_candidates,id',
            'quantity' => 'required|integer|min:1|max:50000',
            'amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|max:50',
            'voter_name' => 'nullable|string|max:100',
            'voter_phone' => 'nullable|string|max:25',
            'notes' => 'nullable|string|max:500',
            'record_financial_transaction' => 'nullable|boolean',
        ]);

        $category = VotingCategory::where('id', $validated['voting_category_id'])
            ->where('event_id', $event->id)
            ->firstOrFail();

        $candidate = VotingCandidate::where('id', $validated['voting_candidate_id'])
            ->where('event_id', $event->id)
            ->where('voting_category_id', $category->id)
            ->firstOrFail();

        $quantity = (int) $validated['quantity'];

        // Compute amount if not manually specified
        $amount = isset($validated['amount']) && $validated['amount'] !== '' ? (float) $validated['amount'] : null;
        if ($amount === null) {
            if (! $category->is_paid) {
                $amount = 0.00;
            } else {
                $tiers = $category->pricing_tiers ?? VotingCategory::defaultPricingTiers();
                $foundTierAmount = 0;
                foreach ($tiers as $tier) {
                    if ((int) $tier['quantity'] === $quantity) {
                        $foundTierAmount = (float) $tier['amount'];
                        break;
                    }
                }
                if ($foundTierAmount > 0) {
                    $amount = $foundTierAmount;
                } else {
                    $baseTier = $tiers[0] ?? ['quantity' => 1, 'amount' => 500];
                    $baseQty = max(1, (int) ($baseTier['quantity'] ?? 1));
                    $baseAmt = (float) ($baseTier['amount'] ?? 500);
                    $unitRate = $baseAmt / $baseQty;
                    $amount = $quantity * $unitRate;
                }
            }
        }

        $isFree = ((float) $amount <= 0 || ! $category->is_paid);
        $platformFeePercent = 6.00;
        $platformFee = $isFree ? 0.00 : round($amount * ($platformFeePercent / 100), 2);
        $organizerNetAmount = $isFree ? 0.00 : round($amount - $platformFee, 2);

        $paymentMethod = $validated['payment_method'] ?? 'Cash';
        $user = $request->user();

        $orderNumber = 'VOTE-MAN-'.strtoupper(Str::random(8));

        $order = VoteOrder::create([
            'order_number' => $orderNumber,
            'event_id' => $event->id,
            'voting_category_id' => $category->id,
            'voting_candidate_id' => $candidate->id,
            'voter_phone' => $validated['voter_phone'] ?? 'N/A (Manual Entry)',
            'voter_name' => $validated['voter_name'] ?? 'Walk-in Supporter',
            'quantity' => $quantity,
            'amount' => $amount,
            'platform_fee' => $platformFee,
            'platform_fee_percent' => $platformFeePercent,
            'organizer_net_amount' => $organizerNetAmount,
            'currency' => 'TZS',
            'provider' => $paymentMethod,
            'payment_reference' => 'MANUAL-'.strtoupper(Str::random(6)),
            'status' => 'completed',
            'paid_at' => now(),
            'is_free' => $isFree,
            'metadata' => [
                'recorded_by_user_id' => $user->id,
                'recorded_by_name' => $user->name,
                'recorded_by_role' => $user->role,
                'notes' => $validated['notes'] ?? null,
                'manual_entry' => true,
            ],
        ]);

        // Credit candidate tallies
        $candidate->recordVotes($quantity, (float) $amount);

        // Record in financial ledger if requested (defaults to true for paid entries)
        $recordInFinancials = $request->boolean('record_financial_transaction', true);
        if ($recordInFinancials && ! $isFree && (float) $amount > 0) {
            $order->recordFinancialTransaction();
        }

        return back()->with('success', "Manual vote recorded: {$quantity} votes credited to {$candidate->name} (".number_format($amount).' TZS).');
    }

    /**
     * Export audit CSV of all votes cast for this event.
     */
    public function exportVotesCsv(Request $request, Event $event): StreamedResponse
    {
        $this->authorizeEvent($request, $event);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="votes-audit-'.$event->id.'-'.date('Ymd-His').'.csv"',
        ];

        return response()->stream(function () use ($event) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Order Number',
                'Date & Time',
                'Category',
                'Candidate Number',
                'Candidate Name',
                'Voter Phone',
                'Voter Name',
                'Votes Cast',
                'Gross Amount (TZS)',
                'Platform Fee (6%)',
                'Net to Organizer (TZS)',
                'Payment Channel',
                'Status',
                'Reference ID',
            ]);

            VoteOrder::with(['category', 'candidate'])
                ->where('event_id', $event->id)
                ->orderByDesc('id')
                ->chunk(200, function ($orders) use ($handle) {
                    foreach ($orders as $order) {
                        $gross = (float) $order->amount;
                        $fee = (float) ($order->platform_fee ?: round($gross * 0.06, 2));
                        $net = (float) ($order->organizer_net_amount ?: round($gross - $fee, 2));

                        fputcsv($handle, [
                            $order->order_number,
                            $order->created_at->format('Y-m-d H:i:s'),
                            $order->category?->name ?? 'N/A',
                            $order->candidate?->candidate_number ?? 'N/A',
                            $order->candidate?->name ?? 'N/A',
                            $order->voter_phone,
                            $order->voter_name ?? 'Anonymous',
                            $order->quantity,
                            $gross,
                            $fee,
                            $net,
                            $order->provider,
                            strtoupper($order->status),
                            $order->payment_reference ?? 'N/A',
                        ]);
                    }
                });

            fclose($handle);
        }, 200, $headers);
    }
}
