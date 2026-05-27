<?php

namespace Database\Seeders;

use App\Models\HeroSlide;
use Illuminate\Database\Seeder;

class HeroSlideSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            [
                'headline' => 'Welcome to Vill Shop',
                'subtext' => 'Discover premium products at unbeatable prices',
                'cta_label' => 'Shop Now',
                'cta_url' => '/products',
                'image_path' => 'https://images.unsplash.com/photo-1441986300917-6466bd60d0b8?w=1600',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'headline' => 'Summer Sale',
                'subtext' => 'Up to 40% off selected items',
                'cta_label' => 'View Sale',
                'cta_url' => '/products?tags=sale',
                'image_path' => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600',
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($slides as $slide) {
            HeroSlide::updateOrCreate(
                ['headline' => $slide['headline']],
                $slide
            );
        }
    }
}
