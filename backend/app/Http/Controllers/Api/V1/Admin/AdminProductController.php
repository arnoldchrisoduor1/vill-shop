<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function __construct(private ProductService $products) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->products->adminList($request->all());

        return ApiResponse::paginated(
            $paginator->through(fn ($p) => new ProductResource($p))
        );
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->products->create(
            $request->safe()->except('tag_ids'),
            $request->validated('tag_ids', [])
        );

        return ApiResponse::success(new ProductResource($product), 'Product created', 201);
    }

    public function show(Product $product): JsonResponse
    {
        return ApiResponse::success(new ProductResource($product->load(['category', 'tags', 'variants'])));
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product = $this->products->update(
            $product,
            $request->safe()->except('tag_ids'),
            $request->has('tag_ids') ? $request->validated('tag_ids') : null
        );

        return ApiResponse::success(new ProductResource($product));
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->products->delete($product);

        return ApiResponse::success(null, 'Product deleted');
    }
}
