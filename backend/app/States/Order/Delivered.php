<?php

namespace App\States\Order;

class Delivered extends OrderState
{
    public function label(): string
    {
        return 'delivered';
    }
}
