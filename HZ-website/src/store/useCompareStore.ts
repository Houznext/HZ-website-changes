
import toast from "react-hot-toast";
import { create } from "zustand";

interface CompareStore {
  items: any[];
  toggleItem: (item: any) => void;
  clear: () => void;
  remove: (id: number) => void;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  items: [],

  toggleItem: (item) => {
    const items = get().items;
    const exists = items.some((i) => i.id === item.id);

    if (exists) {
      set({ items: items.filter((i) => i.id !== item.id) });
    } else {
      if (items.length >= 4) {
        toast.error("You can compare up to 4 items only");
        return;
      }
      set({ items: [...items, item] });
    }
  },

  remove: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
    

  clear: () => set({ items: [] }),
}));
