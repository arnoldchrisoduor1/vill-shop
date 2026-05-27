<?php

use App\Models\Order;
use App\Models\User;
use App\States\Order\Pending;
use App\States\Order\Processing;
use App\States\Order\Shipped;

test('order state machine allows pending to processing transition', function () {
    $order = new Order(['status' => Pending::class]);

    expect($order->status->canTransitionTo(Processing::class))->toBeTrue();
});

test('order state machine blocks pending to shipped transition', function () {
    $order = new Order(['status' => Pending::class]);

    expect($order->status->canTransitionTo(Shipped::class))->toBeFalse();
});
