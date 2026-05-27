<?php

use App\Models\FeatureFlag;
use App\Services\FeatureFlagService;

test('feature flag service returns tax rate from payload', function () {
    FeatureFlag::create([
        'key' => 'tax',
        'enabled' => true,
        'payload' => ['rate' => 16],
    ]);

    $service = app(FeatureFlagService::class);

    expect($service->isEnabled('tax'))->toBeTrue()
        ->and($service->getTaxRate())->toBe(16.0);
});

test('disabled feature flag returns false', function () {
    FeatureFlag::create([
        'key' => 'reviews',
        'enabled' => false,
        'payload' => null,
    ]);

    $service = app(FeatureFlagService::class);

    expect($service->isEnabled('reviews'))->toBeFalse();
});
