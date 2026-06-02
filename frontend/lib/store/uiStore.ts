import { create } from 'zustand';

interface UiStore {
  currency: string;
  isNavOpen: boolean;
  setCurrency: (currency: string) => void;
  toggleNav: () => void;
  closeNav: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  currency: 'KES',
  isNavOpen: false,

  setCurrency: (currency) => set({ currency }),
  toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen })),
  closeNav: () => set({ isNavOpen: false }),
}));
