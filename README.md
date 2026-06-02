# Vill Shop

Single-vendor ecommerce platform — physical + digital products, multi-currency, Pesapal payments.

## Stack

| Layer | Tech |
|---|---|
| Backend | NestJS 10, TypeScript strict, TypeORM |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7 + BullMQ |
| Storage | MinIO (local) / S3 (prod) |
| Email | Nodemailer + Mailpit (local) |
| Payments | Pesapal |
| E2E Testing | Playwright |
| Unit Testing | Jest + Supertest |

## Quick Start (Docker)

```bash
cp .env.example .env

docker compose up -d

# Run DB migrations
docker compose exec nest-api npm run migration:run

# Seed the database (admin user, categories, feature flags)
docker compose exec nest-api npm run seed
```

- **Storefront:** http://localhost:3000
- **API:** http://localhost:8081/api/v1
- **Mailpit:** http://localhost:8025
- **MinIO Console:** http://localhost:9001
- **Bull Board (queues):** http://localhost:8081/admin/queues

### Default Admin

```
Email: admin@villshop.local
Password: password
```

> Change this immediately in production.

## Project Structure

```
vill-shop/
├── backend/          NestJS 10 API
│   └── src/
│       ├── auth/
│       ├── products/
│       ├── cart/
│       ├── orders/
│       ├── payments/
│       ├── users/
│       ├── reviews/
│       ├── wishlist/
│       ├── events/
│       ├── hero-slides/
│       ├── feature-flags/
│       ├── inventory/
│       ├── newsletter/
│       ├── stats/
│       ├── reports/
│       ├── mail/
│       ├── storage/
│       ├── jobs/
│       ├── health/
│       ├── common/
│       └── database/
├── frontend/         Next.js 14 App Router
├── infrastructure/   AWS deployment configs
├── scripts/          Launch & smoke test scripts
└── docker-compose.yml
```

## Development

```bash
# Run everything locally
docker compose up -d

# Backend only (with hot reload)
cd backend && npm run start:dev

# Frontend only
cd frontend && npm run dev

# Backend tests
cd backend && npm run test
cd backend && npm run test:e2e

# E2E tests (Playwright)
cd frontend && npx playwright test
cd frontend && npx playwright test --ui   # interactive mode
```

## Production Launch

See [scripts/LAUNCH.md](scripts/LAUNCH.md) for the full go-live checklist.

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `backend.yml` — Lint, Jest tests, ECR push, ECS deploy
- `frontend.yml` — Lint, build, ECR push, ECS deploy
- `e2e.yml` — Playwright tests on pull requests

## License

MIT
