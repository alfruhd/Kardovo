<?php

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

test('honeypot field blocks automated login submissions before touching user authentication', function () {
    $user = User::factory()->create([
        'email' => 'victim@kardovo.com',
        'password' => bcrypt('CorrectHorseBattery!1'),
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'CorrectHorseBattery!1',
        'website_url' => 'https://spam-bot.example.com',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('form timing trap blocks sub-second automated submissions', function () {
    $user = User::factory()->create([
        'email' => 'fast@kardovo.com',
        'password' => bcrypt('CorrectHorseBattery!1'),
    ]);

    $nowMs = (int) round(microtime(true) * 1000);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'CorrectHorseBattery!1',
        '_form_rendered_at' => $nowMs - 50, // Submitted in 50ms
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('bot hammer on one ip never locks out the real user on a different ip', function () {
    $user = User::factory()->create([
        'email' => 'realuser@kardovo.com',
        'password' => bcrypt('RealPassword!2026'),
        'two_factor_enabled' => false,
    ]);

    // Bot IP hammers the account 6 times with wrong password
    for ($i = 0; $i < 6; $i++) {
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.99'])->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-bot-password',
        ]);
    }

    // Bot IP is now rate-limited even if it somehow guesses the password
    $botAttempt = $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.99'])->post('/login', [
        'email' => $user->email,
        'password' => 'RealPassword!2026',
    ]);
    $botAttempt->assertSessionHasErrors('email');
    $this->assertGuest();

    // Real user on their own IP (198.51.100.12) logs in immediately without being locked out
    $realUserAttempt = $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.12'])->post('/login', [
        'email' => $user->email,
        'password' => 'RealPassword!2026',
    ]);

    $realUserAttempt->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);
});

test('per-ip credential stuffing across many different accounts is blocked after 15 failed attempts', function () {
    $user = User::factory()->create([
        'email' => 'target16@kardovo.com',
        'password' => bcrypt('ValidPass!2026'),
    ]);

    // Single bot IP tries 15 different accounts (1 attempt per account to evade per-email limits)
    for ($i = 1; $i <= 15; $i++) {
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.55'])->post('/login', [
            'email' => "sprayed_user_{$i}@kardovo.com",
            'password' => 'GuessedPassword123!',
        ]);
    }

    // 16th attempt from that same IP is blocked by the global IP velocity bucket
    $response = $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.55'])->post('/login', [
        'email' => $user->email,
        'password' => 'ValidPass!2026',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('distributed multi-ip attack against one account triggers adaptive 2fa for unknown devices while letting trusted device cookie pass', function () {
    $user = User::factory()->create([
        'email' => 'ceo@kardovo.com',
        'password' => bcrypt('ExecutivePass!99'),
        'two_factor_enabled' => false,
    ]);

    // 16 different botnet IPs each make 1 failed attempt against ceo@kardovo.com
    for ($i = 1; $i <= 16; $i++) {
        $this->withServerVariables(['REMOTE_ADDR' => "10.99.0.{$i}"])->post('/login', [
            'email' => $user->email,
            'password' => "bot_guess_{$i}",
        ]);
    }

    // Unrecognized device with the valid password is challenged with 2FA OTP instead of immediate login
    $unknownDeviceLogin = $this->withServerVariables(['REMOTE_ADDR' => '172.16.0.10'])->post('/login', [
        'email' => $user->email,
        'password' => 'ExecutivePass!99',
    ]);

    $unknownDeviceLogin->assertRedirect(route('two-factor.index', absolute: false));
    $this->assertGuest();

    // Recognized device carrying the signed trusted device cookie logs in seamlessly
    $trustedCookieName = 'kdv_trusted_device_'.$user->id;
    $trustedToken = hash_hmac('sha256', $user->id.'|'.$user->email, (string) config('app.key'));

    $trustedDeviceLogin = $this->withServerVariables(['REMOTE_ADDR' => '172.16.0.25'])
        ->withCookie($trustedCookieName, $trustedToken)
        ->post('/login', [
            'email' => $user->email,
            'password' => 'ExecutivePass!99',
        ]);

    $trustedDeviceLogin->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);
});

test('distributed multi-ip attack guessing otp permanently invalidates the code after 5 failures globally', function () {
    $user = User::factory()->create([
        'email' => 'otp-target@kardovo.com',
        'password' => bcrypt('StrongPass123!'),
    ]);

    $realCode = $user->generateTwoFactorCode();

    // 5 different IPs attempt to guess the 6-digit OTP code with wrong guesses
    for ($i = 1; $i <= 5; $i++) {
        $response = $this->withSession(['auth.2fa_user_id' => $user->id])
            ->withServerVariables(['REMOTE_ADDR' => "185.220.101.{$i}"])
            ->post('/verify-otp', [
                'code' => sprintf('%06d', $i * 11111),
            ]);

        $response->assertSessionHasErrors('code');
        $this->assertGuest();
    }

    // Code must now be permanently wiped from the database to stop distributed brute-forcing
    $user->refresh();
    expect($user->two_factor_code)->toBeNull();
    expect($user->two_factor_expires_at)->toBeNull();

    // Even if an attacker now submits the original real code, it is rejected
    $lateAttempt = $this->withSession(['auth.2fa_user_id' => $user->id])
        ->withServerVariables(['REMOTE_ADDR' => '185.220.101.99'])
        ->post('/verify-otp', [
            'code' => $realCode,
        ]);

    $this->assertGuest();
});

test('system-wide failed login spike activates challenge mode for untrusted devices across the entire system', function () {
    $user = User::factory()->create([
        'email' => 'innocent@kardovo.com',
        'password' => bcrypt('CorrectPassword!123'),
        'two_factor_enabled' => false,
    ]);

    // Simulate system under massive bot attack (> 200 global failed attempts in 5 minutes)
    for ($i = 0; $i < 205; $i++) {
        RateLimiter::hit(LoginRequest::globalFailedVelocityKey(), 300);
    }

    expect(LoginRequest::isSystemUnderDistributedAttack())->toBeTrue();

    // An untrusted device is challenged with adaptive 2FA rather than logging straight in
    $untrustedLogin = $this->withServerVariables(['REMOTE_ADDR' => '104.28.1.1'])
        ->post('/login', [
            'email' => $user->email,
            'password' => 'CorrectPassword!123',
        ]);

    $untrustedLogin->assertRedirect(route('two-factor.index', absolute: false));
    $this->assertGuest();

    // Legitimate user on their recognized device (with trusted device cookie) logs straight in
    $trustedCookieName = 'kdv_trusted_device_'.$user->id;
    $trustedToken = hash_hmac('sha256', $user->id.'|'.$user->email, (string) config('app.key'));

    $trustedLogin = $this->withServerVariables(['REMOTE_ADDR' => '104.28.1.2'])
        ->withCookie($trustedCookieName, $trustedToken)
        ->post('/login', [
            'email' => $user->email,
            'password' => 'CorrectPassword!123',
        ]);

    $trustedLogin->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);
});
