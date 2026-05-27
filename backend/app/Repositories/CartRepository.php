<?php

namespace App\Repositories;

use App\Models\Cart;
use App\Models\CartItem;

class CartRepository
{
    public function findOrCreateForUser(?int $userId, ?string $sessionId): Cart
    {
        if ($userId) {
            return Cart::firstOrCreate(['user_id' => $userId]);
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    public function findById(int $id): ?Cart
    {
        return Cart::with(['items.product', 'items.variant'])->find($id);
    }

    public function addItem(Cart $cart, array $data): CartItem
    {
        return $cart->items()->updateOrCreate(
            [
                'product_id' => $data['product_id'],
                'product_variant_id' => $data['product_variant_id'] ?? null,
            ],
            [
                'quantity' => $data['quantity'],
                'unit_price_kes' => $data['unit_price_kes'],
            ]
        );
    }

    public function updateItemQuantity(CartItem $item, int $quantity): CartItem
    {
        $item->update(['quantity' => $quantity]);

        return $item->fresh();
    }

    public function removeItem(CartItem $item): void
    {
        $item->delete();
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
    }

    public function mergeCarts(Cart $guestCart, Cart $userCart): Cart
    {
        foreach ($guestCart->items as $item) {
            $existing = $userCart->items()
                ->where('product_id', $item->product_id)
                ->where('product_variant_id', $item->product_variant_id)
                ->first();

            if ($existing) {
                $existing->update(['quantity' => $existing->quantity + $item->quantity]);
            } else {
                $item->update(['cart_id' => $userCart->id]);
            }
        }

        $guestCart->delete();

        return $userCart->fresh(['items.product', 'items.variant']);
    }

    public function deleteStaleCarts(int $days = 30): int
    {
        return Cart::whereNull('user_id')
            ->where('updated_at', '<', now()->subDays($days))
            ->delete();
    }
}
