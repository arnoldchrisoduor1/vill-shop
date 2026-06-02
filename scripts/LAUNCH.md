# Vill Shop — Production Launch Checklist

## Pre-Launch

- [ ] DNS records point to CloudFront / ALB
- [ ] ACM certificates validated
- [ ] AWS Secrets Manager populated (JWT_SECRET, SMTP_*, PESAPAL_*, DB_PASSWORD, REDIS_*, AWS_*)
- [ ] RDS PostgreSQL Multi-AZ enabled with daily snapshots
- [ ] ElastiCache Redis cluster running
- [ ] S3 bucket + CloudFront distribution configured
- [ ] ECS services deployed (`vill-shop-api`, `vill-shop-frontend`)
- [ ] CloudWatch alarms: CPU, error rate, queue depth

## Launch Day

1. Run migrations:
   ```bash
   # via ECS exec or CI pipeline
   npm run migration:run
   ```

2. Seed production DB:
   ```bash
   npm run seed
   ```

3. Smoke test:
   ```bash
   ./scripts/smoke-test.sh https://api.villshop.com
   ```

4. Test critical path manually:
   - Browse products → add to cart → checkout → Pesapal payment → receipt email

5. Enable monitoring alerts

6. DNS cutover

## Post-Launch

- [ ] Verify BullMQ workers processing jobs (Bull Board at `/admin/queues`)
- [ ] Verify exchange rate scheduler running (check `exchange_rates` table daily)
- [ ] Verify Mailpit replaced with production SMTP (Brevo/Gmail)
- [ ] Verify Sentry receiving errors
- [ ] Monitor CloudWatch for 24h
- [ ] Change default admin password

## Useful Commands

```bash
# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration
npm run migration:generate -- src/database/migrations/MyMigration

# Seed database
npm run seed

# Health check
curl https://api.villshop.com/api/v1/health
```
