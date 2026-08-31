<?php

it('returns a successful response for login', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});
