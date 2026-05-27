import { apiFetch } from './apiFetch';
import { normalizeProduct } from './normalize';
import type { Product } from '@/types/product';

interface WishlistItem {
  id: number;
  product: Record<string, unknown>;
}

export async function getWishlist(): Promise<Product[]> {
  const items = await apiFetch<WishlistItem[]>('/wishlist');
  return items.map((item) => normalizeProduct(item.product));
}

export async function addToWishlist(productId: number): Promise<void> {
  await apiFetch(`/wishlist/${productId}`, { method: 'POST' });
}

export async function removeFromWishlist(productId: number): Promise<void> {
  await apiFetch(`/wishlist/${productId}`, { method: 'DELETE' });
}
