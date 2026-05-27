<?php

namespace App\States\Order;

class Processing extends OrderState
{
    public function label(): string
    {
        return 'processing';
    }
}
