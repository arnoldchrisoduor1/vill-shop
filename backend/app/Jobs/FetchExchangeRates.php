<?php

namespace App\Jobs;

use App\Services\ExchangeRateService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class FetchExchangeRates implements ShouldQueue
{
    use Queueable;

    public function handle(ExchangeRateService $exchangeRates): void
    {
        $exchangeRates->fetchAndStore();
    }
}
