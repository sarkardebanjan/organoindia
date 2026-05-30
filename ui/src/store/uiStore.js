import { create } from 'zustand';
import { CITIES } from '../utils/constants';

export const useUiStore = create((set) => ({
  city: CITIES[0],
  cartDrawerOpen: false,
  searchOpen: false,
  setCity: (city) => set({ city }),
  openCartDrawer: () => set({ cartDrawerOpen: true }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
}));
