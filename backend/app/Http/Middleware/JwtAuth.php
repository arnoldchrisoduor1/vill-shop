<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class JwtAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $token = $request->cookie('token') ?? $request->bearerToken();

            if (! $token) {
                return ApiResponse::error('Unauthenticated', 401);
            }

            JWTAuth::setToken($token);
            $user = JWTAuth::authenticate();

            if (! $user) {
                return ApiResponse::error('Unauthenticated', 401);
            }

            auth()->setUser($user);
        } catch (JWTException) {
            return ApiResponse::error('Invalid or expired token', 401);
        }

        return $next($request);
    }
}
