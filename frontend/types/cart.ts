import type { Product, ProductVariant } from './product';

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}
