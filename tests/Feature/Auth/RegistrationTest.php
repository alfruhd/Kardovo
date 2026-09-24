<?php

use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register with strong password', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'SecureP@ss123!',
        'password_confirmation' => 'SecureP@ss123!',
    ]);

    $response->assertRedirect(route('two-factor.index', absolute: false));
});

test('weak password is rejected during registration', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test2@example.com',
        'password' => 'weak',
        'password_confirmation' => 'weak',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('password');
});

test('new registered user has zero message quotas by default and cannot send messages', function () {
    $response = $this->post('/register', [
        'name' => 'Zero Quota User',
        'email' => 'zeroquota@example.com',
        'password' => 'SecureP@ss123!',
        'password_confirmation' => 'SecureP@ss123!',
    ]);

    $response->assertRedirect(route('two-factor.index', absolute: false));

    $user = User::where('email', 'zeroquota@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->max_whatsapp_limit)->toBe(0);
    expect($user->max_sms_limit)->toBe(0);
    expect($user->canSendWhatsApp())->toBeFalse();
    expect($user->canSendSms())->toBeFalse();

    $stats = $user->getMessageQuotaStats();
    expect($stats['whatsapp_limit'])->toBe(0);
    expect($stats['whatsapp_remaining'])->toBe(0);
    expect($stats['sms_limit'])->toBe(0);
    expect($stats['sms_remaining'])->toBe(0);
});
