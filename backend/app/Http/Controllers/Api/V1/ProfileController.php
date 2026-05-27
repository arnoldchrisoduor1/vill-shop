<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function __construct(private UserRepository $users) {}

    public function show(): JsonResponse
    {
        return ApiResponse::success(new UserResource(auth()->user()));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->users->update(auth()->user(), $request->validated());

        return ApiResponse::success(new UserResource($user), 'Profile updated');
    }
}
