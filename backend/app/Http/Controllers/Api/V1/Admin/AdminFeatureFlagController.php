<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateFeatureFlagRequest;
use App\Models\FeatureFlag;
use App\Services\FeatureFlagService;
use Illuminate\Http\JsonResponse;

class AdminFeatureFlagController extends Controller
{
    public function __construct(private FeatureFlagService $featureFlags) {}

    public function index(): JsonResponse
    {
        return ApiResponse::success(FeatureFlag::all());
    }

    public function update(UpdateFeatureFlagRequest $request, string $key): JsonResponse
    {
        $flag = $this->featureFlags->update(
            $key,
            $request->validated('enabled'),
            $request->validated('payload'),
            $request->validated('description')
        );

        return ApiResponse::success($flag, 'Feature flag updated');
    }
}
