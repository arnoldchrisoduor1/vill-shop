<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Repositories\OrderRepository;
use App\Repositories\ProductRepository;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function __construct(
        private OrderRepository $orders,
        private UserRepository $users,
        private ProductRepository $products,
    ) {}

    public function stats(): JsonResponse
    {
        $orderStats = $this->orders->stats();

        return ApiResponse::success([
            'orders' => $orderStats,
            'customers' => $this->users->countCustomers(),
            'low_stock_products' => $this->products->lowStockProducts()->count(),
        ]);
    }
}
