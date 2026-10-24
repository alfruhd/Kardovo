<?php

test('web and api responses include hardening security headers', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
});

test('requests exceeding payload threshold are blocked before execution with HTTP 413', function () {
    // 26 Megabytes in CONTENT_LENGTH header
    $response = $this->call(
        'POST',
        '/login',
        [],
        [],
        [],
        ['CONTENT_LENGTH' => (string) (26 * 1024 * 1024)]
    );

    $response->assertStatus(413);
    $response->assertJson([
        'message' => 'The payload size exceeds the server safety threshold (max 25MB).',
    ]);
});

test('requests within normal payload threshold are processed normally', function () {
    $response = $this->call(
        'GET',
        '/login',
        [],
        [],
        [],
        ['CONTENT_LENGTH' => '1024']
    );

    $response->assertStatus(200);
});
