<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\CreateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Repositories\OrderRepository;
use App\Models\OrderItem;
use App\Services\CartService;
use App\Services\DigitalDeliveryService;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService,
        private CartService $cartService,
        private PaymentService $paymentService,
        private OrderRepository $orders,
        private DigitalDeliveryService $digitalDelivery,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->orders->paginateForUser($request->user()->id);

        return ApiResponse::paginated(
            $paginator->through(fn ($o) => new OrderResource($o))
        );
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = $this->orders->findByOrderNumber($orderNumber);

        if (! $order || ($order->user_id && $order->user_id !== $request->user()?->id)) {
            return ApiResponse::error('Order not found', 404);
        }

        return ApiResponse::success(new OrderResource($order));
    }

    public function store(CreateOrderRequest $request): JsonResponse
    {
        $cart = $this->cartService->getCart(
            $request->user()?->id,
            $request->header('X-Session-ID')
        );

        $order = $this->orderService->createFromCart(
            $cart,
            $request->validated(),
            $request->user()?->id
        );

        $payment = $this->paymentService->initiatePayment($order);

        return ApiResponse::success([
            'order' => new OrderResource($order),
            'payment' => $payment,
        ], 'Order created', 201);
    }

    public function downloadItem(Request $request, string $orderNumber, OrderItem $item): JsonResponse
    {
        $order = $this->orders->findByOrderNumber($orderNumber);

        if (! $order || $order->user_id !== $request->user()->id || $item->order_id !== $order->id) {
            return ApiResponse::error('Order item not found', 404);
        }

        try {
            $url = $this->digitalDelivery->generateDownloadUrl($order, $item, $request->user()->id);

            return ApiResponse::success(['download_url' => $url]);
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422, code: 'DOWNLOAD_UNAVAILABLE');
        } catch (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e) {
            return ApiResponse::error($e->getMessage(), 403);
        }
    }
}
