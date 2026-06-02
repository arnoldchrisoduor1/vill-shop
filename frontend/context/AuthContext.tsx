'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../lib/api/auth';
import { cartApi } from '../lib/api/cart';
import { useCartStore } from '../lib/store/cartStore';
import { clearGuestCartStorage } from '../lib/hooks/useCartActions';
import type { User } from '../types';

const GUEST_CART_KEY = 'villshop_guest_cart';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const mergeCartAfterLogin = useCallback(async () => {
    let guestItems: { productId: string; variantId?: string; quantity: number }[] = [];
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          guestItems = parsed.map((item: { product: { id: string }; variant?: { id: string }; quantity: number }) => ({
            productId: item.product.id,
            variantId: item.variant?.id,
            quantity: item.quantity,
          }));
        }
      }
    } catch {
      clearGuestCartStorage();
    }

    try {
      if (guestItems.length > 0) {
        const merged = await cartApi.mergeCart(guestItems);
        useCartStore.getState().setCart(merged.items ?? []);
        clearGuestCartStorage();
      }
    } catch {
      // CartProvider loads server cart when user id is set
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      setUser(res.data.user);
      await mergeCartAfterLogin();
    },
    [mergeCartAfterLogin],
  );

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    setUser(res.data.user);
    await mergeCartAfterLogin();
  }, [mergeCartAfterLogin]);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    useCartStore.getState().setCart([]);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
