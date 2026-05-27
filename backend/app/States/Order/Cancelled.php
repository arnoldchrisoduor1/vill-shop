<?php

namespace App\States\Order;

class Cancelled extends OrderState
{
    public function label(): string
    {
        return 'cancelled';
    }
}
