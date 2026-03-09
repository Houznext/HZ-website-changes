import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SolarQuote } from '@/utils/solar/solarCalculations';

interface SolarStoreState {
    quote: SolarQuote | null;
    setQuote: (quote: SolarQuote) => void;
    clearQuote: () => void;
}

export const useSolarStore = create<SolarStoreState>()(
    persist(
        (set) => ({
            quote: null,
            setQuote: (quote) => set({ quote }),
            clearQuote: () => set({ quote: null }),
        }),
        {
            name: 'solar-storage', // name of the item in the storage (must be unique)
        }
    )
);
