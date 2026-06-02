'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { cartApi } from '../lib/api/cart';
import { loadGuestCart } from '../lib/hooks/useCartActions';
import { useCartStore } from '../lib/store/cartStore';
import { useWishlistStore } from '../lib/store/wishlistStore';
import { wishlistApi } from '../lib/api/wishlist';
import { useAuth } from './AuthContext';

interface CartContextValue {
  refetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function WishlistLoader() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      useWishlistStore.getState().setWishlist([]);
      return;
    }

    let cancelled = false;

    wishlistApi
      .getWishlist()
      .then((wishlist) => {
        if (!cancelled) {
          useWishlistStore
            .getState()
            .setWishlist(wishlist.products.map((p) => p.id));
        }
      })
      .catch(() => {
        if (!cancelled) useWishlistStore.getState().setWishlist([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return null;
}

function CartLoader() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      loadGuestCart();
      return;
    }

    let cancelled = false;

    cartApi
      .getCart()
      .then((cart) => {
        if (!cancelled) useCartStore.getState().setCart(cart.items ?? []);
      })
      .catch(() => {
        if (!cancelled) useCartStore.getState().setCart([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const refetchCart = useMemo(
    () => async () => {
      if (!user?.id) return;
      try {
        const cart = await cartApi.getCart();
        useCartStore.getState().setCart(cart.items ?? []);
      } catch {
        // Cart fetch failure is non-fatal
      }
    },
    [user?.id],
  );

  const contextValue = useMemo(() => ({ refetchCart }), [refetchCart]);

  return (
    <CartContext.Provider value={contextValue}>
      <CartLoader />
      <WishlistLoader />
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
