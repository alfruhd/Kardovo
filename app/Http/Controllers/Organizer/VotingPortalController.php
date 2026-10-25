<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\VoteOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VotingPortalController extends Controller
{
    protected function authorizeEvent(Request $request, Event $event): void
    {
        $user = $request->user();
        if ($user && ! $user->isAdmin() && ! $user->isSubAdmin()) {
            if (! $user->canAccessVoting() || ($user->status ?? 'active') === 'suspended') {
                abort(403, 'Access Restricted: Your account does not have permission to access the Voting Portal.');
            }
            if ($event->user_id !== $user->id) {
                abort(403, 'Unauthorized access to this voting competition.');
            }
        }
    }

    /**
     * Display the independent Voting Organizer Portal.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user && ! $user->isAdmin() && ! $user->isSubAdmin()) {
            if (! $user->canAccessVoting() || ($user->status ?? 'active') === 'suspended') {
                return redirect()->route('dashboard')->with('error', 'Access Restricted: Your account does not have permission to access the Voting Portal.');
            }
        }

        $query = Event::query()
            ->when(! $user->isAdmin() && ! $user->isSubAdmin(), function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('voting_enabled', true)
            ->with(['user:id,name,email,company', 'votingCategories.candidates'])
            ->withCount(['votingCategories', 'votingCandidates']);

        $competitions = $query->orderByDesc('id')->get()->map(function ($comp) {
            $compVotes = 0;
            $compRevenue = 0;
            foreach ($comp->votingCategories as $cat) {
                foreach ($cat->candidates as $cand) {
                    $compVotes += (int) $cand->total_votes;
                    $compRevenue += (float) $cand->revenue_collected;
                }
            }
            $compFee = round($compRevenue * 0.06, 2);
            $comp->total_votes = $compVotes;
            $comp->gross_revenue = $compRevenue;
            $comp->platform_fee = $compFee;
            $comp->net_revenue = round($compRevenue - $compFee, 2);

            return $comp;
        });

        // Calculate aggregated stats across all voting competitions
        $totalVotes = 0;
        $totalRevenue = 0;
        $totalCandidates = 0;

        foreach ($competitions as $comp) {
            $totalVotes += $comp->total_votes;
            $totalRevenue += $comp->gross_revenue;
            $totalCandidates += (int) ($comp->voting_candidates_count ?? 0);
        }

        $platformFees = round($totalRevenue * 0.06, 2);
        $netRevenue = round($totalRevenue - $platformFees, 2);

        $stats = [
            'total_competitions' => $competitions->count(),
            'total_votes' => $totalVotes,
            'total_revenue' => $totalRevenue,
            'gross_revenue' => $totalRevenue,
            'platform_fees' => $platformFees,
            'platform_fee_percent' => 6.00,
            'net_revenue' => $netRevenue,
            'total_candidates' => $totalCandidates,
        ];

        $ordersQuery = VoteOrder::query()
            ->with(['event:id,title', 'candidate:id,name', 'category:id,name'])
            ->when(! $user->isAdmin() && ! $user->isSubAdmin(), function ($q) use ($user) {
                $q->whereHas('event', function ($eq) use ($user) {
                    $eq->where('user_id', $user->id);
                });
            })
            ->latest('id')
            ->limit(100)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'created_at' => $order->created_at ? $order->created_at->format('d M Y, H:i') : '—',
                    'event_title' => $order->event?->title ?? 'Competition',
                    'candidate_name' => $order->candidate?->name ?? 'Nominee',
                    'category_name' => $order->category?->name ?? 'Category',
                    'voter_phone' => $order->voter_phone ?? '—',
                    'quantity' => (int) $order->quantity,
                    'amount' => (float) $order->amount,
                    'platform_fee' => (float) ($order->platform_fee ?? round($order->amount * 0.06, 2)),
                    'organizer_net' => (float) ($order->organizer_net_amount ?? round($order->amount * 0.94, 2)),
                    'provider' => strtoupper($order->provider ?? 'AzamPay'),
                    'status' => $order->status,
                ];
            });

        return Inertia::render('Organizer/Voting/Index', [
            'competitions' => $competitions,
            'stats' => $stats,
            'recentVoteOrders' => $ordersQuery,
            'isAdmin' => $user->isAdmin() || $user->isSubAdmin(),
        ]);
    }

    /**
     * Create a new independent voting competition.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user && ! $user->isAdmin() && ! $user->isSubAdmin()) {
            if (! $user->canAccessVoting() || ($user->status ?? 'active') === 'suspended') {
                return redirect()->route('dashboard')->with('error', 'Access Restricted: Your account does not have permission to access the Voting Portal.');
            }
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'event_type' => 'required|string|max:100',
            'city' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:2000',
            'voting_start_at' => 'nullable|date',
            'voting_end_at' => 'nullable|date|after_or_equal:voting_start_at',
            'voting_visible_tallies' => 'required|boolean',
            'voting_instructions' => 'nullable|string|max:2000',
            'banner' => 'nullable|image|max:3072',
        ]);

        $bannerUrl = null;
        if ($request->hasFile('banner')) {
            $path = $request->file('banner')->store('voting_banners', 'public');
            $bannerUrl = '/storage/'.$path;
        }

        $eventDate = ! empty($validated['voting_end_at'])
            ? date('Y-m-d', strtotime($validated['voting_end_at']))
            : now()->addDays(30)->toDateString();

        $competition = Event::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'event_type' => $validated['event_type'],
            'city' => $validated['city'] ?? 'Dar es Salaam',
            'venue' => 'Official Voting Arena',
            'description' => $validated['description'] ?? null,
            'event_date' => $eventDate,
            'status' => 'published',
            'is_public' => true,
            'is_occasion' => false,
            'voting_enabled' => true,
            'voting_start_at' => $validated['voting_start_at'] ?? now(),
            'voting_end_at' => $validated['voting_end_at'] ?? null,
            'voting_visible_tallies' => $validated['voting_visible_tallies'],
            'voting_instructions' => $validated['voting_instructions'] ?? null,
            'voting_banner' => $bannerUrl,
        ]);

        return redirect()->route('voting.portal.show', $competition->id)
            ->with('success', 'Voting competition launched successfully. Now add your award categories and contestants.');
    }

    /**
     * Show dedicated management dashboard for a specific voting competition.
     */
    public function show(Request $request, Event $event): Response
    {
        $this->authorizeEvent($request, $event);

        $event->load([
            'votingCategories' => function ($q) {
                $q->orderBy('sort_order')->with([
                    'candidates' => fn ($c) => $c->orderBy('sort_order'),
                ]);
            },
        ]);

        $totalVotes = (int) $event->votingCandidates()->sum('total_votes');
        $totalRevenue = (float) $event->votingCandidates()->sum('revenue_collected');
        $platformFee = round($totalRevenue * 0.06, 2);
        $netRevenue = round($totalRevenue - $platformFee, 2);
        $candidatesCount = $event->votingCandidates()->count();

        $votingStats = [
            'total_votes' => $totalVotes,
            'total_revenue' => $totalRevenue,
            'gross_revenue' => $totalRevenue,
            'platform_fee' => $platformFee,
            'platform_fee_percent' => 6.00,
            'net_revenue' => $netRevenue,
            'candidates_count' => $candidatesCount,
            'categories_count' => $event->votingCategories->count(),
            'is_open' => $event->voting_enabled && (! $event->voting_end_at || $event->voting_end_at->isFuture()),
        ];

        $voteOrders = VoteOrder::with(['category:id,name', 'candidate:id,name,candidate_number'])
            ->where('event_id', $event->id)
            ->orderByDesc('id')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Organizer/Voting/Show', [
            'competition' => $event,
            'votingCategories' => $event->votingCategories,
            'votingStats' => $votingStats,
            'voteOrders' => $voteOrders,
        ]);
    }

    /**
     * Update an existing voting competition.
     */
    public function update(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeEvent($request, $event);

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'event_type' => 'required|string|max:100',
            'city' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:2000',
            'voting_enabled' => 'required|boolean',
            'voting_start_at' => 'nullable|date',
            'voting_end_at' => 'nullable|date|after_or_equal:voting_start_at',
            'voting_visible_tallies' => 'required|boolean',
            'voting_instructions' => 'nullable|string|max:2000',
            'banner' => 'nullable|image|max:3072',
        ]);

        if ($request->hasFile('banner')) {
            $path = $request->file('banner')->store('voting_banners', 'public');
            $validated['voting_banner'] = '/storage/'.$path;
        }
        unset($validated['banner']);

        $event->update($validated);

        return back()->with('success', 'Competition details updated successfully.');
    }

    /**
     * Delete competition and associated voting data.
     */
    public function destroy(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeEvent($request, $event);

        $event->delete();

        return redirect()->route('voting.portal.index')
            ->with('success', 'Voting competition deleted successfully.');
    }
}
