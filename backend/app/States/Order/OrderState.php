<?php

namespace App\States\Order;

use Spatie\ModelStates\State;
use Spatie\ModelStates\StateConfig;

abstract class OrderState extends State
{
    abstract public function label(): string;

    public static function config(): StateConfig
    {
        return parent::config()
            ->default(Pending::class)
            ->allowTransition(Pending::class, Processing::class)
            ->allowTransition(Pending::class, Cancelled::class)
            ->allowTransition(Processing::class, Shipped::class)
            ->allowTransition(Processing::class, Cancelled::class)
            ->allowTransition(Shipped::class, Delivered::class)
            ->allowTransition(Delivered::class, Refunded::class)
            ->allowTransition(Processing::class, Refunded::class);
    }
}
