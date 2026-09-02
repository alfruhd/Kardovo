<?php

use App\Models\User;

test('users with 2fa enabled are redirected to otp verification screen on login', function () {
    $user = User::factory()->create([
        'two_factor_enabled' => true,
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('two-factor.index'));
    $this->assertTrue(session()->has('auth.2fa_user_id'));
    $this->assertEquals($user->id, session()->get('auth.2fa_user_id'));
});

test('users can verify 2fa otp code and complete login', function () {
    $user = User::factory()->create([
        'two_factor_enabled' => true,
    ]);

    $code = $user->generateTwoFactorCode();

    $response = $this->withSession([
        'auth.2fa_user_id' => $user->id,
    ])->post('/verify-otp', [
        'code' => $code,
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('dashboard'));
    $this->assertNull($user->refresh()->two_factor_code);
});

test('invalid 2fa otp code is rejected', function () {
    $user = User::factory()->create([
        'two_factor_enabled' => true,
    ]);

    $user->generateTwoFactorCode();

    $response = $this->withSession([
        'auth.2fa_user_id' => $user->id,
    ])->post('/verify-otp', [
        'code' => '000000',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('code');
});

test('expired 2fa otp code is rejected', function () {
    $user = User::factory()->create([
        'two_factor_enabled' => true,
    ]);

    $code = $user->generateTwoFactorCode();
    $user->forceFill(['two_factor_expires_at' => now()->subMinutes(1)])->save();

    $response = $this->withSession([
        'auth.2fa_user_id' => $user->id,
    ])->post('/verify-otp', [
        'code' => $code,
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('code');
});

test('login with verify_via_sms dispatches sms otp and redirects to verification screen', function () {
    $user = User::factory()->create([
        'phone' => '+255 712 345 678',
        'two_factor_enabled' => false,
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
        'verify_via_sms' => true,
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('two-factor.index'));
    $this->assertTrue(session()->has('auth.2fa_user_id'));
    $this->assertTrue(session()->has('auth.2fa_sms_info'));
    $smsInfo = session()->get('auth.2fa_sms_info');
    $this->assertEquals('sms', $smsInfo['channel']);
    $this->assertStringContainsString('255712345678', $smsInfo['clean_phone']);
});

test('instant test sms login dispatches sms code and initiates otp session', function () {
    $user = User::factory()->create([
        'email' => 'sms_test_user@kardovo.com',
        'phone' => '+255 789 123 456',
    ]);

    $response = $this->post('/test-sms-login', [
        'email' => 'sms_test_user@kardovo.com',
        'phone' => '+255 789 123 456',
    ]);

    $response->assertRedirect(route('two-factor.index'));
    $this->assertTrue(session()->has('auth.2fa_user_id'));
    $this->assertTrue(session()->has('auth.2fa_dev_code'));
    $this->assertTrue(session()->has('auth.2fa_sms_info'));
});
