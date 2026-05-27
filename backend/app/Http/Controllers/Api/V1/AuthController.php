<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct(private UserRepository $users) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->users->create([
            ...$request->validated(),
            'role' => UserRole::Customer,
        ]);

        $token = JWTAuth::fromUser($user);

        return $this->respondWithToken($token, new UserResource($user), 'Registered successfully', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! $token = JWTAuth::attempt($request->only('email', 'password'))) {
            return ApiResponse::error('Invalid credentials', 401);
        }

        $user = auth()->user();

        return $this->respondWithToken($token, new UserResource($user));
    }

    public function logout(): JsonResponse
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (\Throwable) {
            // Token may already be invalid
        }

        return ApiResponse::success(null, 'Logged out')
            ->withoutCookie('token');
    }

    public function refresh(): JsonResponse
    {
        $token = JWTAuth::refresh(JWTAuth::getToken());

        return $this->respondWithToken($token, new UserResource(auth()->user()));
    }

    public function me(): JsonResponse
    {
        return ApiResponse::success(new UserResource(auth()->user()));
    }

    private function respondWithToken(string $token, UserResource $user, string $message = 'Success', int $status = 200): JsonResponse
    {
        $cookie = cookie(
            'token',
            $token,
            config('jwt.ttl', 60),
            '/',
            config('session.domain'),
            config('app.env') === 'production',
            true,
            false,
            'lax'
        );

        return ApiResponse::success([
            'user' => $user,
            'token' => $token,
            'expires_in' => config('jwt.ttl', 60) * 60,
        ], $message, $status)->withCookie($cookie);
    }
}
