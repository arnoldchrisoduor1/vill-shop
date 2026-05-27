<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class ProductRepository
{
    private const CACHE_TAG = 'products';

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $cacheKey = 'products.list.'.md5(json_encode($filters).$perPage);

        return $this->remember($cacheKey, fn () => $this->buildQuery($filters)->paginate($perPage));
    }

    public function findById(int $id): ?Product
    {
        return $this->remember("products.{$id}", fn () => Product::with(['category', 'tags', 'variants', 'media'])->find($id));
    }

    public function findBySlug(string $slug): ?Product
    {
        return $this->remember("products.slug.{$slug}", fn () => Product::with(['category', 'tags', 'variants', 'media'])
            ->where('slug', $slug)
            ->first());
    }

    public function create(array $data): Product
    {
        $product = Product::create($data);
        $this->flushCache();

        return $product;
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);
        $this->flushCache();

        return $product->fresh(['category', 'tags', 'variants', 'media']);
    }

    public function delete(Product $product): void
    {
        $product->delete();
        $this->flushCache();
    }

    public function syncTags(Product $product, array $tagIds): void
    {
        $product->tags()->sync($tagIds);
        $this->flushCache();
    }

    public function flushCache(): void
    {
        if ($this->supportsTags()) {
            Cache::tags([self::CACHE_TAG])->flush();
        }
    }

    private function remember(string $key, callable $callback, int $ttl = 300): mixed
    {
        if ($this->supportsTags()) {
            return Cache::tags([self::CACHE_TAG])->remember($key, $ttl, $callback);
        }

        return $callback();
    }

    private function supportsTags(): bool
    {
        $store = config('cache.default');
        $driver = config("cache.stores.{$store}.driver");

        return in_array($driver, ['redis', 'memcached', 'octane'], true);
    }

    private function buildQuery(array $filters): Builder
    {
        $query = Product::query()
            ->with(['category', 'tags'])
            ->where('is_active', true);

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['category_slug'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $filters['category_slug']));
        }

        if (! empty($filters['tag'])) {
            $query->whereHas('tags', fn ($q) => $q->where('slug', $filters['tag']));
        }

        if (! empty($filters['featured'])) {
            $query->where('is_featured', filter_var($filters['featured'], FILTER_VALIDATE_BOOLEAN));
        }

        if (! empty($filters['min_price'])) {
            $query->where('price_kes', '>=', (int) $filters['min_price']);
        }

        if (! empty($filters['max_price'])) {
            $query->where('price_kes', '<=', (int) $filters['max_price']);
        }

        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->whereRaw('name % ?', [$term])
                    ->orWhereRaw('description % ?', [$term])
                    ->orWhere('name', 'ilike', "%{$term}%")
                    ->orWhere('sku', 'ilike', "%{$term}%");
            })->orderByRaw('similarity(name, ?) DESC', [$term]);
        } else {
            $sort = $filters['sort'] ?? 'created_at';
            $direction = $filters['direction'] ?? 'desc';
            $query->orderBy($sort, $direction);
        }

        return $query;
    }

    public function adminPaginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Product::query()->with(['category', 'tags']);

        if (! empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('name', 'ilike', "%{$term}%")
                    ->orWhere('sku', 'ilike', "%{$term}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function lockForUpdate(int $productId): Product
    {
        return Product::lockForUpdate()->findOrFail($productId);
    }

    public function lowStockProducts(): \Illuminate\Database\Eloquent\Collection
    {
        return Product::whereColumn('stock', '<=', 'low_stock_threshold')
            ->where('is_active', true)
            ->get();
    }
}
