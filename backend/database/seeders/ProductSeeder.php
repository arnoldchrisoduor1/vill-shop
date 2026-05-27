<?php

namespace Database\Seeders;

use App\Helpers\Money;
use App\Models\Category;
use App\Models\Product;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::first();

        if (! $category) {
            return;
        }

        $products = [
            [
                'name' => 'Turquoise Glow Serum',
                'description' => 'Hydrating serum with natural botanical extracts.',
                'price_kes' => Money::toCents(2500),
                'sku' => 'VILL-SERUM-001',
                'stock' => 50,
                'is_featured' => true,
            ],
            [
                'name' => 'Green Tea Face Mask',
                'description' => 'Revitalizing face mask for all skin types.',
                'price_kes' => Money::toCents(1800),
                'sku' => 'VILL-MASK-001',
                'stock' => 30,
                'is_featured' => true,
            ],
            [
                'name' => 'Coconut Hair Oil',
                'description' => 'Cold-pressed coconut oil for healthy hair.',
                'price_kes' => Money::toCents(1200),
                'sku' => 'VILL-OIL-001',
                'stock' => 100,
                'is_featured' => false,
            ],
        ];

        $tag = Tag::firstOrCreate(
            ['slug' => 'bestseller'],
            ['name' => 'Bestseller']
        );

        foreach ($products as $data) {
            $product = Product::updateOrCreate(
                ['sku' => $data['sku']],
                [
                    ...$data,
                    'category_id' => $category->id,
                    'slug' => Str::slug($data['name']),
                    'is_active' => true,
                    'low_stock_threshold' => 5,
                ]
            );

            $product->tags()->syncWithoutDetaching([$tag->id]);
        }
    }
}
