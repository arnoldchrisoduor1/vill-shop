import type { Product } from './product';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: number;
  product_id: number;
  product_name?: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  total?: number;
  is_digital?: boolean;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount?: number;
  total: number;
  currency: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address?: ShippingAddress;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}
