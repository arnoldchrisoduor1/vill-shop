'use client';

import { useCallback } from 'react';
import { wishlistApi } from '../api/wishlist';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export function useIsInWishlist(productId: string): boolean {
  return useWishlistStore((state) => state.productIds.includes(productId));
}

export function useWishlistActions() {
  const { user } = useAuth();
  const toggle = useWishlistStore((state) => state.toggle);
  const addProduct = useWishlistStore((state) => state.addProduct);
  const removeProduct = useWishlistStore((state) => state.removeProduct);
  const setWishlist = useWishlistStore((state) => state.setWishlist);

  const toggleWishlist = async (productId: string) => {
    const wasInList = useWishlistStore.getState().productIds.includes(productId);

    if (user) {
      try {
        if (wasInList) {
          await wishlistApi.removeProduct(productId);
          removeProduct(productId);
          toast.success('Removed from wishlist');
        } else {
          await wishlistApi.addProduct(productId);
          addProduct(productId);
          toast.success('Added to wishlist');
        }
      } catch (err: unknown) {
        toast.error((err as Error).message || 'Wishlist update failed');
      }
    } else {
      toggle(productId);
      toast.success(wasInList ? 'Removed from wishlist' : 'Added to wishlist');
    }
  };

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const wishlist = await wishlistApi.getWishlist();
      setWishlist(wishlist.products.map((p) => p.id));
    } catch {
      setWishlist([]);
    }
  }, [user, setWishlist]);

  return { toggleWishlist, loadWishlist };
}
