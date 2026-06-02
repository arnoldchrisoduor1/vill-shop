export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export const CURRENCIES = [
  { code: 'KES', label: 'KES - Kenyan Shilling', symbol: 'KSh' },
  { code: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { code: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { code: 'GBP', label: 'GBP - British Pound', symbol: '£' },
];

export const ORDER_STATES = [
  'PENDING',
  'AWAITING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

export const ORDER_STATE_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  AWAITING_PAYMENT: 'Awaiting Payment',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export const DEFAULT_CURRENCY = 'KES';
export const ITEMS_PER_PAGE = 12;
export const DEBOUNCE_MS = 300;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export const PRODUCT_TYPES = [
  { value: '', label: 'All Products' },
  { value: 'physical', label: 'Physical' },
  { value: 'digital', label: 'Digital' },
];
