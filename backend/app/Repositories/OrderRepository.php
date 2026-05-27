<?php

namespace App\Repositories;

use App\Models\Order;
use App\States\Order\Pending;
use App\States\Order\Processing;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class OrderRepository
{
    public function findById(int $id): ?Order
    {
        return Order::with(['items', 'payment', 'user'])->find($id);
    }

    public function findByOrderNumber(string $orderNumber): ?Order
    {
        return Order::with(['items.product', 'payment'])->where('order_number', $orderNumber)->first();
    }

    public function create(array $data): Order
    {
        return Order::create($data);
    }

    public function update(Order $order, array $data): Order
    {
        $order->update($data);

        return $order->fresh(['items', 'payment']);
    }

    public function paginateForUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::with(['items.product'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function adminPaginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Order::with(['user', 'payment']);

        if (! empty($filters['status'])) {
            $statusMap = [
                'pending' => Pending::class,
                'processing' => Processing::class,
            ];
            $status = $statusMap[$filters['status']] ?? $filters['status'];
            $query->where('status', $status);
        }

        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('order_number', 'ilike', "%{$term}%")
                    ->orWhere('customer_email', 'ilike', "%{$term}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function stats(): array
    {
        return [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', Pending::class)->count(),
            'processing_orders' => Order::where('status', Processing::class)->count(),
            'total_revenue_kes' => (int) Order::whereNotNull('paid_at')->sum('total_kes'),
        ];
    }

    public function forReport(?string $from = null, ?string $to = null): Collection
    {
        $query = Order::with('items')->orderByDesc('created_at');

        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        return $query->get();
    }
}
