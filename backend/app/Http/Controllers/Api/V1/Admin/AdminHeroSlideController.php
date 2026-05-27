<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHeroSlideRequest;
use App\Http\Requests\Admin\UpdateHeroSlideRequest;
use App\Http\Resources\HeroSlideResource;
use App\Models\HeroSlide;
use App\Services\HeroSlideService;
use Illuminate\Http\JsonResponse;

class AdminHeroSlideController extends Controller
{
    public function __construct(private HeroSlideService $slides) {}

    public function index(): JsonResponse
    {
        return ApiResponse::success(HeroSlideResource::collection($this->slides->all()));
    }

    public function store(StoreHeroSlideRequest $request): JsonResponse
    {
        return ApiResponse::success(
            new HeroSlideResource($this->slides->create($request->validated())),
            'Slide created',
            201
        );
    }

    public function show(HeroSlide $heroSlide): JsonResponse
    {
        return ApiResponse::success(new HeroSlideResource($heroSlide));
    }

    public function update(UpdateHeroSlideRequest $request, HeroSlide $heroSlide): JsonResponse
    {
        return ApiResponse::success(new HeroSlideResource($this->slides->update($heroSlide, $request->validated())));
    }

    public function destroy(HeroSlide $heroSlide): JsonResponse
    {
        $this->slides->delete($heroSlide);

        return ApiResponse::success(null, 'Slide deleted');
    }
}
