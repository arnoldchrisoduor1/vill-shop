import { apiGet, apiPost, apiPatch, apiDelete, apiFetch } from './apiFetch';
import type { Cart } from '../../types';

export interface GuestCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export const cartApi = {
  getCart: () => apiGet<Cart>('/api/v1/cart'),
  addItem: (data: GuestCartItem) => apiPost<Cart>('/api/v1/cart/items', data),
  updateItem: (itemId: string, quantity: number) =>
    apiPatch<Cart>(`/api/v1/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => apiDelete<Cart>(`/api/v1/cart/items/${itemId}`),
  mergeCart: (items: GuestCartItem[]) => apiPost<Cart>('/api/v1/cart/merge', { items }),
  clearCart: () => apiDelete<null>('/api/v1/cart'),
};

export const getCart = () => apiFetch<Cart>('/api/v1/cart');

export const addItem = (payload: { productId: string; variantId?: string; quantity: number }) =>
  apiFetch<Cart>('/api/v1/cart/items', { method: 'POST', body: JSON.stringify(payload) });

export const updateItem = (itemId: string, quantity: number) =>
  apiFetch<Cart>(`/api/v1/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });

export const removeItem = (itemId: string) =>
  apiFetch<Cart>(`/api/v1/cart/items/${itemId}`, { method: 'DELETE' });

export const mergeCart = (guestItems: GuestCartItem[]) =>
  apiFetch<Cart>('/api/v1/cart/merge', {
    method: 'POST',
    body: JSON.stringify({ items: guestItems }),
  });
