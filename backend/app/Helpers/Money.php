<?php

namespace App\Helpers;

class Money
{
    /**
     * All monetary values are stored as integer KES cents (1 KES = 100 cents).
     */
    public static function toCents(float|int|string $amountKes): int
    {
        return (int) round(((float) $amountKes) * 100);
    }

    public static function fromCents(int $cents): float
    {
        return round($cents / 100, 2);
    }

    public static function format(int $cents, string $currency = 'KES'): string
    {
        return sprintf('%s %s', $currency, number_format(self::fromCents($cents), 2));
    }

    public static function add(int ...$amounts): int
    {
        return array_sum($amounts);
    }

    public static function multiply(int $cents, int $quantity): int
    {
        return $cents * $quantity;
    }

    public static function applyTax(int $subtotalCents, float $ratePercent): int
    {
        return (int) round($subtotalCents * ($ratePercent / 100));
    }
}
