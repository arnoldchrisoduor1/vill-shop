<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\NewsletterSubscribeRequest;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;

class NewsletterController extends Controller
{
    public function subscribe(NewsletterSubscribeRequest $request): JsonResponse
    {
        NewsletterSubscriber::updateOrCreate(
            ['email' => $request->validated('email')],
            ['subscribed_at' => now(), 'unsubscribed_at' => null]
        );

        return ApiResponse::success(null, 'Subscribed successfully', 201);
    }
}
