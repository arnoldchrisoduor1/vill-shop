<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Repositories\UserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    public function __construct(private UserRepository $users) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->users->adminPaginate($request->all());

        return ApiResponse::paginated(
            $paginator->through(fn ($u) => new UserResource($u))
        );
    }

    public function show(int $user): JsonResponse
    {
        $customer = \App\Models\User::with('orders')->findOrFail($user);

        return ApiResponse::success(new UserResource($customer));
    }
}
