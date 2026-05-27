<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private ProductService $products) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->products->list($request->all());

        return ApiResponse::paginated(
            $paginator->through(fn ($p) => new ProductResource($p))
        );
    }

    public function show(string $slug): JsonResponse
    {
        $product = $this->products->showBySlug($slug);

        if (! $product) {
            return ApiResponse::error('Product not found', 404);
        }

        return ApiResponse::success(new ProductResource($product));
    }
}
