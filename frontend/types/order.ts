import type { Payment } from './payment';

export type OrderState =
  | 'PENDING'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  variantName?: string;
  quantity: number;
  priceKes: number;
  priceDisplay: number;
  currency: string;
  digitalFileKey?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  state: OrderState;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  shippingAddress?: Record<string, string>;
  trackingNumber?: string;
  items: OrderItem[];
  payment?: Payment;
  user?: { name: string; email: string };
  createdAt: string;
}
