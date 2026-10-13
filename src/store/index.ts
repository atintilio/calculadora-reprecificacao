import { create } from 'zustand';
import type { Parametros, CarteiraMix } from '../types';
import { DEFAULT_PARAMETROS, DEFAULT_CARTEIRA } from '../types';

interface AppState {
  parametros: Parametros;
  carteira: CarteiraMix;
  activeTab: number;
  setParametros: (params: Partial<Parametros>) => void;
  setCarteira: (carteira: Partial<CarteiraMix>) => void;
  setActiveTab: (tab: number) => void;
  resetAll: () => void;
}

export const useStore = create<AppState>((set) => ({
  parametros: DEFAULT_PARAMETROS,
  carteira: DEFAULT_CARTEIRA,
  activeTab: 0,
  
  setParametros: (params) =>
    set((state) => ({
      parametros: { ...state.parametros, ...params },
    })),
  
  setCarteira: (carteira) =>
    set((state) => ({
      carteira: { ...state.carteira, ...carteira },
    })),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  resetAll: () =>
    set({
      parametros: DEFAULT_PARAMETROS,
      carteira: DEFAULT_CARTEIRA,
      activeTab: 0,
    }),
}));
