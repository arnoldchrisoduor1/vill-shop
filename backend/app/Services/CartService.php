<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Cart;
use App\Models\CartItem;
use App\Repositories\CartRepository;
use App\Repositories\ProductRepository;

class CartService
{
    public function __construct(
        private CartRepository $carts,
        private ProductRepository $products,
    ) {}

    public function getCart(?int $userId, ?string $sessionId): Cart
    {
        return $this->carts->findOrCreateForUser($userId, $sessionId);
    }

    public function addItem(Cart $cart, int $productId, int $quantity, ?int $variantId = null): Cart
    {
        $product = $this->products->findById($productId);

        if (! $product || ! $product->is_active) {
            throw new \InvalidArgumentException('Product not found');
        }

        $price = $product->price_kes;

        if ($variantId) {
            $variant = $product->variants->firstWhere('id', $variantId);
            if (! $variant) {
                throw new \InvalidArgumentException('Variant not found');
            }
            $price = $variant->price_kes;
        }

        if ($product->stock < $quantity) {
            throw new InsufficientStockException();
        }

        $this->carts->addItem($cart, [
            'product_id' => $productId,
            'product_variant_id' => $variantId,
            'quantity' => $quantity,
            'unit_price_kes' => $price,
        ]);

        return $this->carts->findById($cart->id);
    }

    public function updateItem(CartItem $item, int $quantity): Cart
    {
        if ($quantity <= 0) {
            $this->carts->removeItem($item);
        } else {
            $product = $this->products->findById($item->product_id);
            if ($product->stock < $quantity) {
                throw new InsufficientStockException();
            }
            $this->carts->updateItemQuantity($item, $quantity);
        }

        return $this->carts->findById($item->cart_id);
    }

    public function removeItem(CartItem $item): Cart
    {
        $cartId = $item->cart_id;
        $this->carts->removeItem($item);

        return $this->carts->findById($cartId);
    }

    public function merge(?int $userId, string $sessionId): Cart
    {
        $guestCart = $this->carts->findOrCreateForUser(null, $sessionId);
        $userCart = $this->carts->findOrCreateForUser($userId, null);

        if ($guestCart->id === $userCart->id) {
            return $userCart;
        }

        return $this->carts->mergeCarts(
            $this->carts->findById($guestCart->id),
            $this->carts->findById($userCart->id)
        );
    }

    public function clear(Cart $cart): void
    {
        $this->carts->clear($cart);
    }
}
