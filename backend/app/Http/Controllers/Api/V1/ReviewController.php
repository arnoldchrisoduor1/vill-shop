<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Repositories\ReviewRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(private ReviewRepository $reviews) {}

    public function index(int $productId): JsonResponse
    {
        $paginator = $this->reviews->paginateForProduct($productId);

        return ApiResponse::paginated(
            $paginator->through(fn ($r) => new ReviewResource($r))
        );
    }

    public function store(StoreReviewRequest $request, int $productId): JsonResponse
    {
        if ($this->reviews->findByUserAndProduct($request->user()->id, $productId)) {
            return ApiResponse::error('You already reviewed this product', 422);
        }

        $review = $this->reviews->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'product_id' => $productId,
        ]);

        return ApiResponse::success(new ReviewResource($review), 'Review submitted', 201);
    }
}
