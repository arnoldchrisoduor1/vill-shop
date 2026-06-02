import { create } from 'zustand';

interface WishlistStore {
  productIds: string[];
  setWishlist: (productIds: string[]) => void;
  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  toggle: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  productIds: [],

  setWishlist: (productIds) => set({ productIds }),

  addProduct: (productId) =>
    set((state) => ({
      productIds: state.productIds.includes(productId)
        ? state.productIds
        : [...state.productIds, productId],
    })),

  removeProduct: (productId) =>
    set((state) => ({
      productIds: state.productIds.filter((id) => id !== productId),
    })),

  toggle: (productId) => {
    const { productIds } = get();
    if (productIds.includes(productId)) {
      set({ productIds: productIds.filter((id) => id !== productId) });
    } else {
      set({ productIds: [...productIds, productId] });
    }
  },

  isInWishlist: (productId) => get().productIds.includes(productId),
}));
