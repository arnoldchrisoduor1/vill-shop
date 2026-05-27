<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Jobs\SendReceiptJob;

class SendOrderReceipt
{
    public function handle(OrderPaid $event): void
    {
        SendReceiptJob::dispatch($event->order);
    }
}
