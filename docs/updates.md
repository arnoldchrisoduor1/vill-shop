# Vill Shop — Updates & Backlog

Last updated: June 2026

---

## Done

### Storefront & checkout
- Product slug pages fetch fresh data (no stale cache after admin edits)
- Storefront products page: search, category tabs, grid/list toggle
- Cart and wishlist loaders fixed (no render-loop API spam)
- Checkout: cart cleared only after successful payment initiation
- Simulated Pesapal payments for local dev when keys are empty or `PESAPAL_SIMULATE=true`
- Account orders: "Complete Payment" for unpaid orders
- Account order detail page fixed (`useParams` for Next.js 14)

### Admin
- Admin orders API paths corrected (`/api/v1/orders/admin/all`)
- Admin products: search, category filters, grid/list toggle; includes inactive products
- Admin dashboard revenue from completed payments
- HTTP request logging via global interceptor (replaces noisy SQL/audit logs)
- TypeORM query logging disabled in dev

### Email notifications
- HTML email templates (order placed, payment success, receipt, shipped, delivered, status updates, account banned/unbanned, low stock)
- Event-driven mail listener wired to order lifecycle and user ban/unban events
- Receipt queued automatically after successful payment
- SMTP config via `SMTP_*`, `EMAIL_FROM_*`, `EMAIL_DRY_RUN`
- Admin email from `ADMIN_EMAIL` env var (not seeded)

### Auth & admin bootstrap
- Admin account created or promoted on startup from `ADMIN_EMAIL` + `ADMIN_PASSWORD`
- Seed script no longer creates a hardcoded admin user

---

## In progress / partially done

| Item | Status |
|------|--------|
| Review moderation (admin delete) | Backend API exists (`DELETE /api/v1/admin/reviews/:id`); admin UI not built |
| Low stock alerts | Email template + scheduler exist; verify thresholds in production |

---

## Backlog

### Admin — customers
- **Customer profile page** in admin Customers tab: order count, cart items, wishlist items, account details

### Admin — inventory
- Inventory page styled like products admin: search, filters, grid/list view

### Admin — reviews
- Review moderation UI: list reviews, delete inappropriate ones

### Auth & sessions
- **2FA**: 6-digit code emailed before login for all users
- **Access + refresh tokens** in localStorage (access 24h, refresh 7d) so sessions survive backend restarts; refresh endpoint to rotate access token

### Orders & inventory
- Decrement stock on **payment success**, not on order creation

### Feature flags & tax
- Fix feature flag toggles (tax, maintenance mode, digital products) — admin PATCH sends empty body; backend should call `toggle()` or accept `isEnabled`
- Per-product tax % on create/edit product forms
- When tax flag enabled, sum product tax values at checkout
- Maintenance mode: frontend maintenance page + countdown to scheduled end time

### Media & content
- Hero slides: fix MinIO image upload/update
- Homepage: richer Framer Motion animations

---

## Environment reference (email & admin)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM_ADDRESS=
EMAIL_FROM_NAME=Vill Shop
SMTP_USE_TLS=false
SMTP_USE_STARTTLS=true
EMAIL_DRY_RUN=true          # log emails without sending

ADMIN_EMAIL=arnoldchrisoduor@gmail.com
ADMIN_PASSWORD=             # required for new admin; defaults to "password" with warning
ADMIN_NAME=Admin
```

Set `EMAIL_DRY_RUN=false` when ready to send live emails.
