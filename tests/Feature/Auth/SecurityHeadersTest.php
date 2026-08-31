<?php

use App\Models\User;

test('security headers are present on web responses to prevent back-button caching', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->toContain('no-cache')
        ->toContain('no-store')
        ->toContain('must-revalidate');
    $response->assertHeader('Pragma', 'no-cache');
});

test('logout invalidates session and attaches no-cache headers', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/login');
    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->toContain('no-cache')
        ->toContain('no-store')
        ->toContain('must-revalidate');
});
