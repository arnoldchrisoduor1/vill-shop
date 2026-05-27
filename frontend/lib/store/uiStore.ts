import { create } from 'zustand';

interface UiState {
  mobileMenuOpen: boolean;
  filterDrawerOpen: boolean;
  currency: string;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setFilterDrawerOpen: (open: boolean) => void;
  toggleFilterDrawer: () => void;
  setCurrency: (currency: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileMenuOpen: false,
  filterDrawerOpen: false,
  currency: 'KES',

  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setFilterDrawerOpen: (filterDrawerOpen) => set({ filterDrawerOpen }),
  toggleFilterDrawer: () =>
    set((s) => ({ filterDrawerOpen: !s.filterDrawerOpen })),
  setCurrency: (currency) => set({ currency }),
}));
