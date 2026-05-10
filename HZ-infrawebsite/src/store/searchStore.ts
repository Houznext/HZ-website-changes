import { create } from 'zustand';

export type HeroTab = 'Land' | 'Villa' | 'Apartment' | 'Plot';

interface SearchState {
  activeTab: HeroTab;
  query: string;
  setActiveTab: (t: HeroTab) => void;
  setQuery: (q: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  activeTab: 'Land',
  query: '',
  setActiveTab: (activeTab) => set({ activeTab }),
  setQuery: (query) => set({ query }),
}));
