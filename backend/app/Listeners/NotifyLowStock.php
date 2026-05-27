<?php

namespace App\Listeners;

use App\Events\StockLow;
use Illuminate\Support\Facades\Log;

class NotifyLowStock
{
    public function handle(StockLow $event): void
    {
        Log::warning('stock.low', [
            'product_id' => $event->product->id,
            'sku' => $event->product->sku,
            'stock' => $event->product->stock,
            'threshold' => $event->product->low_stock_threshold,
        ]);
    }
}
