<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

test('reset password link screen can be rendered', function () {
    $response = $this->get('/forgot-password');

    $response->assertStatus(200);
});

test('reset password link can be requested', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('reset password screen can be rendered', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
        $response = $this->get('/reset-password/'.$notification->token);

        $response->assertStatus(200);

        return true;
    });
});

test('password can be reset with valid token', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $response = $this->post('/reset-password', [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'SecureP@ss123!',
            'password_confirmation' => 'SecureP@ss123!',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        return true;
    });
});

test('login page can be rendered with password reset capability', function () {
    $response = $this->get('/login');
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('Auth/Login')->where('canResetPassword', true));
});

test('user can request password reset with phone number and receive sms code', function () {
    $user = User::factory()->create([
        'phone' => '+255 712 345 678',
        'email' => '255712345678@phone.kardovo.com',
    ]);

    $response = $this->post('/forgot-password', [
        'email' => '0712345678',
        'delivery_method' => 'sms',
    ]);

    $response->assertRedirect(route('password.reset'));
    $response->assertSessionHas('status');

    $record = DB::table('password_reset_tokens')
        ->where('email', $user->email)
        ->first();
    expect($record)->not->toBeNull();

    $devCode = session('password_reset_dev_code');
    expect($devCode)->not->toBeNull();
    expect(strlen($devCode))->toBe(6);

    // Reset password using the 6-digit code
    $resetResponse = $this->post('/reset-password', [
        'email' => '0712345678',
        'token' => $devCode,
        'password' => 'NewSecur3P@ssw0rd!',
        'password_confirmation' => 'NewSecur3P@ssw0rd!',
    ]);

    $resetResponse->assertSessionHasNoErrors();
    $resetResponse->assertRedirect(route('login'));

    // Check user can log in with new password
    $loginResponse = $this->post('/login', [
        'email' => '0712345678',
        'password' => 'NewSecur3P@ssw0rd!',
    ]);
    $loginResponse->assertRedirect();
});

test('user with both email and phone can choose email preference', function () {
    Notification::fake();

    $user = User::factory()->create([
        'email' => 'bothchannels@example.com',
        'phone' => '+255 799 112 233',
    ]);

    $response = $this->post('/forgot-password', [
        'email' => 'bothchannels@example.com',
        'delivery_method' => 'email',
    ]);

    $response->assertRedirect(route('password.reset'));
    Notification::assertSentTo($user, ResetPassword::class);
});

test('invalid reset code is rejected', function () {
    $user = User::factory()->create();

    $this->post('/forgot-password', ['email' => $user->email]);

    $response = $this->post('/reset-password', [
        'email' => $user->email,
        'token' => '999999', // Wrong code
        'password' => 'NewSecur3P@ssw0rd!',
        'password_confirmation' => 'NewSecur3P@ssw0rd!',
    ]);

    $response->assertSessionHasErrors('token');
});
