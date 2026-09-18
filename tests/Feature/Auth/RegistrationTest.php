<?php

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
