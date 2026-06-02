import { apiGet, apiPost, apiDelete, apiFetch } from './apiFetch';
import type { Product } from '../../types';

export interface Wishlist {
  id: string;
  products: Product[];
}

export const wishlistApi = {
  getWishlist: () => apiGet<Wishlist>('/api/v1/wishlist'),
  addProduct: (productId: string) =>
    apiPost<Wishlist>('/api/v1/wishlist/products', { productId }),
  removeProduct: (productId: string) =>
    apiDelete<Wishlist>(`/api/v1/wishlist/products/${productId}`),
  syncWishlist: (productIds: string[]) =>
    apiPost<Wishlist>('/api/v1/wishlist/sync', { productIds }),
};

export const getWishlist = () =>
  apiFetch<Product[]>('/api/v1/wishlist');

export const addToWishlist = (productId: string) =>
  apiFetch<{ productId: string }>('/api/v1/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });

export const removeFromWishlist = (productId: string) =>
  apiFetch<null>(`/api/v1/wishlist/${productId}`, { method: 'DELETE' });

export const syncWishlist = (productIds: string[]) =>
  apiFetch<Product[]>('/api/v1/wishlist/sync', {
    method: 'POST',
    body: JSON.stringify({ productIds }),
  });
