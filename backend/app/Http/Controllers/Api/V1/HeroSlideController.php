<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\HeroSlideResource;
use App\Services\HeroSlideService;
use Illuminate\Http\JsonResponse;

class HeroSlideController extends Controller
{
    public function __construct(private HeroSlideService $slides) {}

    public function index(): JsonResponse
    {
        return ApiResponse::success(
            HeroSlideResource::collection($this->slides->active())
        );
    }
}
