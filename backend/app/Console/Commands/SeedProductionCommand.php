<?php

namespace App\Console\Commands;

use Database\Seeders\CategorySeeder;
use Database\Seeders\FeatureFlagSeeder;
use Database\Seeders\ProductSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Console\Command;

class SeedProductionCommand extends Command
{
    protected $signature = 'vill-shop:seed-production {--force : Force in production}';

    protected $description = 'Seed production database with admin user, categories, products, and feature flags';

    public function handle(): int
    {
        if (app()->environment('production') && ! $this->option('force')) {
            $this->error('Use --force to seed in production.');

            return self::FAILURE;
        }

        $this->call('db:seed', ['--class' => UserSeeder::class]);
        $this->call('db:seed', ['--class' => FeatureFlagSeeder::class]);
        $this->call('db:seed', ['--class' => CategorySeeder::class]);
        $this->call('db:seed', ['--class' => ProductSeeder::class]);

        $this->info('Production seed completed.');

        return self::SUCCESS;
    }
}
