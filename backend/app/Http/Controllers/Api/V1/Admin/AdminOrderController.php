<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Mail\OrderDeliveredMail;
use App\Mail\OrderShippedMail;
use App\Models\Order;
use App\Repositories\OrderRepository;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminOrderController extends Controller
{
    public function __construct(
        private OrderRepository $orders,
        private OrderService $orderService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->orders->adminPaginate($request->all());

        return ApiResponse::paginated(
            $paginator->through(fn ($o) => new OrderResource($o))
        );
    }

    public function show(Order $order): JsonResponse
    {
        return ApiResponse::success(new OrderResource($order->load(['items', 'payment', 'user'])));
    }

    public function ship(Order $order): JsonResponse
    {
        $order = $this->orderService->ship($order);
        Mail::to($order->customer_email)->queue(new OrderShippedMail($order));

        return ApiResponse::success(new OrderResource($order), 'Order shipped');
    }

    public function deliver(Order $order): JsonResponse
    {
        $order = $this->orderService->deliver($order);
        Mail::to($order->customer_email)->queue(new OrderDeliveredMail($order));

        return ApiResponse::success(new OrderResource($order), 'Order delivered');
    }

    public function cancel(Order $order): JsonResponse
    {
        return ApiResponse::success(new OrderResource($this->orderService->cancel($order)), 'Order cancelled');
    }

    public function refund(Order $order): JsonResponse
    {
        return ApiResponse::success(new OrderResource($this->orderService->refund($order)), 'Order refunded');
    }
}
