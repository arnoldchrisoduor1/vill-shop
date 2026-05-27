<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use App\States\Order\Pending;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'order_number' => 'VS-'.strtoupper(fake()->bothify('??????????')),
            'user_id' => User::factory(),
            'status' => Pending::class,
            'subtotal_kes' => 100000,
            'tax_amount_kes' => 16000,
            'total_kes' => 116000,
            'currency' => 'KES',
            'customer_email' => fake()->safeEmail(),
            'customer_name' => fake()->name(),
            'shipping_address_line1' => fake()->streetAddress(),
            'shipping_city' => 'Nairobi',
            'shipping_country' => 'KE',
        ];
    }
}
