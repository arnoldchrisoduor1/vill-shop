<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateInventoryRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInventoryController extends Controller
{
    public function __construct(private ProductRepository $products) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->products->adminPaginate($request->all());

        return ApiResponse::paginated(
            $paginator->through(fn ($p) => new ProductResource($p))
        );
    }

    public function lowStock(): JsonResponse
    {
        return ApiResponse::success(
            ProductResource::collection($this->products->lowStockProducts())
        );
    }

    public function update(UpdateInventoryRequest $request, Product $product): JsonResponse
    {
        $product = $this->products->update($product, $request->validated());

        return ApiResponse::success(new ProductResource($product), 'Inventory updated');
    }
}
