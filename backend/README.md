# Vill Shop Backend

Laravel 11 API for the Vill Shop ecommerce platform.

## Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Configure PostgreSQL in `.env`, then:

```bash
php artisan migrate
php artisan db:seed
# or for production:
php artisan vill-shop:seed-production --force
```

## Development

```bash
php artisan serve
php artisan queue:work
php artisan horizon
```

## Testing

Requires PostgreSQL test database `vill_shop_test`:

```bash
php artisan test
```

## Docker

```bash
docker build -t vill-shop-api .
```

Use with `docker/nginx.conf` for nginx + php-fpm.

## API

All endpoints are prefixed with `/api/v1`. Webhooks at `/api/webhooks/pesapal`.

Prices are stored as integer KES cents (`price_kes`). Use the `Money` helper for conversions.
