<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'title' => 'Summer Launch Party',
                'description' => 'Join us for exclusive deals and live demos of new products.',
                'starts_at' => now()->addDays(14),
                'ends_at' => now()->addDays(14)->addHours(4),
                'location' => 'Nairobi, Kenya',
                'is_published' => true,
                'is_featured' => true,
            ],
            [
                'title' => 'Digital Products Workshop',
                'description' => 'Learn how to get the most from your digital purchases.',
                'starts_at' => now()->addDays(30),
                'ends_at' => now()->addDays(30)->addHours(2),
                'location' => 'Online',
                'is_published' => true,
                'is_featured' => false,
            ],
        ];

        foreach ($events as $event) {
            Event::updateOrCreate(
                ['slug' => Str::slug($event['title'])],
                array_merge($event, ['slug' => Str::slug($event['title'])])
            );
        }
    }
}
