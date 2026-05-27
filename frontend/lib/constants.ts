export const CURRENCY_COOKIE = 'vill_currency';
export const DEFAULT_CURRENCY = 'KES';
export const AUTH_COOKIE = 'token';
export const ROLE_COOKIE = 'role';
export const PAGEVIEW_COOKIE = 'last_pageview';

export const SUPPORTED_CURRENCIES = ['KES', 'USD', 'EUR'] as const;

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export const PRODUCT_CATEGORIES = [
  'electronics',
  'fashion',
  'home',
  'beauty',
  'sports',
  'books',
  'food',
  'other',
] as const;

export const ADMIN_ROLES = ['admin', 'super_admin'] as const;
