<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Repositories\ReviewRepository;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    public function __construct(private ReviewRepository $reviews) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->reviews->adminPaginate((int) $request->get('per_page', 20));

        return ApiResponse::paginated(
            $paginator->through(fn ($r) => new ReviewResource($r))
        );
    }

    public function approve(Review $review): JsonResponse
    {
        return ApiResponse::success(new ReviewResource($this->reviews->approve($review)), 'Review approved');
    }
}
