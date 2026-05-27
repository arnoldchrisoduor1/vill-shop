import * as Sentry from '@sentry/nextjs';
import { env } from '@/config/env';

Sentry.init({
  dsn: env.sentryDsn || undefined,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  enabled: !!env.sentryDsn,
});
