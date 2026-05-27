<?php

namespace App\Services;

use App\Models\ExchangeRate;
use Illuminate\Support\Facades\Http;

class ExchangeRateService
{
    public function fetchAndStore(): void
    {
        $apiUrl = config('services.exchange_rate.api_url');
        $base = config('services.exchange_rate.base_currency', 'KES');
        $targets = config('services.exchange_rate.targets', ['USD', 'EUR', 'GBP']);

        foreach ($targets as $target) {
            $response = Http::get($apiUrl, [
                'from' => $base,
                'to' => $target,
            ]);

            if ($response->successful()) {
                ExchangeRate::updateOrCreate(
                    ['base_currency' => $base, 'target_currency' => $target],
                    [
                        'rate' => $response->json('rate', 1),
                        'fetched_at' => now(),
                    ]
                );
            }
        }
    }

    public function getRate(string $targetCurrency): ?float
    {
        $rate = ExchangeRate::where('target_currency', $targetCurrency)->first();

        return $rate ? (float) $rate->rate : null;
    }
}
