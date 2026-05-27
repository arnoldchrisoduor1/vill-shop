<?php

use App\Helpers\Money;

test('money converts kes to cents', function () {
    expect(Money::toCents(25.50))->toBe(2550);
});

test('money converts cents to kes', function () {
    expect(Money::fromCents(2550))->toBe(25.5);
});

test('money applies tax correctly', function () {
    expect(Money::applyTax(10000, 16))->toBe(1600);
});
