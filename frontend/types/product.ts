import type { Category } from './category';
import type { Tag } from './tag';

export type ProductType = 'physical' | 'digital';

export interface ProductMedia {
  id: string;
  key: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  stock: number;
  priceKes: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: ProductType;
  sku: string;
  stock: number;
  priceKes: number;
  priceDisplay?: number;
  currency?: string;
  isActive: boolean;
  isFeatured: boolean;
  category?: Category;
  tags?: Tag[];
  variants?: ProductVariant[];
  media?: ProductMedia[];
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
}
