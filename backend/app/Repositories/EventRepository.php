<?php

namespace App\Repositories;

use App\Models\Event;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EventRepository
{
    public function paginateActive(int $perPage = 15): LengthAwarePaginator
    {
        return Event::where('is_active', true)
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->paginate($perPage);
    }

    public function findBySlug(string $slug): ?Event
    {
        return Event::where('slug', $slug)->first();
    }

    public function adminPaginate(int $perPage = 20): LengthAwarePaginator
    {
        return Event::orderByDesc('starts_at')->paginate($perPage);
    }

    public function create(array $data): Event
    {
        return Event::create($data);
    }

    public function update(Event $event, array $data): Event
    {
        $event->update($data);

        return $event->fresh();
    }

    public function delete(Event $event): void
    {
        $event->delete();
    }
}
