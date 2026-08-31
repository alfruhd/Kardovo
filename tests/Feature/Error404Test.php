<?php

namespace Tests\Feature;

use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class Error404Test extends TestCase
{
    public function test_non_existent_route_renders_custom_404_inertia_page()
    {
        $response = $this->get('/dsdf');
        $response->assertStatus(404);
        $response->assertInertia(fn (Assert $page) => $page->component('Error404'));
    }

    public function test_direct_404_url_renders_custom_404_page()
    {
        $response = $this->get('/404');
        $response->assertStatus(404);
        $response->assertInertia(fn (Assert $page) => $page->component('Error404'));
    }
}
