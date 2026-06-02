# Vill Shop — Decisions Log

1. For search, use native PostgreSQL pg_trgm instead of third-party tools.

2. Webhook handler implemented for Pesapal payment notifications.

3. Order state machine implemented with explicit transitions via OrderStateService.

4. Stock locking implemented using TypeORM QueryRunner with `pessimistic_write` lock to prevent overselling.

5. JWT for auth — issued as httpOnly cookie for security.

6. Throttling per route group via @nestjs/throttler.

7. Testing: Jest + Supertest for backend (unit + integration), Playwright for frontend e2e.

8. Tax feature controlled via feature flags. Admin can toggle tax on/off from the admin panel. Tax amount stored separately on orders and never recomputed after creation.

9. Email: Nodemailer with free SMTP (local: Mailpit, production: Brevo 300/day free tier or Gmail SMTP app password). No paid service required.

10. UI primary color: turquoise blue (#00b5b8), secondary: green (#22c55e). All colors and fonts as CSS variables in globals.css.

11. All UI components (Button, Card, Input, Toggle, etc.) from a single design system at components/ui/. No one-off inline variants.

12. Framer Motion for all animations and transitions.

13. Lucide icons only — no raw SVGs.

14. Multi-currency: prices stored in KES (base), converted at display time using exchange rates fetched daily from exchangerate.host (free, no CC required).

15. Backend: NestJS 10, TypeScript strict, TypeORM, PostgreSQL, BullMQ (replaces Laravel/PHP).
