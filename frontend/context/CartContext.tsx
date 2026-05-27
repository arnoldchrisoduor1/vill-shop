'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import * as cartApi from '@/lib/api/cart';
import { useCartStore } from '@/lib/store/cartStore';
import type { Product } from '@/types/product';

interface CartContextValue {
  isSyncing: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const store = useCartStore();

  const syncCart = useCallback(async () => {
    setIsSyncing(true);
    try {
      const cart = await cartApi.getCart();
      store.setItems(cart.items);
    } catch {
      // Guest cart stays local
    } finally {
      setIsSyncing(false);
    }
  }, [store]);

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  const addToCart = useCallback(
    async (product: Product, quantity = 1) => {
      store.addItem(product, quantity);
      store.openDrawer();
      try {
        const cart = await cartApi.addToCart(product.id, quantity);
        store.setItems(cart.items);
        toast.success(`${product.name} added to cart`);
      } catch {
        toast.success(`${product.name} added to cart`);
      }
    },
    [store],
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      store.updateQuantity(productId, quantity);
      const item = store.items.find((i) => i.product_id === productId);
      if (!item?.id) return;

      try {
        const cart = await cartApi.updateCartItem(item.id, quantity);
        store.setItems(cart.items);
      } catch {
        // Local update persists
      }
    },
    [store],
  );

  const removeFromCart = useCallback(
    async (productId: number) => {
      const item = store.items.find((i) => i.product_id === productId);
      store.removeItem(productId);

      if (!item?.id) {
        toast.success('Item removed from cart');
        return;
      }

      try {
        const cart = await cartApi.removeCartItem(item.id);
        store.setItems(cart.items);
        toast.success('Item removed from cart');
      } catch {
        toast.success('Item removed from cart');
      }
    },
    [store],
  );

  const value = useMemo(
    () => ({ isSyncing, addToCart, updateQuantity, removeFromCart, syncCart }),
    [isSyncing, addToCart, updateQuantity, removeFromCart, syncCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
