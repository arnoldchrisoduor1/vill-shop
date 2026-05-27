<?php

namespace App\Services;

use App\Models\Event;
use App\Repositories\EventRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class EventService
{
    public function __construct(private EventRepository $events) {}

    public function list(int $perPage = 15): LengthAwarePaginator
    {
        return $this->events->paginateActive($perPage);
    }

    public function show(string $slug): ?Event
    {
        return $this->events->findBySlug($slug);
    }

    public function create(array $data): Event
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);

        return $this->events->create($data);
    }

    public function update(Event $event, array $data): Event
    {
        if (isset($data['title']) && ! isset($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        return $this->events->update($event, $data);
    }

    public function delete(Event $event): void
    {
        $this->events->delete($event);
    }

    public function adminList(int $perPage = 20): LengthAwarePaginator
    {
        return $this->events->adminPaginate($perPage);
    }
}
