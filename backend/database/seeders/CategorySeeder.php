<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Skincare', 'description' => 'Natural skincare products'],
            ['name' => 'Hair Care', 'description' => 'Hair oils and treatments'],
            ['name' => 'Wellness', 'description' => 'Wellness and supplements'],
            ['name' => 'Accessories', 'description' => 'Shop accessories'],
        ];

        foreach ($categories as $index => $category) {
            Category::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'is_active' => true,
                    'sort_order' => $index,
                ]
            );
        }
    }
}
