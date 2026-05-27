# AWS Infrastructure — Vill Shop

## Architecture

- **ECS Fargate** — 3 services: `vill-shop-api`, `vill-shop-horizon`, `vill-shop-frontend`
- **RDS PostgreSQL 16** — Multi-AZ, `db.t3.medium`
- **ElastiCache Redis 7** — cluster mode
- **S3** — media + digital product files
- **CloudFront** — CDN for static assets and product images
- **ACM** — SSL for `villshop.com` and `api.villshop.com`
- **Secrets Manager** — all production secrets
- **ECR** — `vill-shop-backend`, `vill-shop-frontend`

## ECS Services

| Service | Image | Port | Notes |
|---|---|---|---|
| vill-shop-api | vill-shop-backend | 80 (nginx) | 2+ tasks, auto-scaling |
| vill-shop-horizon | vill-shop-backend | — | `php artisan horizon` |
| vill-shop-frontend | vill-shop-frontend | 3000 | 2+ tasks |

## Required Secrets (Secrets Manager)

```
vill-shop/production:
  JWT_SECRET
  DB_PASSWORD
  RESEND_KEY
  PESAPAL_CONSUMER_KEY
  PESAPAL_CONSUMER_SECRET
  SENTRY_LARAVEL_DSN
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
```

## CloudWatch Alarms

| Alarm | Metric | Threshold |
|---|---|---|
| API CPU High | ECS CPUUtilization | > 80% for 5 min |
| API Error Rate | ALB HTTPCode_Target_5XX | > 10 in 5 min |
| Queue Depth | Horizon queue size | > 100 for 10 min |
| RDS Storage | FreeStorageSpace | < 5 GB |

## Deployment

Images pushed via GitHub Actions on merge to `main`.
ECS services use `--force-new-deployment` to pull latest images.

## Scheduler (ECS Scheduled Task)

Run every minute:
```
php artisan schedule:run
```

Tasks:
- Daily: exchange rate fetch, stale cart cleanup
- Hourly: low stock sweep
