<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function show(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart(
            $request->user()?->id,
            $request->header('X-Session-ID')
        )->load(['items.product', 'items.variant']);

        return ApiResponse::success(new CartResource($cart));
    }

    public function addItem(AddCartItemRequest $request): JsonResponse
    {
        $cart = $this->cartService->getCart(
            $request->user()?->id,
            $request->header('X-Session-ID')
        );

        $cart = $this->cartService->addItem(
            $cart,
            $request->validated('product_id'),
            $request->validated('quantity'),
            $request->validated('product_variant_id')
        );

        return ApiResponse::success(new CartResource($cart), 'Item added', 201);
    }

    public function updateItem(UpdateCartItemRequest $request, CartItem $item): JsonResponse
    {
        $cart = $this->cartService->updateItem($item, $request->validated('quantity'));

        return ApiResponse::success(new CartResource($cart));
    }

    public function removeItem(CartItem $item): JsonResponse
    {
        $cart = $this->cartService->removeItem($item);

        return ApiResponse::success(new CartResource($cart));
    }

    public function merge(Request $request): JsonResponse
    {
        $sessionId = $request->header('X-Session-ID');

        if (! $sessionId) {
            return ApiResponse::error('Session ID required', 422);
        }

        $cart = $this->cartService->merge($request->user()->id, $sessionId);

        return ApiResponse::success(new CartResource($cart), 'Cart merged');
    }
}
