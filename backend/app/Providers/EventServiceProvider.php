<?php

namespace App\Providers;

use App\Events\OrderPaid;
use App\Events\StockLow;
use App\Listeners\NotifyLowStock;
use App\Listeners\SendOrderReceipt;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        OrderPaid::class => [
            SendOrderReceipt::class,
        ],
        StockLow::class => [
            NotifyLowStock::class,
        ],
    ];

    public function boot(): void
    {
        foreach ($this->listen as $event => $listeners) {
            foreach ($listeners as $listener) {
                Event::listen($event, $listener);
            }
        }
    }
}
