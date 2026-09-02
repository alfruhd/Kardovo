<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('password can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/profile')
        ->put('/password', [
            'current_password' => 'password',
            'password' => 'NewSecureP@ss123!',
            'password_confirmation' => 'NewSecureP@ss123!',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $this->assertTrue(Hash::check('NewSecureP@ss123!', $user->refresh()->password));
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/profile')
        ->put('/password', [
            'current_password' => 'wrong-password',
            'password' => 'NewSecureP@ss123!',
            'password_confirmation' => 'NewSecureP@ss123!',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect('/profile');
});

test('weak passwords without numbers or symbols or mixed case are rejected', function () {
    $user = User::factory()->create();

    // Only lowercase letters
    $response = $this
        ->actingAs($user)
        ->from('/profile')
        ->put('/password', [
            'current_password' => 'password',
            'password' => 'simplepassword',
            'password_confirmation' => 'simplepassword',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/profile');

    // Only numbers and letters without symbols
    $response2 = $this
        ->actingAs($user)
        ->from('/profile')
        ->put('/password', [
            'current_password' => 'password',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

    $response2
        ->assertSessionHasErrors('password')
        ->assertRedirect('/profile');
});
