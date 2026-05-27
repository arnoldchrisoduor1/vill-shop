<?php

namespace App\Services;

use App\Helpers\Money;
use App\Events\OrderPaid;
use App\Events\StockLow;
use App\Exceptions\InsufficientStockException;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Repositories\CartRepository;
use App\Repositories\OrderRepository;
use App\Repositories\ProductRepository;
use App\States\Order\Cancelled;
use App\States\Order\Delivered;
use App\States\Order\Pending;
use App\States\Order\Processing;
use App\States\Order\Refunded;
use App\States\Order\Shipped;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        private OrderRepository $orders,
        private CartRepository $carts,
        private ProductRepository $products,
        private FeatureFlagService $featureFlags,
    ) {}

    public function createFromCart(Cart $cart, array $customerData, ?int $userId = null): Order
    {
        return DB::transaction(function () use ($cart, $customerData, $userId) {
            $cart->load('items.product');

            if ($cart->items->isEmpty()) {
                throw new \InvalidArgumentException('Cart is empty');
            }

            $subtotal = 0;
            $orderItems = [];

            foreach ($cart->items as $item) {
                $product = $this->products->lockForUpdate($item->product_id);

                if ($product->stock < $item->quantity) {
                    throw new InsufficientStockException("Insufficient stock for {$product->name}");
                }

                $lineTotal = Money::multiply($item->unit_price_kes, $item->quantity);
                $subtotal = Money::add($subtotal, $lineTotal);

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $item->quantity,
                    'unit_price_kes' => $item->unit_price_kes,
                    'total_kes' => $lineTotal,
                ];
            }

            $taxRate = $this->featureFlags->getTaxRate();
            $taxAmount = $taxRate > 0 ? Money::applyTax($subtotal, $taxRate) : 0;
            $total = Money::add($subtotal, $taxAmount);

            $order = $this->orders->create([
                'order_number' => 'VS-'.strtoupper(Str::random(10)),
                'user_id' => $userId,
                'status' => Pending::class,
                'subtotal_kes' => $subtotal,
                'tax_amount_kes' => $taxAmount,
                'total_kes' => $total,
                'customer_email' => $customerData['email'],
                'customer_name' => $customerData['name'],
                'customer_phone' => $customerData['phone'] ?? null,
                'shipping_address_line1' => $customerData['shipping_address_line1'],
                'shipping_address_line2' => $customerData['shipping_address_line2'] ?? null,
                'shipping_city' => $customerData['shipping_city'],
                'shipping_country' => $customerData['shipping_country'] ?? 'KE',
                'notes' => $customerData['notes'] ?? null,
            ]);

            foreach ($orderItems as $itemData) {
                OrderItem::create(array_merge($itemData, ['order_id' => $order->id]));
            }

            foreach ($cart->items as $item) {
                $product = $this->products->lockForUpdate($item->product_id);
                $product->decrement('stock', $item->quantity);
                $product->refresh();

                if ($product->stock <= $product->low_stock_threshold) {
                    event(new StockLow($product));
                }
            }

            $this->carts->clear($cart);
            $this->products->flushCache();

            return $this->orders->findById($order->id);
        });
    }

    public function markPaid(Order $order): Order
    {
        if ($order->paid_at) {
            return $order;
        }

        $order->status->transitionTo(Processing::class);
        $order->update(['paid_at' => now()]);

        event(new OrderPaid($order->fresh(['items', 'payment'])));

        return $order->fresh(['items', 'payment']);
    }

    public function ship(Order $order): Order
    {
        $order->status->transitionTo(Shipped::class);
        $order->update(['shipped_at' => now()]);

        return $order->fresh(['items', 'payment']);
    }

    public function deliver(Order $order): Order
    {
        $order->status->transitionTo(Delivered::class);
        $order->update(['delivered_at' => now()]);

        return $order->fresh(['items', 'payment']);
    }

    public function cancel(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            $order->load('items');

            foreach ($order->items as $item) {
                $product = $this->products->lockForUpdate($item->product_id);
                $product->increment('stock', $item->quantity);
            }

            $order->status->transitionTo(Cancelled::class);
            $order->update(['cancelled_at' => now()]);
            $this->products->flushCache();

            return $order->fresh(['items', 'payment']);
        });
    }

    public function refund(Order $order): Order
    {
        $order->load('payment');

        if ($order->payment) {
            $order->payment->update(['status' => 'refunded']);
        }

        $order->status->transitionTo(Refunded::class);

        return $order->fresh(['items', 'payment']);
    }
}
