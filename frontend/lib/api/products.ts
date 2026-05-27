import { apiFetch } from './apiFetch';
import { mapProductFilters, normalizeProduct } from './normalize';
import type { PaginatedResponse } from '@/types';
import type { Product, ProductFilters } from '@/types/product';
import type { ProductFormData } from '@/validators';

function normalizePaginated(response: PaginatedResponse<Record<string, unknown>>): PaginatedResponse<Product> {
  return {
    ...response,
    data: response.data.map((item) => normalizeProduct(item)),
  };
}

export async function getProducts(
  filters?: ProductFilters,
): Promise<PaginatedResponse<Product>> {
  const response = await apiFetch<PaginatedResponse<Record<string, unknown>>>('/products', {
    params: mapProductFilters(filters),
  });
  return normalizePaginated(response);
}

export async function getProduct(slug: string): Promise<Product> {
  const product = await apiFetch<Record<string, unknown>>(`/products/${slug}`);
  return normalizeProduct(product);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const response = await getProducts({ is_featured: true, per_page: 8 });
  return response.data;
}

export async function createProduct(data: ProductFormData | FormData): Promise<Product> {
  const product = await apiFetch<Record<string, unknown>>('/admin/products', {
    method: 'POST',
    body: data,
  });
  return normalizeProduct(product);
}

export async function updateProduct(
  id: number,
  data: ProductFormData | FormData,
): Promise<Product> {
  const product = await apiFetch<Record<string, unknown>>(`/admin/products/${id}`, {
    method: 'PUT',
    body: data,
  });
  return normalizeProduct(product);
}

export async function deleteProduct(id: number): Promise<void> {
  return apiFetch<void>(`/admin/products/${id}`, { method: 'DELETE' });
}

export async function getAdminProducts(
  filters?: ProductFilters,
): Promise<PaginatedResponse<Product>> {
  const response = await apiFetch<PaginatedResponse<Record<string, unknown>>>('/admin/products', {
    params: mapProductFilters(filters),
  });
  return normalizePaginated(response);
}
