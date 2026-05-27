import type { Product } from './product';

export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  item_count: number;
}
