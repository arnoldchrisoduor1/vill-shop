import { apiFetch } from './apiFetch';
import { normalizeCart } from './normalize';
import type { Cart } from '@/types/cart';

export async function getCart(): Promise<Cart> {
  const cart = await apiFetch<Record<string, unknown>>('/cart');
  return normalizeCart(cart);
}

export async function addToCart(productId: number, quantity = 1): Promise<Cart> {
  const cart = await apiFetch<Record<string, unknown>>('/cart/items', {
    method: 'POST',
    body: { product_id: productId, quantity },
  });
  return normalizeCart(cart);
}

export async function updateCartItem(itemId: number, quantity: number): Promise<Cart> {
  const cart = await apiFetch<Record<string, unknown>>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: { quantity },
  });
  return normalizeCart(cart);
}

export async function removeCartItem(itemId: number): Promise<Cart> {
  const cart = await apiFetch<Record<string, unknown>>(`/cart/items/${itemId}`, { method: 'DELETE' });
  return normalizeCart(cart);
}

export async function mergeCart(): Promise<Cart> {
  const cart = await apiFetch<Record<string, unknown>>('/cart/merge', { method: 'POST' });
  return normalizeCart(cart);
}
