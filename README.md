# Vill Shop

Single-vendor ecommerce platform — physical + digital products, multi-currency, Pesapal payments.

## Stack

| Layer | Tech |
|---|---|
| Backend | Laravel 11, PHP 8.3, JWT, Horizon |
| Frontend | Next.js 14, TypeScript, Tailwind |
| Database | PostgreSQL |
| Cache/Queue | Redis |
| Storage | MinIO (local) / S3 (prod) |
| Email | Resend + Mailpit (local) |
| Payments | Pesapal |

## Quick Start (Docker)

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

docker compose up -d
docker compose exec php-fpm composer install
docker compose exec php-fpm php artisan key:generate
docker compose exec php-fpm php artisan migrate --seed
```

- **Storefront:** http://localhost:3000
- **API:** http://localhost:8081/api/v1
- **Mailpit:** http://localhost:8026 (SMTP on host port 1026 if 1025 is taken)
- **MinIO Console:** http://localhost:9001

### Default Admin

```
Email: admin@villshop.local
Password: password (change in production)
```

## Project Structure

```
vill-shop/
├── backend/          Laravel 11 API
├── frontend/         Next.js 14 App Router
├── infrastructure/   AWS deployment configs
├── scripts/          Launch & smoke test scripts
└── docker-compose.yml
```

## Development

```bash
# Backend tests
cd backend && php artisan test

# Frontend
cd frontend && npm run dev
cd frontend && npm run build
```

## Production Launch

See [scripts/LAUNCH.md](scripts/LAUNCH.md) for the full go-live checklist.

```bash
./scripts/smoke-test.sh https://api.villshop.com
./scripts/seed-production.sh
```

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `backend.yml` — Pint, Pest, ECR push, ECS deploy
- `frontend.yml` — Lint, build, ECR push, ECS deploy

## License

MIT
