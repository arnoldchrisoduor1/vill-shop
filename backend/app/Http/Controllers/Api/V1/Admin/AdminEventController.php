<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEventRequest;
use App\Http\Requests\Admin\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\EventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminEventController extends Controller
{
    public function __construct(private EventService $events) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->events->adminList((int) $request->get('per_page', 20));

        return ApiResponse::paginated(
            $paginator->through(fn ($e) => new EventResource($e))
        );
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        return ApiResponse::success(
            new EventResource($this->events->create($request->validated())),
            'Event created',
            201
        );
    }

    public function show(Event $event): JsonResponse
    {
        return ApiResponse::success(new EventResource($event));
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        return ApiResponse::success(new EventResource($this->events->update($event, $request->validated())));
    }

    public function destroy(Event $event): JsonResponse
    {
        $this->events->delete($event);

        return ApiResponse::success(null, 'Event deleted');
    }
}
