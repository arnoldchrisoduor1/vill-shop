<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\FeatureFlagService;
use Illuminate\Http\JsonResponse;

class FeatureFlagController extends Controller
{
    public function __construct(private FeatureFlagService $featureFlags) {}

    public function index(): JsonResponse
    {
        return ApiResponse::success($this->featureFlags->all());
    }
}
