<?php

namespace App\States\Order;

class Refunded extends OrderState
{
    public function label(): string
    {
        return 'refunded';
    }
}
