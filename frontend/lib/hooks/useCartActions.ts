'use client';

import { useCallback } from 'react';
import { cartApi } from '../api/cart';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../../context/AuthContext';
import type { CartItem, Product, ProductVariant } from '../../types';

const GUEST_CART_KEY = 'villshop_guest_cart';

function readGuestCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadGuestCart() {
  const items = readGuestCartFromStorage();
  useCartStore.getState().setCart(items);
}

export function persistGuestCart() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(useCartStore.getState().items));
}

export function clearGuestCartStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
}

function guestItemsPayload(items: CartItem[]) {
  return items.map((item) => ({
    productId: item.product.id,
    variantId: item.variant?.id,
    quantity: item.quantity,
  }));
}

export function useCartActions() {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user?.id);
  const addItem = useCartStore((state) => state.addItem);
  const setCart = useCartStore((state) => state.setCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const addToCart = useCallback(
    async (product: Product, quantity = 1, variant?: ProductVariant) => {
      if (isLoggedIn) {
        await cartApi.addItem({
          productId: product.id,
          variantId: variant?.id,
          quantity,
        });
        const cart = await cartApi.getCart();
        setCart(cart.items ?? []);
      } else {
        addItem(product, quantity, variant);
        persistGuestCart();
      }
    },
    [isLoggedIn, addItem, setCart],
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      if (isLoggedIn) {
        const cart = await cartApi.removeItem(itemId);
        setCart(cart.items ?? []);
      } else {
        removeItem(itemId);
        persistGuestCart();
      }
    },
    [isLoggedIn, removeItem, setCart],
  );

  const updateCartQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) {
        if (isLoggedIn) {
          const cart = await cartApi.removeItem(itemId);
          setCart(cart.items ?? []);
        } else {
          removeItem(itemId);
          persistGuestCart();
        }
        return;
      }
      if (isLoggedIn) {
        const cart = await cartApi.updateItem(itemId, quantity);
        setCart(cart.items ?? []);
      } else {
        updateQuantity(itemId, quantity);
        persistGuestCart();
      }
    },
    [isLoggedIn, removeItem, updateQuantity, setCart],
  );

  /** Merge only pre-login guest cart from localStorage — never re-merge server items. */
  const syncGuestCartToServer = useCallback(async () => {
    if (!isLoggedIn) return;

    const guestItems = readGuestCartFromStorage();
    if (guestItems.length > 0) {
      const cart = await cartApi.mergeCart(guestItemsPayload(guestItems));
      setCart(cart.items ?? []);
      clearGuestCartStorage();
      return;
    }

    const cart = await cartApi.getCart();
    setCart(cart.items ?? []);
  }, [isLoggedIn, setCart]);

  return { addToCart, removeFromCart, updateCartQuantity, syncGuestCartToServer };
}
