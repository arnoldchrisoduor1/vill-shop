<?php

namespace App\States\Order;

class Pending extends OrderState
{
    public function label(): string
    {
        return 'pending';
    }
}
