<?php

namespace Database\Seeders;

use App\Models\FeatureFlag;
use Illuminate\Database\Seeder;

class FeatureFlagSeeder extends Seeder
{
    public function run(): void
    {
        $flags = [
            [
                'key' => 'tax',
                'enabled' => true,
                'payload' => ['rate' => 16],
                'description' => 'Enable VAT/tax on orders',
            ],
            [
                'key' => 'reviews',
                'enabled' => true,
                'payload' => null,
                'description' => 'Enable product reviews',
            ],
            [
                'key' => 'wishlist',
                'enabled' => true,
                'payload' => null,
                'description' => 'Enable wishlist feature',
            ],
            [
                'key' => 'newsletter',
                'enabled' => true,
                'payload' => null,
                'description' => 'Enable newsletter signup',
            ],
            [
                'key' => 'events',
                'enabled' => true,
                'payload' => null,
                'description' => 'Enable events section',
            ],
        ];

        foreach ($flags as $flag) {
            FeatureFlag::updateOrCreate(['key' => $flag['key']], $flag);
        }
    }
}
