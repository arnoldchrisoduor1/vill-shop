<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use App\Repositories\TagRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AdminTagController extends Controller
{
    public function __construct(private TagRepository $tags) {}

    public function index(): JsonResponse
    {
        return ApiResponse::success(TagResource::collection($this->tags->all()));
    }

    public function store(StoreTagRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return ApiResponse::success(new TagResource($this->tags->create($data)), 'Tag created', 201);
    }

    public function destroy(Tag $tag): JsonResponse
    {
        $this->tags->delete($tag);

        return ApiResponse::success(null, 'Tag deleted');
    }
}
