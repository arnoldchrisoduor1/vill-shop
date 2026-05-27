<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Repositories\CategoryRepository;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function __construct(private CategoryRepository $categories) {}

    public function index(): JsonResponse
    {
        return ApiResponse::success(
            CategoryResource::collection($this->categories->allActive())
        );
    }

    public function show(string $slug): JsonResponse
    {
        $category = $this->categories->findBySlug($slug);

        if (! $category) {
            return ApiResponse::error('Category not found', 404);
        }

        return ApiResponse::success(new CategoryResource($category));
    }
}
