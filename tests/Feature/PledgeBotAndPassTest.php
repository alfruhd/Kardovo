<?php

use App\Models\Event;
use App\Models\Guest;
use App\Models\Message;
use App\Models\PledgePayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed();

    $this->user = User::where('role', 'customer')->first() ?? User::factory()->create([
        'role' => 'customer',
    ]);
    $this->user->update([
        'has_payment_override' => true,
        'max_whatsapp_limit' => 1000,
        'max_sms_limit' => 1000,
    ]);

    $this->event = Event::create([
        'user_id' => $this->user->id,
        'title' => 'Baraka & Neema Wedding',
        'event_date' => '2026-11-20',
        'event_time' => '16:00',
        'venue' => 'Mbezi Beach',
        'city' => 'Dar es Salaam',
        'pledges_enabled' => true,
        'pledge_currency' => 'TZS',
        'pledge_target' => 5000000,
        'pledge_settings' => [
            'lipa_namba' => '5544332',
            'account_name' => 'Baraka & Neema Wedding',
            'bank_name' => 'CRDB Bank',
            'bank_account' => '0150123456700',
        ],
    ]);

    $this->guest = Guest::create([
        'event_id' => $this->event->id,
        'name' => 'Juma Jux',
        'phone' => '+255714001122',
        'qr_token' => 'kdv_token_juma_12345',
        'card_number' => 'KDV-2026-9999',
        'unique_code' => '99991234',
        'pledge_amount' => 0,
        'paid_amount' => 0,
        'pledge_status' => 'unpledged',
    ]);
});

test('guest can commit a pledge via public pass web route', function () {
    $response = $this->post(route('guest.pledge', $this->guest->qr_token), [
        'pledge_amount' => 200000,
        'pledge_notes' => 'Will contribute in two installments',
    ]);

    $response->assertSessionHas('success');

    $this->guest->refresh();
    expect((float) $this->guest->pledge_amount)->toEqual(200000.0)
        ->and($this->guest->pledge_status)->toEqual('pledged')
        ->and((float) $this->guest->pledge_balance)->toEqual(200000.0)
        ->and($this->guest->notes)->toEqual('Will contribute in two installments');
});

test('guest can submit payment proof via public pass web route', function () {
    // Set an initial pledge first
    $this->guest->update([
        'pledge_amount' => 200000,
        'pledge_status' => 'pledged',
    ]);

    $response = $this->post(route('guest.paymentProof', $this->guest->qr_token), [
        'amount' => 50000,
        'reference_number' => '9G28XK911L',
        'payment_method' => 'lipa_namba',
        'notes' => 'Paid via M-Pesa to Lipa Namba',
    ]);

    $response->assertSessionHas('success');

    $this->assertDatabaseHas('pledge_payments', [
        'event_id' => $this->event->id,
        'guest_id' => $this->guest->id,
        'amount' => 50000,
        'reference' => '9G28XK911L',
        'payment_method' => 'lipa_namba',
    ]);

    $this->guest->refresh();
    expect((float) $this->guest->paid_amount)->toEqual(50000.0)
        ->and((float) $this->guest->pledge_balance)->toEqual(150000.0)
        ->and($this->guest->pledge_status)->toEqual('partial');
});

test('submitting duplicate payment reference is prevented', function () {
    $this->guest->update([
        'pledge_amount' => 200000,
    ]);

    // First payment
    $this->post(route('guest.paymentProof', $this->guest->qr_token), [
        'amount' => 50000,
        'reference_number' => 'DUPLICATE99',
    ]);

    // Second payment with same reference
    $secondResponse = $this->post(route('guest.paymentProof', $this->guest->qr_token), [
        'amount' => 50000,
        'reference_number' => 'DUPLICATE99',
    ]);

    $secondResponse->assertSessionHas('error');
    expect(PledgePayment::where('reference', 'DUPLICATE99')->count())->toBe(1);
});

test('inbound WhatsApp or SMS bot parses pledge commitment correctly', function () {
    $payload = [
        'data' => [
            'from' => '255714001122',
            'body' => 'Ahadi 150,000',
        ],
    ];

    $response = $this->postJson('/api/webhooks/whatsapp', $payload);
    $response->assertOk();

    $this->guest->refresh();
    expect((float) $this->guest->pledge_amount)->toEqual(150000.0)
        ->and($this->guest->pledge_status)->toEqual('pledged');

    // Asserts auto-reply was recorded
    $this->assertDatabaseHas('messages', [
        'event_id' => $this->event->id,
        'guest_id' => $this->guest->id,
        'channel' => 'whatsapp',
    ]);
});

test('inbound WhatsApp bot parses pledge commitment with shorthand like 100k', function () {
    $payload = [
        'data' => [
            'from' => '255714001122',
            'body' => 'Pledge 100k',
        ],
    ];

    $response = $this->postJson('/api/webhooks/whatsapp', $payload);
    $response->assertOk();

    $this->guest->refresh();
    expect((float) $this->guest->pledge_amount)->toEqual(100000.0)
        ->and($this->guest->pledge_status)->toEqual('pledged');
});

test('inbound WhatsApp or SMS bot parses forwarded M-Pesa confirmation SMS', function () {
    $this->guest->update([
        'pledge_amount' => 100000,
        'pledge_status' => 'pending',
    ]);

    $mpesaSms = '9G28XK911L Imethibitishwa. Umetuma Tsh 100,000 kwa BARAKA KAJUNA 0754123456 tarehe 16/10/2026 saa 14:32. Salio lako jipya la M-Pesa ni Tsh 45,000.';

    $payload = [
        'from' => '+255714001122',
        'text' => $mpesaSms,
    ];

    $response = $this->postJson('/api/webhooks/sms', $payload);
    $response->assertOk();

    $this->assertDatabaseHas('pledge_payments', [
        'event_id' => $this->event->id,
        'guest_id' => $this->guest->id,
        'amount' => 100000,
        'reference' => '9G28XK911L',
    ]);

    $this->guest->refresh();
    expect((float) $this->guest->paid_amount)->toEqual(100000.0)
        ->and((float) $this->guest->pledge_balance)->toEqual(0.0)
        ->and($this->guest->pledge_status)->toEqual('completed');

    // Asserts receipt message logged
    $this->assertDatabaseHas('messages', [
        'event_id' => $this->event->id,
        'guest_id' => $this->guest->id,
    ]);
});

test('inbound balance inquiry returns status reply', function () {
    $this->guest->update([
        'pledge_amount' => 100000,
        'paid_amount' => 40000,
        'pledge_status' => 'partial',
    ]);

    $payload = [
        'data' => [
            'from' => '255714001122',
            'body' => 'Salio langu',
        ],
    ];

    $response = $this->postJson('/api/webhooks/whatsapp', $payload);
    $response->assertOk();

    $latestMsg = Message::where('guest_id', $this->guest->id)->latest()->first();
    expect($latestMsg)->not->toBeNull()
        ->and($latestMsg->message_body)->toContain('Baraka & Neema Wedding')
        ->and($latestMsg->message_body)->toContain('100,000')
        ->and($latestMsg->message_body)->toContain('40,000')
        ->and($latestMsg->message_body)->toContain('60,000');
});

test('organizer can broadcast pledge_contribution campaign with flexible amounts and payment details', function () {
    $this->actingAs($this->user);

    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'messaging_product' => 'whatsapp',
            'contacts' => [['input' => '255714001122', 'wa_id' => '255714001122']],
            'messages' => [['id' => 'wamid.HBgLMTIzNDU2Nzg5MA==']],
        ], 200),
    ]);

    $response = $this->post(route('messaging.broadcast'), [
        'event_id' => $this->event->id,
        'channel' => 'whatsapp',
        'campaign_type' => 'pledge_contribution',
        'target_filter' => 'all',
    ]);

    $response->assertSessionHas('success');

    $dispatched = Message::where('event_id', $this->event->id)
        ->where('guest_id', $this->guest->id)
        ->latest()
        ->first();

    expect($dispatched)->not->toBeNull()
        ->and($dispatched->channel)->toEqual('whatsapp')
        ->and($dispatched->message_body)->toContain('Baraka & Neema Wedding')
        ->and($dispatched->message_body)->toContain('5544332') // Lipa Namba
        ->and($dispatched->message_body)->toContain('CRDB Bank')
        ->and($dispatched->message_body)->toContain('kiasi chochote'); // Flexible pledge amount instruction
});

test('organizer can target broadcast by unpledged and pending_balance audience filters', function () {
    $this->actingAs($this->user);

    Http::fake([
        'https://graph.facebook.com/*' => Http::response([
            'messaging_product' => 'whatsapp',
            'contacts' => [['input' => '255715998877', 'wa_id' => '255715998877']],
            'messages' => [['id' => 'wamid.HBgLMTIzNDU2Nzg5MQ==']],
        ], 200),
    ]);

    $pledgedGuest = Guest::create([
        'event_id' => $this->event->id,
        'name' => 'Asha Said',
        'phone' => '+255715998877',
        'pledge_amount' => 150000,
        'paid_amount' => 50000,
        'pledge_status' => 'partial',
    ]);

    $fullyPaidGuest = Guest::create([
        'event_id' => $this->event->id,
        'name' => 'Bakari Mussa',
        'phone' => '+255716112233',
        'pledge_amount' => 80000,
        'paid_amount' => 80000,
        'pledge_status' => 'completed',
    ]);

    // 1. Target unpledged only
    $res1 = $this->post(route('messaging.broadcast'), [
        'event_id' => $this->event->id,
        'channel' => 'sms',
        'campaign_type' => 'pledge_contribution',
        'target_filter' => 'unpledged',
    ]);
    $res1->assertSessionHas('success');

    $unpledgedMsg = Message::where('guest_id', $this->guest->id)->where('channel', 'sms')->first();
    $pledgedMsg = Message::where('guest_id', $pledgedGuest->id)->where('channel', 'sms')->first();
    expect($unpledgedMsg)->not->toBeNull()
        ->and($pledgedMsg)->toBeNull();

    // 2. Target pending balance only
    $res2 = $this->post(route('messaging.broadcast'), [
        'event_id' => $this->event->id,
        'channel' => 'whatsapp',
        'campaign_type' => 'pledge_contribution',
        'target_filter' => 'pending_balance',
    ]);
    $res2->assertSessionHas('success');

    $pendingMsg = Message::where('guest_id', $pledgedGuest->id)->where('channel', 'whatsapp')->first();
    $fullMsg = Message::where('guest_id', $fullyPaidGuest->id)->where('channel', 'whatsapp')->first();
    expect($pendingMsg)->not->toBeNull()
        ->and($fullMsg)->toBeNull();
});
