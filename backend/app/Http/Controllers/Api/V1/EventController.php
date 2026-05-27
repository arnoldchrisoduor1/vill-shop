<?php

namespace App\Http\Controllers\Api\V1;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Services\EventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function __construct(private EventService $events) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->events->list((int) $request->get('per_page', 15));

        return ApiResponse::paginated(
            $paginator->through(fn ($e) => new EventResource($e))
        );
    }

    public function show(string $slug): JsonResponse
    {
        $event = $this->events->show($slug);

        if (! $event) {
            return ApiResponse::error('Event not found', 404);
        }

        return ApiResponse::success(new EventResource($event));
    }
}
