#!/usr/bin/env bash
set -euo pipefail

echo "Seeding production database..."

php artisan migrate --force
php artisan db:seed --class=FeatureFlagSeeder --force
php artisan db:seed --class=CategorySeeder --force
php artisan db:seed --class=ProductSeeder --force
php artisan db:seed --class=EventSeeder --force
php artisan db:seed --class=HeroSlideSeeder --force
php artisan db:seed --class=UserSeeder --force

echo "Production seed complete."
echo "Admin: ${ADMIN_EMAIL:-admin@villshop.local}"
