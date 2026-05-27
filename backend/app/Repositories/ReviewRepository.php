<?php

namespace App\Repositories;

use App\Models\Review;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReviewRepository
{
    public function paginateForProduct(int $productId, int $perPage = 10): LengthAwarePaginator
    {
        return Review::with('user')
            ->where('product_id', $productId)
            ->where('is_approved', true)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function create(array $data): Review
    {
        return Review::create($data);
    }

    public function findByUserAndProduct(int $userId, int $productId): ?Review
    {
        return Review::where('user_id', $userId)->where('product_id', $productId)->first();
    }

    public function approve(Review $review): Review
    {
        $review->update(['is_approved' => true]);

        return $review;
    }

    public function adminPaginate(int $perPage = 20): LengthAwarePaginator
    {
        return Review::with(['user', 'product'])->orderByDesc('created_at')->paginate($perPage);
    }
}
