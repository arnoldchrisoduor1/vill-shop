<?php

use App\Http\Controllers\Api\V1\Admin\AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\AdminCustomerController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminEventController;
use App\Http\Controllers\Api\V1\Admin\AdminFeatureFlagController;
use App\Http\Controllers\Api\V1\Admin\AdminHeroSlideController;
use App\Http\Controllers\Api\V1\Admin\AdminInventoryController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AdminProductController;
use App\Http\Controllers\Api\V1\Admin\AdminReportController;
use App\Http\Controllers\Api\V1\Admin\AdminReviewController;
use App\Http\Controllers\Api\V1\Admin\AdminTagController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\FeatureFlagController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\HeroSlideController;
use App\Http\Controllers\Api\V1\NewsletterController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\StatsController;
use App\Http\Controllers\Api\V1\TagController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\Api\V1\WishlistController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('health', HealthController::class);

    Route::middleware('throttle:120,1')->group(function () {
        Route::get('features', [FeatureFlagController::class, 'index']);
        Route::get('products', [ProductController::class, 'index']);
        Route::get('products/{slug}', [ProductController::class, 'show']);
        Route::get('categories', [CategoryController::class, 'index']);
        Route::get('categories/{slug}', [CategoryController::class, 'show']);
        Route::get('tags', [TagController::class, 'index']);
        Route::get('events', [EventController::class, 'index']);
        Route::get('events/{slug}', [EventController::class, 'show']);
        Route::get('hero-slides', [HeroSlideController::class, 'index']);
        Route::get('stats', StatsController::class);
        Route::get('products/{productId}/reviews', [ReviewController::class, 'index'])
            ->middleware('feature.flag:reviews');
    });

    Route::middleware('throttle:5,1')->group(function () {
        Route::post('auth/register', [AuthController::class, 'register']);
        Route::post('auth/login', [AuthController::class, 'login']);
    });

    Route::middleware('throttle:30,1')->group(function () {
        Route::post('newsletter/subscribe', [NewsletterController::class, 'subscribe']);
    });

    Route::middleware(['throttle:60,1'])->group(function () {
        Route::get('cart', [CartController::class, 'show']);
        Route::post('cart/items', [CartController::class, 'addItem']);
        Route::patch('cart/items/{item}', [CartController::class, 'updateItem']);
        Route::delete('cart/items/{item}', [CartController::class, 'removeItem']);
    });

    Route::middleware(['throttle:10,1'])->group(function () {
        Route::post('orders', [OrderController::class, 'store']);
    });

    Route::middleware(['jwt.auth', 'audit.log'])->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::post('auth/refresh', [AuthController::class, 'refresh'])->middleware('throttle:10,1');
        Route::get('auth/me', [AuthController::class, 'me']);

        Route::get('profile', [ProfileController::class, 'show']);
        Route::put('profile', [ProfileController::class, 'update']);

        Route::post('cart/merge', [CartController::class, 'merge']);

        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{orderNumber}', [OrderController::class, 'show']);
        Route::post('orders/{orderNumber}/items/{item}/download', [OrderController::class, 'downloadItem']);

        Route::post('products/{productId}/reviews', [ReviewController::class, 'store'])
            ->middleware('feature.flag:reviews');

        Route::get('wishlist', [WishlistController::class, 'index']);
        Route::post('wishlist/{product}', [WishlistController::class, 'store']);
        Route::delete('wishlist/{product}', [WishlistController::class, 'destroy']);
    });

    Route::prefix('admin')->middleware(['jwt.auth', 'admin.only', 'audit.log'])->group(function () {
        Route::get('dashboard/stats', [AdminDashboardController::class, 'stats']);

        Route::apiResource('products', AdminProductController::class);
        Route::apiResource('categories', AdminCategoryController::class)->except(['show']);
        Route::apiResource('tags', AdminTagController::class)->except(['show', 'update']);
        Route::apiResource('events', AdminEventController::class);
        Route::apiResource('hero-slides', AdminHeroSlideController::class);

        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::get('orders/{order}', [AdminOrderController::class, 'show']);
        Route::post('orders/{order}/ship', [AdminOrderController::class, 'ship']);
        Route::post('orders/{order}/deliver', [AdminOrderController::class, 'deliver']);
        Route::post('orders/{order}/cancel', [AdminOrderController::class, 'cancel']);
        Route::post('orders/{order}/refund', [AdminOrderController::class, 'refund']);

        Route::get('customers', [AdminCustomerController::class, 'index']);
        Route::get('customers/{user}', [AdminCustomerController::class, 'show']);

        Route::get('inventory', [AdminInventoryController::class, 'index']);
        Route::get('inventory/low-stock', [AdminInventoryController::class, 'lowStock']);
        Route::patch('inventory/{product}', [AdminInventoryController::class, 'update']);

        Route::get('reports/orders.csv', [AdminReportController::class, 'ordersCsv']);

        Route::get('feature-flags', [AdminFeatureFlagController::class, 'index']);
        Route::put('feature-flags/{key}', [AdminFeatureFlagController::class, 'update']);

        Route::get('reviews', [AdminReviewController::class, 'index']);
        Route::post('reviews/{review}/approve', [AdminReviewController::class, 'approve']);
    });
});

Route::post('webhooks/pesapal', [WebhookController::class, 'pesapal'])
    ->middleware('throttle:60,1');
