# Vill Shop — Production Launch Checklist

## Pre-Launch

- [ ] DNS records point to CloudFront / ALB
- [ ] ACM certificates validated
- [ ] AWS Secrets Manager populated (JWT, Resend, Pesapal, DB, Redis)
- [ ] RDS Multi-AZ enabled with daily snapshots
- [ ] ElastiCache Redis cluster running
- [ ] S3 bucket + CloudFront distribution configured
- [ ] ECS services deployed (api, horizon, frontend)
- [ ] CloudWatch alarms: CPU, error rate, queue depth

## Launch Day

1. Run migrations: `php artisan migrate --force`
2. Seed production: `./scripts/seed-production.sh`
3. Smoke test: `./scripts/smoke-test.sh https://api.villshop.com`
4. Test critical path manually:
   - Browse products → add to cart → checkout → Pesapal payment → receipt email
5. Enable monitoring alerts
6. DNS cutover

## Post-Launch

- [ ] Verify Horizon processing jobs
- [ ] Verify exchange rate scheduler running
- [ ] Verify Sentry receiving errors
- [ ] Monitor CloudWatch for 24h
