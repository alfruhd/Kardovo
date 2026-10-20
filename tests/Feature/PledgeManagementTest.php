<?php

use App\Models\Event;
use App\Models\Guest;
use App\Models\PledgePayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();
});

test('organizer can update pledge campaign settings', function () {
    $organizer = User::where('role', 'customer')->first();
    $event = Event::where('user_id', $organizer->id)->first() ?? Event::factory()->create(['user_id' => $organizer->id]);

    $response = $this->actingAs($organizer)->post(route('pledges.settings', $event->id), [
        'pledge_target' => 15000000,
        'pledge_currency' => 'TZS',
        'pledges_enabled' => true,
        'pledge_deadline' => '2026-12-31',
        'pledge_settings' => [
            'lipa_number' => '5432100',
            'bank_name' => 'CRDB Bank',
            'account_number' => '0150123456789',
            'account_name' => 'Wedding Committee',
            'instructions' => 'Please use your name as payment reference',
        ],
    ]);

    $response->assertRedirect();
    $event->refresh();

    expect((float) $event->pledge_target)->toBe(15000000.0)
        ->and($event->pledge_currency)->toBe('TZS')
        ->and($event->pledges_enabled)->toBeTrue()
        ->and($event->pledge_settings['lipa_number'])->toBe('5432100')
        ->and($event->pledge_settings['bank_name'])->toBe('CRDB Bank');
});

test('organizer can register a new contributor with pledge and initial installment', function () {
    $organizer = User::where('role', 'customer')->first();
    $event = Event::where('user_id', $organizer->id)->first() ?? Event::factory()->create(['user_id' => $organizer->id]);

    $response = $this->actingAs($organizer)->post(route('pledges.store', $event->id), [
        'name' => 'Baraka Juma',
        'phone' => '0712345678',
        'category' => 'Committee',
        'pledge_amount' => 200000,
        'initial_paid' => 50000,
        'payment_method' => 'mpesa',
        'reference' => 'QWE123RTY',
        'notes' => 'First installment',
    ]);

    $response->assertRedirect();

    $guest = Guest::where('event_id', $event->id)->where('name', 'Baraka Juma')->first();
    expect($guest)->not->toBeNull()
        ->and((float) $guest->pledge_amount)->toBe(200000.0)
        ->and((float) $guest->paid_amount)->toBe(50000.0)
        ->and($guest->pledge_status)->toBe('partial')
        ->and($guest->pledge_balance)->toBe(150000.0);

    $this->assertDatabaseHas('pledge_payments', [
        'event_id' => $event->id,
        'guest_id' => $guest->id,
        'amount' => 50000,
        'payment_method' => 'mpesa',
        'reference' => 'QWE123RTY',
    ]);
});

test('organizer can record installments and track status transition to completed', function () {
    $organizer = User::where('role', 'customer')->first();
    $event = Event::where('user_id', $organizer->id)->first() ?? Event::factory()->create(['user_id' => $organizer->id]);

    $guest = Guest::create([
        'event_id' => $event->id,
        'name' => 'Neema Mbwana',
        'phone' => '0788112233',
        'pledge_amount' => 100000,
        'paid_amount' => 0,
        'pledge_status' => 'pledged',
    ]);

    // First installment: 40,000
    $this->actingAs($organizer)->post(route('pledges.recordPayment', [$event->id, $guest->id]), [
        'amount' => 40000,
        'payment_method' => 'airtel',
        'reference' => 'AIRTEL778',
        'payment_date' => '2026-10-16',
    ]);

    $guest->refresh();
    expect((float) $guest->paid_amount)->toBe(40000.0)
        ->and($guest->pledge_status)->toBe('partial')
        ->and($guest->pledge_balance)->toBe(60000.0);

    // Second installment: 60,000 (completes the pledge)
    $this->actingAs($organizer)->post(route('pledges.recordPayment', [$event->id, $guest->id]), [
        'amount' => 60000,
        'payment_method' => 'mpesa',
        'reference' => 'MPESA991',
        'payment_date' => '2026-10-16',
    ]);

    $guest->refresh();
    expect((float) $guest->paid_amount)->toBe(100000.0)
        ->and($guest->pledge_status)->toBe('completed')
        ->and($guest->pledge_balance)->toBe(0.0);

    // Verify event stats
    $stats = $event->getPledgeStats();
    expect($stats['total_collected'])->toBe(100000.0)
        ->and($stats['completed_count'])->toBe(1);
});

test('deleting an installment rolls back the guest balance and event stats', function () {
    $organizer = User::where('role', 'customer')->first();
    $event = Event::where('user_id', $organizer->id)->first() ?? Event::factory()->create(['user_id' => $organizer->id]);

    $guest = Guest::create([
        'event_id' => $event->id,
        'name' => 'Rollback Contributor',
        'phone' => '0788990011',
        'pledge_amount' => 100000,
    ]);

    $payment1 = PledgePayment::create([
        'event_id' => $event->id,
        'guest_id' => $guest->id,
        'user_id' => $organizer->id,
        'amount' => 50000,
        'payment_method' => 'cash',
        'payment_date' => '2026-10-15',
    ]);

    $payment2 = PledgePayment::create([
        'event_id' => $event->id,
        'guest_id' => $guest->id,
        'user_id' => $organizer->id,
        'amount' => 50000,
        'payment_method' => 'mpesa',
        'payment_date' => '2026-10-16',
    ]);

    $guest->refresh();
    expect((float) $guest->paid_amount)->toBe(100000.0)
        ->and($guest->pledge_status)->toBe('completed');

    // Delete payment2
    $response = $this->actingAs($organizer)->delete(route('pledges.deletePayment', [$event->id, $payment2->id]));
    $response->assertRedirect();

    $guest->refresh();
    expect((float) $guest->paid_amount)->toBe(50000.0)
        ->and($guest->pledge_status)->toBe('partial')
        ->and($guest->pledge_balance)->toBe(50000.0);

    $this->assertDatabaseMissing('pledge_payments', ['id' => $payment2->id]);
});

test('organizer can export pledges CSV ledger', function () {
    $organizer = User::where('role', 'customer')->first();
    $event = Event::where('user_id', $organizer->id)->first() ?? Event::factory()->create(['user_id' => $organizer->id]);

    Guest::create([
        'event_id' => $event->id,
        'name' => 'Ledger Contributor',
        'phone' => '0755667788',
        'pledge_amount' => 250000,
        'paid_amount' => 100000,
        'pledge_status' => 'partial',
    ]);

    $response = $this->actingAs($organizer)->get(route('pledges.exportCsv', $event->id));

    $response->assertStatus(200);
    $response->assertHeader('Content-Disposition');
    expect($response->streamedContent())->toContain('Ledger Contributor')
        ->toContain('250000')
        ->toContain('100000');
});

test('organizer can export pledges CSV ledger including unpledged attendees', function () {
    $organizer = User::where('role', 'customer')->first();
    $event = Event::where('user_id', $organizer->id)->first() ?? Event::factory()->create(['user_id' => $organizer->id]);

    Guest::create([
        'event_id' => $event->id,
        'name' => 'Baraka Simba',
        'phone' => '0711223344',
        'pledge_amount' => 0,
        'paid_amount' => 0,
        'pledge_status' => 'none',
    ]);

    $response = $this->actingAs($organizer)->get(route('pledges.exportCsv', $event->id));

    $response->assertStatus(200);
    $response->assertHeader('Content-Disposition');
    expect($response->streamedContent())->toContain('Baraka Simba')
        ->toContain('0.00');
});

test('unauthorized users cannot manage pledges for other organizers events', function () {
    $organizer1 = User::where('role', 'customer')->first();
    $otherUser = User::factory()->create(['role' => 'customer']);
    $event = Event::where('user_id', $organizer1->id)->first() ?? Event::factory()->create(['user_id' => $organizer1->id]);

    $response = $this->actingAs($otherUser)->post(route('pledges.settings', $event->id), [
        'pledge_target' => 5000000,
    ]);

    $response->assertStatus(403);
});

test('organizer can load event dashboard with pledgeStats without errors', function () {
    $organizer = User::where('role', 'customer')->first();
    $event = Event::where('user_id', $organizer->id)->first() ?? Event::factory()->create(['user_id' => $organizer->id]);

    $response = $this->actingAs($organizer)->get(route('events.show', $event->id));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/EventDashboard')
        ->has('pledgeStats')
        ->has('pledgePayments')
    );
});

test('organizer can filter guests by pledge status categories on event dashboard', function () {
    $organizer = User::where('role', 'customer')->first();
    $event = Event::where('user_id', $organizer->id)->first() ?? Event::factory()->create(['user_id' => $organizer->id]);

    Guest::where('event_id', $event->id)->delete();

    Guest::create([
        'event_id' => $event->id,
        'name' => 'Pending Contributor',
        'phone' => '0711111111',
        'pledge_amount' => 100000,
        'paid_amount' => 0,
        'pledge_status' => 'pledged',
    ]);

    Guest::create([
        'event_id' => $event->id,
        'name' => 'Partial Contributor',
        'phone' => '0722222222',
        'pledge_amount' => 100000,
        'paid_amount' => 40000,
        'pledge_status' => 'partial',
    ]);

    Guest::create([
        'event_id' => $event->id,
        'name' => 'Completed Contributor',
        'phone' => '0733333333',
        'pledge_amount' => 100000,
        'paid_amount' => 100000,
        'pledge_status' => 'completed',
    ]);

    // Test completed filter
    $resCompleted = $this->actingAs($organizer)->get(route('events.show', ['event' => $event->id, 'pledge' => 'completed']));
    $resCompleted->assertInertia(fn ($page) => $page
        ->where('guests.data.0.name', 'Completed Contributor')
        ->has('guests.data', 1)
    );

    // Test partial filter
    $resPartial = $this->actingAs($organizer)->get(route('events.show', ['event' => $event->id, 'pledge' => 'partial']));
    $resPartial->assertInertia(fn ($page) => $page
        ->where('guests.data.0.name', 'Partial Contributor')
        ->has('guests.data', 1)
    );

    // Test pending filter
    $resPending = $this->actingAs($organizer)->get(route('events.show', ['event' => $event->id, 'pledge' => 'unpaid']));
    $resPending->assertInertia(fn ($page) => $page
        ->where('guests.data.0.name', 'Pending Contributor')
        ->has('guests.data', 1)
    );
});
