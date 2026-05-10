import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedState {
  ids: string[];
  toggle: (propertyId: string) => void;
  has: (propertyId: string) => boolean;
}

export const useSavedStore = create(
  persist<SavedState>(
    (set, get) => ({
      ids: [],
      toggle: (propertyId) =>
        set((s) => ({
          ids: s.ids.includes(propertyId)
            ? s.ids.filter((id) => id !== propertyId)
            : [...s.ids, propertyId],
        })),
      has: (propertyId) => get().ids.includes(propertyId),
    }),
    { name: 'hz-infra-saved' },
  ),
);
