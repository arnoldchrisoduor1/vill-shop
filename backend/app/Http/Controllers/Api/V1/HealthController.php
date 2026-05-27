<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $dbOk = false;
        $redisOk = false;

        try {
            DB::connection()->getPdo();
            $dbOk = true;
        } catch (\Throwable) {
            $dbOk = false;
        }

        try {
            Redis::ping();
            $redisOk = true;
        } catch (\Throwable) {
            $redisOk = false;
        }

        $healthy = $dbOk && $redisOk;
        $status = $healthy ? 200 : 503;

        return ApiResponse::success([
            'status' => $healthy ? 'ok' : 'degraded',
            'database' => $dbOk ? 'connected' : 'disconnected',
            'redis' => $redisOk ? 'connected' : 'disconnected',
            'queue' => config('queue.default'),
            'timestamp' => now()->toIso8601String(),
        ], $healthy ? 'Healthy' : 'Unhealthy', $status);
    }
}
