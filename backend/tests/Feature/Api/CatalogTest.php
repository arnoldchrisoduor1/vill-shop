<?php

use App\Models\Category;
use App\Models\Product;
use App\Helpers\Money;

test('products index returns paginated products', function () {
    $category = Category::create([
        'name' => 'Electronics',
        'slug' => 'electronics',
        'is_active' => true,
    ]);

    Product::create([
        'category_id' => $category->id,
        'name' => 'Test Phone',
        'slug' => 'test-phone',
        'sku' => 'TP-001',
        'description' => 'A test phone',
        'price_kes' => Money::toCents(15000),
        'stock' => 10,
        'low_stock_threshold' => 2,
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/v1/products');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonCount(1, 'data');
});

test('categories index returns active categories', function () {
    Category::create(['name' => 'Fashion', 'slug' => 'fashion', 'is_active' => true]);

    $response = $this->getJson('/api/v1/categories');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonCount(1, 'data');
});

test('newsletter subscribe accepts valid email', function () {
    $response = $this->postJson('/api/v1/newsletter/subscribe', [
        'email' => 'subscriber@example.com',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true);
});
