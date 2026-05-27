<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use App\Services\FeatureFlagService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FeatureFlag
{
    public function __construct(private FeatureFlagService $featureFlags) {}

    public function handle(Request $request, Closure $next, string $flag): Response
    {
        if (! $this->featureFlags->isEnabled($flag)) {
            return ApiResponse::error("Feature '{$flag}' is not enabled", 403);
        }

        return $next($request);
    }
}
