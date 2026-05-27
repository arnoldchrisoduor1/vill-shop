<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Repositories\TagRepository;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    public function __construct(private TagRepository $tags) {}

    public function index(): JsonResponse
    {
        return ApiResponse::success(TagResource::collection($this->tags->all()));
    }
}
