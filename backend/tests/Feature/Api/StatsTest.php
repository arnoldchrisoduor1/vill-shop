<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('public stats endpoint returns counts', function () {
    $response = $this->getJson('/api/v1/stats');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'data' => ['total_orders', 'total_products', 'total_customers'],
        ]);
});
