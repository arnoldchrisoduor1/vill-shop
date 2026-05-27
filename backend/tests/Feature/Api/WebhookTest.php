<?php

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('pesapal webhook logs payload and returns success', function () {
    $response = $this->postJson('/api/webhooks/pesapal', [
        'OrderTrackingId' => 'TRACK-123',
        'OrderMerchantReference' => 'VS-TEST123',
        'OrderNotificationType' => 'CHANGE',
    ], [
        'X-Pesapal-Signature' => 'test-signature',
    ]);

    $response->assertAccepted()
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('webhook_logs', [
        'provider' => 'pesapal',
    ]);
});

test('pesapal webhook is idempotent for paid orders', function () {
    Order::factory()->create([
        'order_number' => 'VS-PAID123',
        'paid_at' => now(),
    ]);

    $response = $this->postJson('/api/webhooks/pesapal', [
        'OrderTrackingId' => 'TRACK-456',
        'OrderMerchantReference' => 'VS-PAID123',
    ]);

    $response->assertAccepted();
});
