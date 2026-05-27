<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Repositories\CategoryRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function __construct(private CategoryRepository $categories) {}

    public function index(): JsonResponse
    {
        return ApiResponse::success(CategoryResource::collection($this->categories->allActive()));
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return ApiResponse::success(
            new CategoryResource($this->categories->create($data)),
            'Category created',
            201
        );
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $data = $request->validated();
        if (isset($data['name']) && ! isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return ApiResponse::success(new CategoryResource($this->categories->update($category, $data)));
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->categories->delete($category);

        return ApiResponse::success(null, 'Category deleted');
    }
}
