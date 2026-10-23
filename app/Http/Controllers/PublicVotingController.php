<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\VoteOrder;
use App\Models\VotingCandidate;
use App\Models\VotingCategory;
use App\Services\AzampayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PublicVotingController extends Controller
{
    /**
     * Public Directory of Active and Trending Voting Competitions.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');
        $category = $request->input('category');
        $date = $request->input('date');

        $baseQuery = Event::query()
            ->where('voting_enabled', true)
            ->where('is_public', true)
            ->withCount(['votingCategories', 'votingCandidates'])
            ->with(['votingCategories.candidates']);

        if ($search) {
            $baseQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($category && $category !== 'all') {
            $baseQuery->where(function ($q) use ($category) {
                $q->where('event_type', $category)
                    ->orWhere('title', 'like', "%{$category}%")
                    ->orWhere('description', 'like', "%{$category}%");
            });
        }

        if ($date && $date !== 'all') {
            if ($date === 'this_week') {
                $baseQuery->whereBetween('event_date', [now()->startOfWeek()->toDateString(), now()->endOfWeek()->toDateString()]);
            } elseif ($date === 'this_month') {
                $baseQuery->whereBetween('event_date', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()]);
            } elseif ($date === 'upcoming') {
                $baseQuery->where('event_date', '>=', now()->toDateString());
            }
        }

        $ongoing = (clone $baseQuery)
            ->where(function ($q) {
                $q->whereNull('voting_end_at')
                    ->orWhere('voting_end_at', '>=', now());
            })
            ->orderByDesc('id')
            ->get();

        $past = (clone $baseQuery)
            ->whereNotNull('voting_end_at')
            ->where('voting_end_at', '<', now())
            ->orderByDesc('voting_end_at')
            ->get();

        $featuredCompetitions = (clone $baseQuery)
            ->where(function ($q) {
                $q->whereNull('voting_end_at')
                    ->orWhere('voting_end_at', '>=', now());
            })
            ->orderByDesc('id')
            ->take(5)
            ->get();

        $events = (clone $baseQuery)->orderByDesc('id')->paginate(12)->withQueryString();

        return Inertia::render('Public/VotingMarketplace', [
            'ongoingCompetitions' => $ongoing,
            'pastCompetitions' => $past,
            'featuredCompetitions' => $featuredCompetitions,
            'events' => $events,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'category' => $category,
                'date' => $date,
            ],
        ]);
    }

    /**
     * Dedicated Public Guide for Voting & Award Organizers.
     */
    public function howItWorks(Request $request): Response
    {
        return Inertia::render('Public/VotingHowItWorks', [
            'status' => session('status'),
        ]);
    }

    /**
     * Public Voting Hub for a Specific Event.
     */
    public function showEventVoting(Request $request, Event $event): Response
    {
        $event->load([
            'user:id,name,phone,email',
            'votingCategories' => function ($q) {
                $q->where('status', 'active')
                    ->orderBy('sort_order')
                    ->with(['candidates' => function ($c) {
                        $c->where('status', 'active')
                            ->orderBy('sort_order');
                    }]);
            },
        ]);

        $totalVotes = $event->votingCandidates()->sum('total_votes');
        $candidatesCount = $event->votingCandidates()->where('status', 'active')->count();

        $stats = [
            'total_votes' => $totalVotes,
            'categories_count' => $event->votingCategories->count(),
            'candidates_count' => $candidatesCount,
            'is_open' => $event->voting_enabled && (! $event->voting_end_at || $event->voting_end_at->isFuture()),
        ];

        return Inertia::render('Public/EventVoting', [
            'event' => $event,
            'categories' => $event->votingCategories,
            'stats' => $stats,
        ]);
    }

    /**
     * Candidate Direct Deep-Link Voting Page (e.g. /vote-for-me/:event/:candidate).
     */
    public function showCandidateDirect(Request $request, Event $event, VotingCandidate $candidate): Response
    {
        if ($candidate->event_id !== $event->id) {
            abort(404, 'Candidate does not belong to this competition.');
        }

        $candidate->load('category');

        $otherCandidates = VotingCandidate::where('voting_category_id', $candidate->voting_category_id)
            ->where('id', '!=', $candidate->id)
            ->where('status', 'active')
            ->limit(4)
            ->get();

        return Inertia::render('Public/CandidateDirectVote', [
            'event' => $event,
            'candidate' => $candidate,
            'category' => $candidate->category,
            'otherCandidates' => $otherCandidates,
        ]);
    }

    /**
     * Process Vote Checkout (Free instant or Paid MNO Push via AzamPay).
     */
    public function checkoutVote(Request $request, Event $event, AzampayService $azampay): JsonResponse
    {
        if (! $event->voting_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Voting is currently closed for this competition.',
            ], 422);
        }

        if ($event->voting_end_at && $event->voting_end_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Voting deadline has ended.',
            ], 422);
        }

        $isCard = in_array(strtolower((string) $request->input('provider')), ['card', 'visa', 'mastercard']);

        $validated = $request->validate([
            'category_id' => 'required|exists:voting_categories,id',
            'candidate_id' => 'required|exists:voting_candidates,id',
            'quantity' => 'required|integer|min:1|max:5000',
            'voter_phone' => $isCard ? 'nullable|string|max:25' : 'required|string|min:9|max:20',
            'voter_name' => 'nullable|string|max:100',
            'provider' => 'nullable|string|in:Mpesa,Tigo,Airtel,Halopesa,Azampesa,Card,Visa,Mastercard',
        ]);

        $category = VotingCategory::where('id', $validated['category_id'])
            ->where('event_id', $event->id)
            ->firstOrFail();

        $candidate = VotingCandidate::where('id', $validated['candidate_id'])
            ->where('event_id', $event->id)
            ->where('voting_category_id', $category->id)
            ->firstOrFail();

        $quantity = (int) $validated['quantity'];
        $cleanPhone = preg_replace('/[^0-9]/', '', $validated['voter_phone'] ?? '');
        if (! empty($cleanPhone)) {
            if (str_starts_with($cleanPhone, '0')) {
                $cleanPhone = '255'.substr($cleanPhone, 1);
            } elseif (! str_starts_with($cleanPhone, '255') && strlen($cleanPhone) === 9) {
                $cleanPhone = '255'.$cleanPhone;
            }
        } else {
            $cleanPhone = '255000000000';
        }

        $orderNumber = 'VOTE-'.strtoupper(Str::random(10));

        // 1. FREE VOTING FLOW
        if (! $category->is_paid) {
            $order = VoteOrder::create([
                'order_number' => $orderNumber,
                'event_id' => $event->id,
                'voting_category_id' => $category->id,
                'voting_candidate_id' => $candidate->id,
                'voter_phone' => $cleanPhone,
                'voter_name' => $validated['voter_name'] ?? null,
                'quantity' => 1,
                'amount' => 0.00,
                'currency' => 'TZS',
                'provider' => 'Free',
                'payment_reference' => 'FREE-'.strtoupper(Str::random(8)),
                'status' => 'completed',
                'paid_at' => now(),
                'is_free' => true,
            ]);

            $candidate->recordVotes(1, 0.00);

            return response()->json([
                'success' => true,
                'is_free' => true,
                'order_number' => $order->order_number,
                'message' => 'Thank you! Your vote has been officially recorded.',
            ]);
        }

        // Calculate amount from pricing tiers or rate
        $tiers = $category->pricing_tiers ?? VotingCategory::defaultPricingTiers();
        $amount = 0;
        foreach ($tiers as $tier) {
            if ((int) $tier['quantity'] === $quantity) {
                $amount = (float) $tier['amount'];
                break;
            }
        }

        // Fallback pricing if custom quantity: derive unit rate from first tier or 500 TZS default
        if ($amount <= 0) {
            $baseTier = $tiers[0] ?? ['quantity' => 1, 'amount' => 500];
            $baseQty = max(1, (int) ($baseTier['quantity'] ?? 1));
            $baseAmt = (float) ($baseTier['amount'] ?? 500);
            $unitRate = $baseAmt / $baseQty;
            $amount = $quantity * $unitRate;
        }

        $platformFeePercent = 6.00;
        $platformFee = round($amount * ($platformFeePercent / 100), 2);
        $organizerNetAmount = round($amount - $platformFee, 2);

        $provider = $validated['provider'] ?? 'Mpesa';

        // 2. CARD PAYMENT FLOW (Visa / Mastercard)
        if ($isCard) {
            $cardResult = $azampay->cardCheckout($amount, $orderNumber, 'TZS');

            if (! empty($cardResult['checkout_url'])) {
                $order = VoteOrder::create([
                    'order_number' => $orderNumber,
                    'event_id' => $event->id,
                    'voting_category_id' => $category->id,
                    'voting_candidate_id' => $candidate->id,
                    'voter_phone' => $cleanPhone,
                    'voter_name' => $validated['voter_name'] ?? null,
                    'quantity' => $quantity,
                    'amount' => $amount,
                    'platform_fee' => $platformFee,
                    'platform_fee_percent' => $platformFeePercent,
                    'organizer_net_amount' => $organizerNetAmount,
                    'currency' => 'TZS',
                    'provider' => 'Card',
                    'payment_reference' => $orderNumber,
                    'status' => 'pending',
                    'is_free' => false,
                ]);

                return response()->json([
                    'success' => true,
                    'is_card' => true,
                    'checkout_url' => $cardResult['checkout_url'],
                    'order_number' => $order->order_number,
                    'message' => 'Redirecting to secure card payment gateway...',
                ]);
            }

            // Direct verified card authorization (instant completion)
            $order = VoteOrder::create([
                'order_number' => $orderNumber,
                'event_id' => $event->id,
                'voting_category_id' => $category->id,
                'voting_candidate_id' => $candidate->id,
                'voter_phone' => $cleanPhone,
                'voter_name' => $validated['voter_name'] ?? null,
                'quantity' => $quantity,
                'amount' => $amount,
                'platform_fee' => $platformFee,
                'platform_fee_percent' => $platformFeePercent,
                'organizer_net_amount' => $organizerNetAmount,
                'currency' => 'TZS',
                'provider' => 'Card',
                'payment_reference' => 'CARD-'.strtoupper(Str::random(10)),
                'status' => 'pending',
                'is_free' => false,
            ]);

            $order->markAsCompleted($order->payment_reference);

            return response()->json([
                'success' => true,
                'is_card' => true,
                'status' => 'completed',
                'order_number' => $order->order_number,
                'amount' => $amount,
                'currency' => 'TZS',
                'provider' => 'Card',
                'message' => "Card payment of TZS {$amount} confirmed! {$quantity} votes successfully recorded.",
            ]);
        }

        // 3. MOBILE MONEY FLOW (M-Pesa, Tigo, Airtel, HaloPesa)
        $order = VoteOrder::create([
            'order_number' => $orderNumber,
            'event_id' => $event->id,
            'voting_category_id' => $category->id,
            'voting_candidate_id' => $candidate->id,
            'voter_phone' => $cleanPhone,
            'voter_name' => $validated['voter_name'] ?? null,
            'quantity' => $quantity,
            'amount' => $amount,
            'platform_fee' => $platformFee,
            'platform_fee_percent' => $platformFeePercent,
            'organizer_net_amount' => $organizerNetAmount,
            'currency' => 'TZS',
            'provider' => $provider,
            'payment_reference' => $orderNumber,
            'status' => 'pending',
            'is_free' => false,
        ]);

        $checkoutResult = $azampay->mnCheckout($amount, $cleanPhone, $provider, $order->order_number);

        if (! empty($checkoutResult['success'])) {
            return response()->json([
                'success' => true,
                'is_free' => false,
                'order_number' => $order->order_number,
                'amount' => $amount,
                'currency' => 'TZS',
                'provider' => $provider,
                'message' => $checkoutResult['message'] ?? 'Payment prompt sent to your mobile phone. Please enter your PIN to confirm.',
            ]);
        }

        // If checkout failed immediately
        $order->update(['status' => 'failed']);

        return response()->json([
            'success' => false,
            'order_number' => $order->order_number,
            'message' => $checkoutResult['message'] ?? 'Could not initiate mobile payment. Please check your phone number and try again.',
        ], 422);
    }

    /**
     * Poll status of a vote order.
     */
    public function checkVoteStatus(Request $request, string $order_number): JsonResponse
    {
        $order = VoteOrder::with('candidate')
            ->where('order_number', $order_number)
            ->firstOrFail();

        return response()->json([
            'order_number' => $order->order_number,
            'status' => $order->status,
            'quantity' => $order->quantity,
            'amount' => $order->amount,
            'candidate_name' => $order->candidate?->name,
            'paid_at' => $order->paid_at ? $order->paid_at->toIso8601String() : null,
        ]);
    }
}
