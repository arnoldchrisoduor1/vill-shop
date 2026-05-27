<?php

use App\Helpers\ApiResponse;

use App\Http\Middleware\AdminOnly;
use App\Http\Middleware\AuditLog;
use App\Http\Middleware\FeatureFlag;
use App\Http\Middleware\JwtAuth;
use App\Http\Middleware\RequestId;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Sentry\Laravel\Integration;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'request.id' => RequestId::class,
            'audit.log' => AuditLog::class,
            'feature.flag' => FeatureFlag::class,
            'admin.only' => AdminOnly::class,
            'jwt.auth' => JwtAuth::class,
        ]);

        $middleware->api(prepend: [
            RequestId::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        Integration::handles($exceptions);

        $exceptions->render(function (\App\Exceptions\InsufficientStockException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        });
    })->create();
