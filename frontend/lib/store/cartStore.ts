import { create } from 'zustand';
import type { CartItem, Product, ProductVariant } from '../../types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setCart: (items: CartItem[]) => void;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotal: () => number;
  total: () => number;
  getItemCount: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  setCart: (items) => set({ items }),

  addItem: (product, quantity = 1, variant) => {
    set((state) => {
      const existing = state.items.find(
        (item) =>
          item.product.id === product.id &&
          item.variant?.id === variant?.id,
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item === existing
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          ),
        };
      }
      const newItem: CartItem = {
        id: `temp-${Date.now()}`,
        product,
        variant,
        quantity,
      };
      return { items: [...state.items, newItem] };
    });
  },

  removeItem: (itemId) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),

  updateQuantity: (itemId, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i,
      ),
    })),

  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => {
      const price = item.variant?.priceKes ?? item.product.priceKes;
      return sum + Number(price) * item.quantity;
    }, 0);
  },

  total: () => {
    const { items } = get();
    return items.reduce((sum, item) => {
      const price = item.variant?.priceKes ?? item.product.priceKes;
      return sum + Number(price) * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },

  itemCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
