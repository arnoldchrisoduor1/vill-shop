export interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  is_primary: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  stock: number;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  is_new: boolean;
  is_on_sale: boolean;
  images: ProductImage[];
  average_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  is_on_sale?: boolean;
  is_new?: boolean;
  sort?: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
  page?: number;
  per_page?: number;
}
