<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class ProductService
{
    public function __construct(private ProductRepository $products) {}

    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->products->paginate($filters, $perPage);
    }

    public function show(int $id): ?Product
    {
        return $this->products->findById($id);
    }

    public function showBySlug(string $slug): ?Product
    {
        return $this->products->findBySlug($slug);
    }

    public function create(array $data, array $tagIds = []): Product
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $product = $this->products->create($data);

        if ($tagIds) {
            $this->products->syncTags($product, $tagIds);
        }

        return $this->products->findById($product->id);
    }

    public function update(Product $product, array $data, ?array $tagIds = null): Product
    {
        if (isset($data['name']) && ! isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $product = $this->products->update($product, $data);

        if ($tagIds !== null) {
            $this->products->syncTags($product, $tagIds);
        }

        return $this->products->findById($product->id);
    }

    public function delete(Product $product): void
    {
        $this->products->delete($product);
    }

    public function adminList(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->products->adminPaginate($filters, $perPage);
    }
}
