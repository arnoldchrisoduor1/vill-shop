<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $stats = Cache::remember('public_stats', 3600, function () {
            return [
                'total_orders' => Order::count(),
                'total_products' => Product::where('is_active', true)->count(),
                'total_customers' => User::where('role', 'customer')->count(),
            ];
        });

        return ApiResponse::success($stats);
    }
}
