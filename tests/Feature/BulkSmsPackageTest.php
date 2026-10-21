<?php

use App\Models\FinancialTransaction;
use App\Models\Package;
use App\Models\User;
use App\Services\AzampayService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed standard card packages
    Package::create([
        'name' => 'Basic',
        'package_type' => 'event_card',
        'price' => 1000,
        'description' => '1,000 Tsh per card',
        'features' => ['1 WhatsApp & 1 SMS per card'],
        'is_active' => true,
    ]);

    Package::create([
        'name' => 'Executive',
        'package_type' => 'event_card',
        'price' => 2500,
        'description' => '2,500 Tsh per card',
        'features' => ['1 WhatsApp & 1 SMS per card', 'Custom Event Web Page'],
        'is_active' => true,
    ]);

    // Seed Bulk SMS packages
    Package::create([
        'name' => 'Starter SMS Pack',
        'package_type' => 'bulk_sms',
        'price' => 20000,
        'sms_count' => 500,
        'rate_per_sms' => 40.0,
        'description' => '500 Bulk SMS credits',
        'features' => ['500 SMS Credits', 'Instant Delivery'],
        'is_active' => true,
    ]);

    Package::create([
        'name' => 'Standard SMS Pack',
        'package_type' => 'bulk_sms',
        'price' => 35000,
        'sms_count' => 1000,
        'rate_per_sms' => 35.0,
        'description' => '1,000 Bulk SMS credits',
        'features' => ['1,000 SMS Credits', 'Instant Delivery'],
        'is_active' => true,
    ]);

    Package::create([
        'name' => 'Enterprise SMS Pack',
        'package_type' => 'bulk_sms',
        'price' => 150000,
        'sms_count' => 5000,
        'rate_per_sms' => 30.0,
        'description' => '5,000 Bulk SMS credits',
        'features' => ['5,000 SMS Credits', 'Lowest rate @ 30 TZS'],
        'is_active' => true,
    ]);
});

test('organizer can view pricing page with separated card packages and bulk sms packages even without events', function () {
    $organizer = User::factory()->create([
        'role' => 'customer',
        'max_sms_limit' => 250,
        'max_whatsapp_limit' => 100,
    ]);

    $response = $this->actingAs($organizer)->get(route('organizer.wallet.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Organizer/Payments/Index')
        ->has('packages', 5)
        ->has('cardPackages', 2)
        ->has('bulkSmsPackages', 3)
        ->where('has_event', false)
        ->where('userQuotas.sms_limit', 250)
    );
});

test('organizer can purchase a predefined bulk sms package and receive instant sms quota via webhook', function () {
    $this->mock(AzampayService::class, function ($mock) {
        $mock->shouldReceive('mnCheckout')->andReturn(['success' => true, 'message' => 'USSD sent']);
    });

    $organizer = User::factory()->create([
        'role' => 'customer',
        'max_sms_limit' => 100,
        'max_whatsapp_limit' => 50,
    ]);

    $smsPackage = Package::where('name', 'Standard SMS Pack')->first();

    // Purchase does NOT require guests_count
    $response = $this->actingAs($organizer)->post(route('organizer.pricing.purchase'), [
        'package_id' => $smsPackage->id,
        'provider' => 'Mpesa',
        'mobileNumber' => '0767123456',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $transaction = FinancialTransaction::where('user_id', $organizer->id)
        ->where('category', 'package_purchase')
        ->latest('id')
        ->first();

    expect($transaction)->not->toBeNull();
    expect((float) $transaction->amount)->toBe(35000.0);
    expect($transaction->title)->toContain('1,000 SMS');

    $meta = json_decode($transaction->notes, true);
    expect($meta['package_type'])->toBe('bulk_sms');
    expect($meta['sms_count'])->toBe(1000);
    expect($meta['whatsapp_messages_included'])->toBe(0);

    // Simulate AzamPay webhook confirmation
    $webhookResponse = $this->postJson(route('webhooks.azampay'), [
        'transactionid' => 'AZM-SMS-BUNDLE-01',
        'externalId' => $transaction->transaction_number,
        'mnoReference' => 'MNO-SMS-9911',
        'message' => 'Transaction Completed Successfully',
    ]);

    $webhookResponse->assertStatus(200);

    $organizer->refresh();
    // 100 existing + 1000 new = 1100 SMS limit
    expect($organizer->max_sms_limit)->toBe(1100);
    // WhatsApp limit remains 50
    expect($organizer->max_whatsapp_limit)->toBe(50);
});

test('organizer can purchase custom pay-as-you-go sms credits with volume tier discounts', function () {
    $this->mock(AzampayService::class, function ($mock) {
        $mock->shouldReceive('mnCheckout')->andReturn(['success' => true, 'message' => 'USSD sent']);
    });

    $organizer = User::factory()->create([
        'role' => 'customer',
        'max_sms_limit' => 0,
        'max_whatsapp_limit' => 0,
    ]);

    // Test tier 1: 500 SMS @ 40 TZS = 20,000 TZS
    $responseTier1 = $this->actingAs($organizer)->post(route('organizer.pricing.purchase'), [
        'is_custom_sms' => true,
        'custom_sms_count' => 500,
        'provider' => 'Tigo',
        'mobileNumber' => '0712000000',
    ]);
    $responseTier1->assertSessionHasNoErrors();

    $tx1 = FinancialTransaction::where('user_id', $organizer->id)->latest('id')->first();
    expect((float) $tx1->amount)->toBe(20000.0);

    // Test tier 2: 1,500 SMS @ 35 TZS = 52,500 TZS
    $responseTier2 = $this->actingAs($organizer)->post(route('organizer.pricing.purchase'), [
        'is_custom_sms' => true,
        'custom_sms_count' => 1500,
        'provider' => 'Mpesa',
        'mobileNumber' => '0767000000',
    ]);
    $responseTier2->assertSessionHasNoErrors();

    $tx2 = FinancialTransaction::where('user_id', $organizer->id)->latest('id')->first();
    expect((float) $tx2->amount)->toBe(52500.0);

    // Test tier 3: 5,000 SMS @ 30 TZS = 150,000 TZS
    $responseTier3 = $this->actingAs($organizer)->post(route('organizer.pricing.purchase'), [
        'is_custom_sms' => true,
        'custom_sms_count' => 5000,
        'provider' => 'Airtel',
        'mobileNumber' => '0789000000',
    ]);
    $responseTier3->assertSessionHasNoErrors();

    $tx3 = FinancialTransaction::where('user_id', $organizer->id)->latest('id')->first();
    expect((float) $tx3->amount)->toBe(150000.0);

    // Webhook completes payment for tier 2 (1,500 SMS)
    $this->postJson(route('webhooks.azampay'), [
        'transactionid' => 'AZM-CUSTOM-02',
        'externalId' => $tx2->transaction_number,
        'mnoReference' => 'MNO-CUSTOM-8822',
        'message' => 'Transaction Completed Successfully',
    ])->assertStatus(200);

    $organizer->refresh();
    expect($organizer->max_sms_limit)->toBe(1500);
    expect($organizer->max_whatsapp_limit)->toBe(0);
});

test('custom sms validates minimum of 100 sms credits', function () {
    $organizer = User::factory()->create(['role' => 'customer']);

    $response = $this->actingAs($organizer)->post(route('organizer.pricing.purchase'), [
        'is_custom_sms' => true,
        'custom_sms_count' => 50, // Less than minimum 100
        'provider' => 'Mpesa',
        'mobileNumber' => '0767000000',
    ]);

    $response->assertSessionHasErrors('custom_sms_count');
});

test('existing event card packages still enforce card count and credit both whatsapp and sms', function () {
    $this->mock(AzampayService::class, function ($mock) {
        $mock->shouldReceive('mnCheckout')->andReturn(['success' => true, 'message' => 'USSD sent']);
    });

    $organizer = User::factory()->create([
        'role' => 'customer',
        'max_sms_limit' => 0,
        'max_whatsapp_limit' => 0,
    ]);

    $basicPackage = Package::where('name', 'Basic')->first();

    $response = $this->actingAs($organizer)->post(route('organizer.pricing.purchase'), [
        'package_id' => $basicPackage->id,
        'guests_count' => 150,
        'provider' => 'Mpesa',
        'mobileNumber' => '0767000000',
    ]);

    $response->assertSessionHasNoErrors();

    $tx = FinancialTransaction::where('user_id', $organizer->id)->latest('id')->first();
    expect((float) $tx->amount)->toBe(150000.0); // 1000 * 150

    $this->postJson(route('webhooks.azampay'), [
        'transactionid' => 'AZM-CARD-01',
        'externalId' => $tx->transaction_number,
        'mnoReference' => 'MNO-CARD-1122',
        'message' => 'Transaction Completed Successfully',
    ])->assertStatus(200);

    $organizer->refresh();
    expect($organizer->max_sms_limit)->toBe(150);
    expect($organizer->max_whatsapp_limit)->toBe(150);
});
