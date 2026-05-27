<?php

use App\Jobs\FetchExchangeRates;
use App\Repositories\CartRepository;
use App\Repositories\ProductRepository;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new FetchExchangeRates)->daily();

Schedule::call(function () {
    app(CartRepository::class)->deleteStaleCarts(30);
})->daily();

Schedule::call(function () {
    $products = app(ProductRepository::class)->lowStockProducts();
    foreach ($products as $product) {
        event(new \App\Events\StockLow($product));
    }
})->hourly();
