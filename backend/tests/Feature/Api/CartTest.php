<?php

use App\Models\Cart;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Helpers\Money;
use Tymon\JWTAuth\Facades\JWTAuth;

test('guest can add item to cart', function () {
    $category = Category::create(['name' => 'Home', 'slug' => 'home', 'is_active' => true]);
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Mug',
        'slug' => 'mug',
        'sku' => 'MUG-001',
        'description' => 'Ceramic mug',
        'price_kes' => Money::toCents(500),
        'stock' => 20,
        'low_stock_threshold' => 5,
        'is_active' => true,
    ]);

    $response = $this->withHeader('X-Session-ID', 'guest-session-123')
        ->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.items.0.quantity', 2);
});

test('authenticated user can merge guest cart', function () {
    $user = User::factory()->create();
    $token = JWTAuth::fromUser($user);

    $category = Category::create(['name' => 'Books', 'slug' => 'books', 'is_active' => true]);
    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Novel',
        'slug' => 'novel',
        'sku' => 'BK-001',
        'description' => 'A novel',
        'price_kes' => Money::toCents(1200),
        'stock' => 5,
        'low_stock_threshold' => 1,
        'is_active' => true,
    ]);

    $cart = Cart::create(['session_id' => 'merge-session']);
    $cart->items()->create([
        'product_id' => $product->id,
        'quantity' => 1,
        'unit_price_kes' => $product->price_kes,
    ]);

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->withHeader('X-Session-ID', 'merge-session')
        ->postJson('/api/v1/cart/merge');

    $response->assertOk()
        ->assertJsonPath('success', true);
});
