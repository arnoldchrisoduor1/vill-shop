import { apiGet, apiPatch, apiDelete, apiFetch } from './apiFetch';
import type { Product, PaginatedResponse } from '../../types';

export interface ProductFilters {
  q?: string;
  category?: string;
  tags?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  featured?: boolean;
  sort?: string;
  currency?: string;
  cursor?: string;
  limit?: number;
}

function buildQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      params.set(key, String(val));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const productsApi = {
  getAll: (filters: ProductFilters = {}) =>
    apiGet<PaginatedResponse<Product>>(`/api/v1/products${buildQuery(filters)}`),

  adminGetAll: (filters: ProductFilters = {}) =>
    apiGet<PaginatedResponse<Product>>(`/api/v1/products/admin/list${buildQuery(filters)}`),

  getById: (id: string) => apiGet<Product>(`/api/v1/products/manage/${id}`),

  getBySlug: (slug: string, currency?: string) =>
    apiGet<Product>(`/api/v1/products/${slug}${currency ? `?currency=${currency}` : ''}`),

  create: (data: FormData) =>
    apiFetch<Product>('/api/v1/products', { method: 'POST', body: data }),

  update: (id: string, data: FormData | object) =>
    apiFetch<Product>(`/api/v1/products/${id}`, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  delete: (id: string) => apiDelete<null>(`/api/v1/products/${id}`),

  toggleFeatured: (id: string) =>
    apiPatch<Product>(`/api/v1/products/${id}/featured`),

  toggleActive: (id: string) =>
    apiPatch<Product>(`/api/v1/products/${id}/active`),
};

// Standalone function exports for compatibility
export const getProducts = (filters: ProductFilters = {}) =>
  apiFetch<PaginatedResponse<Product>>(`/api/v1/products${buildQuery(filters)}`);

export const getProduct = (slug: string) =>
  apiFetch<Product>(`/api/v1/products/${slug}`);

export const getFeaturedProducts = () =>
  apiFetch<PaginatedResponse<Product>>('/api/v1/products?isFeatured=true&limit=8');

export const adminGetProducts = (filters: ProductFilters = {}) =>
  apiFetch<PaginatedResponse<Product>>(`/api/v1/admin/products${buildQuery(filters)}`);

export const adminGetProduct = (id: string) =>
  apiFetch<Product>(`/api/v1/admin/products/${id}`);

export const adminCreateProduct = (data: FormData) =>
  apiFetch<Product>('/api/v1/admin/products', { method: 'POST', body: data });

export const adminUpdateProduct = (id: string, data: FormData) =>
  apiFetch<Product>(`/api/v1/admin/products/${id}`, { method: 'PATCH', body: data });

export const adminDeleteProduct = (id: string) =>
  apiFetch<null>(`/api/v1/admin/products/${id}`, { method: 'DELETE' });

export const adminToggleFeatured = (id: string, isFeatured: boolean) =>
  apiFetch<Product>(`/api/v1/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isFeatured }),
  });

export const adminToggleActive = (id: string, isActive: boolean) =>
  apiFetch<Product>(`/api/v1/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });

export const adminUpdateStock = (id: string, stock: number) =>
  apiFetch<Product>(`/api/v1/admin/products/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  });
