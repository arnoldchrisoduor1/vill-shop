<?php

namespace App\States\Order;

class Shipped extends OrderState
{
    public function label(): string
    {
        return 'shipped';
    }
}
