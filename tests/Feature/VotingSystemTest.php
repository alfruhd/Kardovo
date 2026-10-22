<?php

use App\Models\Event;
use App\Models\FinancialTransaction;
use App\Models\PaymentLedgerEntry;
use App\Models\User;
use App\Models\VoteOrder;
use App\Models\VotingCandidate;
use App\Models\VotingCategory;
use App\Services\AzampayService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->organizer = User::factory()->create([
        'role' => 'customer',
    ]);

    $this->otherUser = User::factory()->create([
        'role' => 'customer',
    ]);

    $this->event = Event::create([
        'user_id' => $this->organizer->id,
        'title' => 'Tanzania Fashion Gala 2026',
        'event_type' => 'Awards',
        'event_date' => now()->addDays(20)->toDateString(),
        'venue' => 'Mlimani City Conference Centre',
        'city' => 'Dar es Salaam',
        'status' => 'published',
        'is_public' => true,
        'voting_enabled' => true,
        'voting_visible_tallies' => true,
    ]);
});

test('organizer can update voting settings', function () {
    $this->actingAs($this->organizer)
        ->post(route('events.votingSettings', $this->event->id), [
            'voting_enabled' => true,
            'voting_visible_tallies' => false,
            'voting_instructions' => 'Vote for your favorite designer once per phone number.',
        ])
        ->assertRedirect();

    $this->event->refresh();
    expect($this->event->voting_enabled)->toBeTrue();
    expect($this->event->voting_visible_tallies)->toBeFalse();
    expect($this->event->voting_instructions)->toBe('Vote for your favorite designer once per phone number.');
});

test('organizer can create, update, and delete voting categories', function () {
    // 1. Create
    $response = $this->actingAs($this->organizer)
        ->post(route('events.votingCategories.store', $this->event->id), [
            'name' => 'Fashion Designer of the Year',
            'description' => 'Top runway creative',
            'is_paid' => true,
            'max_selections' => 1,
            'sort_order' => 1,
        ]);
    $response->assertRedirect();

    $category = VotingCategory::where('event_id', $this->event->id)->first();
    expect($category)->not->toBeNull();
    expect($category->name)->toBe('Fashion Designer of the Year');
    expect($category->is_paid)->toBeTrue();

    // 2. Update
    $this->actingAs($this->organizer)
        ->put(route('events.votingCategories.update', [$this->event->id, $category->id]), [
            'name' => 'Emerging Designer of the Year',
            'is_paid' => false,
            'max_selections' => 1,
        ])
        ->assertRedirect();

    $category->refresh();
    expect($category->name)->toBe('Emerging Designer of the Year');
    expect($category->is_paid)->toBeFalse();

    // 3. Delete
    $this->actingAs($this->organizer)
        ->delete(route('events.votingCategories.destroy', [$this->event->id, $category->id]))
        ->assertRedirect();

    expect(VotingCategory::find($category->id))->toBeNull();
});

test('organizer can add and manage contestants', function () {
    $category = VotingCategory::create([
        'event_id' => $this->event->id,
        'name' => 'Model of the Year',
        'is_paid' => true,
        'sort_order' => 0,
        'status' => 'active',
    ]);

    // Store candidate
    $this->actingAs($this->organizer)
        ->post(route('events.votingCandidates.store', [$this->event->id, $category->id]), [
            'name' => 'Aisha Mwangi',
            'candidate_number' => '07',
            'bio' => 'International runway model.',
        ])
        ->assertRedirect();

    $candidate = VotingCandidate::where('voting_category_id', $category->id)->first();
    expect($candidate)->not->toBeNull();
    expect($candidate->name)->toBe('Aisha Mwangi');
    expect($candidate->candidate_number)->toBe('07');

    // Update candidate
    $this->actingAs($this->organizer)
        ->put(route('events.votingCandidates.update', [$this->event->id, $candidate->id]), [
            'name' => 'Aisha Mwangi (Senior)',
            'candidate_number' => '07',
            'status' => 'active',
        ])
        ->assertRedirect();

    $candidate->refresh();
    expect($candidate->name)->toBe('Aisha Mwangi (Senior)');

    // Delete candidate
    $this->actingAs($this->organizer)
        ->delete(route('events.votingCandidates.destroy', [$this->event->id, $candidate->id]))
        ->assertRedirect();

    expect(VotingCandidate::find($candidate->id))->toBeNull();
});

test('unauthorized user cannot modify other organizers voting entities', function () {
    $category = VotingCategory::create([
        'event_id' => $this->event->id,
        'name' => 'Restricted Category',
        'is_paid' => true,
    ]);

    $this->actingAs($this->otherUser)
        ->post(route('events.votingCategories.store', $this->event->id), [
            'name' => 'Hacked Category',
            'is_paid' => false,
        ])
        ->assertForbidden();

    $this->actingAs($this->otherUser)
        ->delete(route('events.votingCategories.destroy', [$this->event->id, $category->id]))
        ->assertForbidden();
});

test('public visitors can view voting marketplace, event portal, and direct candidate link', function () {
    $category = VotingCategory::create([
        'event_id' => $this->event->id,
        'name' => 'Male Model of the Year',
        'is_paid' => true,
        'status' => 'active',
    ]);

    $candidate = VotingCandidate::create([
        'event_id' => $this->event->id,
        'voting_category_id' => $category->id,
        'candidate_number' => '01',
        'name' => 'Baraka Juma',
        'status' => 'active',
    ]);

    // 1. Marketplace
    $this->get(route('voting.index'))
        ->assertOk()
        ->assertSee('Tanzania Fashion Gala 2026');

    // 2. Event Voting Portal
    $this->get(route('events.publicVoting', $this->event->id))
        ->assertOk()
        ->assertSee('Male Model of the Year')
        ->assertSee('Baraka Juma');

    // 3. Direct Nominee Link
    $this->get(route('voting.candidateDirect', [$this->event->id, $candidate->id]))
        ->assertOk()
        ->assertSee('Baraka Juma')
        ->assertSee('01');
});

test('free vote casting records vote immediately', function () {
    $category = VotingCategory::create([
        'event_id' => $this->event->id,
        'name' => 'People Choice Free',
        'is_paid' => false,
        'status' => 'active',
    ]);

    $candidate = VotingCandidate::create([
        'event_id' => $this->event->id,
        'voting_category_id' => $category->id,
        'candidate_number' => '02',
        'name' => 'Sarah Connor',
        'total_votes' => 0,
        'status' => 'active',
    ]);

    $response = $this->postJson(route('voting.checkout', $this->event->id), [
        'category_id' => $category->id,
        'candidate_id' => $candidate->id,
        'quantity' => 1,
        'voter_phone' => '0712345678',
        'voter_name' => 'John Fan',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'is_free' => true,
        ]);

    $candidate->refresh();
    expect($candidate->total_votes)->toBe(1);

    $order = VoteOrder::where('voting_candidate_id', $candidate->id)->first();
    expect($order)->not->toBeNull();
    expect($order->status)->toBe('completed');
    expect($order->is_free)->toBeTrue();
});

test('paid vote triggers checkout and azampay webhook marks order completed and increments candidate tallies', function () {
    $category = VotingCategory::create([
        'event_id' => $this->event->id,
        'name' => 'Best Vocalist',
        'is_paid' => true,
        'pricing_tiers' => [
            ['quantity' => 15, 'amount' => 5000],
        ],
        'status' => 'active',
    ]);

    $candidate = VotingCandidate::create([
        'event_id' => $this->event->id,
        'voting_category_id' => $category->id,
        'candidate_number' => '03',
        'name' => 'Diamond Singer',
        'total_votes' => 10,
        'revenue_collected' => 3000.00,
        'status' => 'active',
    ]);

    // Mock AzampayService
    $mockAzampay = Mockery::mock(AzampayService::class);
    $mockAzampay->shouldReceive('mnCheckout')
        ->once()
        ->andReturn([
            'success' => true,
            'message' => 'Payment push sent successfully',
        ]);
    $this->app->instance(AzampayService::class, $mockAzampay);

    $checkoutRes = $this->postJson(route('voting.checkout', $this->event->id), [
        'category_id' => $category->id,
        'candidate_id' => $candidate->id,
        'quantity' => 15,
        'voter_phone' => '0754112233',
        'voter_name' => 'Supporter One',
        'provider' => 'Mpesa',
    ]);

    $checkoutRes->assertOk()
        ->assertJson([
            'success' => true,
            'amount' => 5000,
            'is_free' => false,
        ]);

    $orderNumber = $checkoutRes->json('order_number');
    $order = VoteOrder::where('order_number', $orderNumber)->first();
    expect($order)->not->toBeNull();
    expect($order->status)->toBe('pending');
    expect($order->quantity)->toBe(15);
    expect((float) $order->amount)->toBe(5000.0);

    // Now simulate AzamPay Webhook callback confirming this order
    $webhookRes = $this->postJson(route('webhooks.azampay'), [
        'transactionid' => 'AZAM-TX-998877',
        'externalId' => $orderNumber,
        'mnoReference' => 'MPESA-REF-12345',
        'message' => 'Payment completed successfully',
    ]);

    $webhookRes->assertOk();

    $order->refresh();
    expect($order->status)->toBe('completed');
    expect($order->payment_reference)->toBe('AZAM-TX-998877');

    $candidate->refresh();
    expect($candidate->total_votes)->toBe(25); // 10 + 15
    expect((float) $candidate->revenue_collected)->toBe(8000.00); // 3000 + 5000
});

test('organizer can export audit csv of all votes', function () {
    $category = VotingCategory::create([
        'event_id' => $this->event->id,
        'name' => 'Category Audit',
        'is_paid' => true,
    ]);

    $candidate = VotingCandidate::create([
        'event_id' => $this->event->id,
        'voting_category_id' => $category->id,
        'candidate_number' => '99',
        'name' => 'Audit Candidate',
    ]);

    VoteOrder::create([
        'order_number' => 'VOTE-TEST999',
        'event_id' => $this->event->id,
        'voting_category_id' => $category->id,
        'voting_candidate_id' => $candidate->id,
        'voter_phone' => '255712000000',
        'voter_name' => 'Audit Voter',
        'quantity' => 10,
        'amount' => 3500,
        'currency' => 'TZS',
        'provider' => 'Tigo',
        'status' => 'completed',
        'paid_at' => now(),
    ]);

    $response = $this->actingAs($this->organizer)
        ->get(route('events.voting.exportCsv', $this->event->id));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('text/csv');
});

test('organizer can view independent voting portal and launch standalone competition', function () {
    $this->actingAs($this->organizer)
        ->get(route('voting.portal.index'))
        ->assertOk();

    $response = $this->actingAs($this->organizer)
        ->post(route('voting.portal.store'), [
            'title' => 'Miss Universe Tanzania 2026',
            'event_type' => 'Beauty Pageant',
            'city' => 'Arusha',
            'voting_visible_tallies' => true,
            'description' => 'Official national beauty pageant voting.',
        ]);

    $competition = Event::where('title', 'Miss Universe Tanzania 2026')->first();
    expect($competition)->not->toBeNull();
    expect($competition->voting_enabled)->toBeTrue();
    expect($competition->user_id)->toBe($this->organizer->id);

    $response->assertRedirect(route('voting.portal.show', $competition->id));

    $this->actingAs($this->organizer)
        ->get(route('voting.portal.show', $competition->id))
        ->assertOk();
});

test('organizer can update and delete competition in voting portal', function () {
    $this->actingAs($this->organizer)
        ->put(route('voting.portal.update', $this->event->id), [
            'title' => 'Tanzania Fashion Gala (Updated Edition)',
            'event_type' => 'Fashion & Modeling Awards',
            'voting_enabled' => true,
            'voting_visible_tallies' => false,
        ])
        ->assertRedirect();

    $this->event->refresh();
    expect($this->event->title)->toBe('Tanzania Fashion Gala (Updated Edition)');
    expect($this->event->voting_visible_tallies)->toBeFalse();

    $deleteRes = $this->actingAs($this->organizer)
        ->delete(route('voting.portal.destroy', $this->event->id));

    $deleteRes->assertRedirect(route('voting.portal.index'));
    expect(Event::find($this->event->id))->toBeNull();
});

test('public voting marketplace renders successfully with uniform layout', function () {
    $this->get(route('voting.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/VotingMarketplace')
            ->has('ongoingCompetitions')
            ->has('pastCompetitions')
        );
});

test('public voting how-it-works renders successfully', function () {
    $this->get(route('voting.how-it-works'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/VotingHowItWorks')
        );
});

test('voting terms and policy routes render terms page with voting tab', function () {
    $this->get(route('voting.terms'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Legal/TermsAndConditions')
            ->where('initialTab', 'voting')
        );

    $this->get(route('voting.policy'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Legal/TermsAndConditions')
            ->where('initialTab', 'voting')
        );
});

test('card payment voting checkout completes immediately and increments tallies', function () {
    $category = VotingCategory::create([
        'event_id' => $this->event->id,
        'name' => 'International Model',
        'is_paid' => true,
        'pricing_tiers' => [
            ['quantity' => 15, 'amount' => 5000],
        ],
        'status' => 'active',
    ]);

    $candidate = VotingCandidate::create([
        'event_id' => $this->event->id,
        'voting_category_id' => $category->id,
        'candidate_number' => '99',
        'name' => 'Zara Global',
        'total_votes' => 0,
        'revenue_collected' => 0.00,
        'status' => 'active',
    ]);

    $mockAzampay = Mockery::mock(AzampayService::class);
    $mockAzampay->shouldReceive('cardCheckout')
        ->once()
        ->andReturn([
            'success' => true,
            'is_direct' => true,
            'message' => 'Card payment authorized successfully.',
        ]);
    $this->app->instance(AzampayService::class, $mockAzampay);

    $response = $this->postJson(route('voting.checkout', $this->event->id), [
        'category_id' => $category->id,
        'candidate_id' => $candidate->id,
        'quantity' => 15,
        'voter_name' => 'Diaspora Supporter',
        'provider' => 'Card',
        'card_number' => '4000 1234 5678 9010',
        'card_expiry' => '12/28',
        'card_cvv' => '123',
        'voter_email' => 'diaspora@example.com',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'is_card' => true,
            'status' => 'completed',
        ]);

    $candidate->refresh();
    expect($candidate->total_votes)->toBe(15);
    expect((float) $candidate->revenue_collected)->toBe(5000.00);

    $order = VoteOrder::where('voting_candidate_id', $candidate->id)->first();
    expect($order)->not->toBeNull();
    expect($order->provider)->toBe('Card');
    expect($order->status)->toBe('completed');
    expect($order->paid_at)->not->toBeNull();
    expect((float) $order->platform_fee_percent)->toBe(6.00);
    expect((float) $order->platform_fee)->toBe(300.00);
    expect((float) $order->organizer_net_amount)->toBe(4700.00);

    // Verify FinancialTransaction created
    $transaction = FinancialTransaction::where('category', 'vote_sales')
        ->where('event_id', $this->event->id)
        ->first();
    expect($transaction)->not->toBeNull();
    expect((float) $transaction->amount)->toBe(5000.00);
    expect($transaction->type)->toBe('income');
    expect($order->financial_transaction_id)->toBe($transaction->id);

    // Verify PaymentLedgerEntry appended
    $ledgerEntry = PaymentLedgerEntry::where('financial_transaction_id', $transaction->id)->first();
    expect($ledgerEntry)->not->toBeNull();
    expect($ledgerEntry->state)->toBe(PaymentLedgerEntry::STATE_CAPTURED);
});

test('organizer can record manual offline vote with 6% platform fee deduction and sync to financial ledger', function () {
    $category = VotingCategory::create([
        'event_id' => $this->event->id,
        'name' => 'Male Model of the Year',
        'is_paid' => true,
        'pricing_tiers' => [
            ['quantity' => 10, 'amount' => 10000],
        ],
        'status' => 'active',
    ]);

    $candidate = VotingCandidate::create([
        'event_id' => $this->event->id,
        'voting_category_id' => $category->id,
        'candidate_number' => '101',
        'name' => 'Baraka John',
        'total_votes' => 0,
        'revenue_collected' => 0.00,
        'status' => 'active',
    ]);

    $response = $this->actingAs($this->organizer)
        ->post(route('events.voting.manualVote', $this->event->id), [
            'voting_category_id' => $category->id,
            'voting_candidate_id' => $candidate->id,
            'quantity' => 20,
            'amount' => 20000,
            'payment_method' => 'Cash',
            'voter_name' => 'Mama Baraka',
            'voter_phone' => '0754112233',
            'notes' => 'Direct cash payment at rehearsal booth',
            'record_financial_transaction' => true,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $candidate->refresh();
    expect($candidate->total_votes)->toBe(20);
    expect((float) $candidate->revenue_collected)->toBe(20000.00);

    $order = VoteOrder::where('voting_candidate_id', $candidate->id)->first();
    expect($order)->not->toBeNull();
    expect($order->quantity)->toBe(20);
    expect((float) $order->amount)->toBe(20000.00);
    expect((float) $order->platform_fee)->toBe(1200.00); // 6% of 20,000 = 1,200
    expect((float) $order->organizer_net_amount)->toBe(18800.00); // 94% of 20,000 = 18,800
    expect($order->provider)->toBe('Cash');
    expect($order->status)->toBe('completed');

    // Verify FinancialTransaction
    $transaction = FinancialTransaction::where('category', 'vote_sales')
        ->where('event_id', $this->event->id)
        ->latest('id')
        ->first();
    expect($transaction)->not->toBeNull();
    expect((float) $transaction->amount)->toBe(20000.00);
    expect($transaction->payment_method)->toBe('Cash');
});

test('admin dashboard exposes awards and voting metrics and vote orders feed', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $category = VotingCategory::create([
        'event_id' => $this->event->id,
        'name' => 'Designer Award',
        'is_paid' => true,
        'status' => 'active',
    ]);

    $candidate = VotingCandidate::create([
        'event_id' => $this->event->id,
        'voting_category_id' => $category->id,
        'candidate_number' => '55',
        'name' => 'Ester Fashion',
        'total_votes' => 50,
        'revenue_collected' => 25000.00,
        'status' => 'active',
    ]);

    VoteOrder::create([
        'order_number' => 'VO-ADM-1',
        'event_id' => $this->event->id,
        'voting_category_id' => $category->id,
        'voting_candidate_id' => $candidate->id,
        'voter_phone' => '0754111222',
        'voter_name' => 'Admin Test Voter',
        'quantity' => 50,
        'amount' => 25000,
        'platform_fee' => 1500,
        'platform_fee_percent' => 6.00,
        'organizer_net_amount' => 23500,
        'currency' => 'TZS',
        'provider' => 'AzamPay',
        'status' => 'completed',
        'paid_at' => now(),
        'is_free' => false,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('votingStats')
            ->where('votingStats.gross_revenue', 25000)
            ->where('votingStats.platform_fees', 1500)
            ->where('votingStats.organizer_net', 23500)
            ->has('recentCompetitions')
            ->has('recentVoteOrders')
        );
});

test('organizer voting portal computes gross, 6% fee, and net payout in stats', function () {
    $category = VotingCategory::create([
        'event_id' => $this->event->id,
        'name' => 'Music Video of the Year',
        'is_paid' => true,
        'status' => 'active',
    ]);

    $candidate = VotingCandidate::create([
        'event_id' => $this->event->id,
        'voting_category_id' => $category->id,
        'candidate_number' => '12',
        'name' => 'Diamond Star',
        'total_votes' => 100,
        'revenue_collected' => 50000.00,
        'status' => 'active',
    ]);

    $this->actingAs($this->organizer)
        ->get(route('voting.portal.show', $this->event->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Organizer/Voting/Show')
            ->has('votingStats')
            ->where('votingStats.gross_revenue', 50000)
            ->where('votingStats.platform_fee', 3000)
            ->where('votingStats.platform_fee_percent', fn ($val) => (float) $val == 6.0)
            ->where('votingStats.net_revenue', 47000)
            ->has('voteOrders')
        );
});

test('default permissions include can_access_voting as true', function () {
    $defaults = User::defaultPermissions();
    expect($defaults)->toHaveKey('can_access_voting');
    expect($defaults['can_access_voting'])->toBeTrue();

    $user = User::factory()->create();
    expect($user->canAccessVoting())->toBeTrue();
});

test('organizer with can_access_voting disabled is restricted from voting portal', function () {
    $restrictedOrganizer = User::factory()->create([
        'role' => 'customer',
        'permissions' => array_merge(User::defaultPermissions(), [
            'can_access_voting' => false,
        ]),
    ]);

    $this->actingAs($restrictedOrganizer)
        ->get(route('voting.portal.index'))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHas('error');

    $this->actingAs($restrictedOrganizer)
        ->post(route('voting.portal.store'), [
            'title' => 'Illegal Competition',
            'event_type' => 'Awards',
            'voting_visible_tallies' => true,
        ])
        ->assertRedirect(route('dashboard'))
        ->assertSessionHas('error');
});

test('public voting marketplace can be rendered with all expected props', function () {
    $this->get(route('voting.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/VotingMarketplace')
            ->has('ongoingCompetitions')
            ->has('pastCompetitions')
            ->has('featuredCompetitions')
            ->has('events')
            ->has('filters')
        );
});

test('public voting how-it-works page can be rendered', function () {
    $this->get(route('voting.how-it-works'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/VotingHowItWorks')
        );
});
