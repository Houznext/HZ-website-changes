import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  id: string;
  createdAt: string;
  property?: any;
  furniture?: any;
  homeDecors?: any;
};

type WishlistStore = {
  items: WishlistItem[];
  isLoading: boolean;
  isError: boolean;
  isInitialFetch: boolean;
  fetchWishlistItems: (userId: string) => Promise<void>;
  addToWishlist: (
    userId: string,
    type: string,
    itemId: string
  ) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  setWishlistItems: (items: WishlistItem[]) => void;
  getItems: () => WishlistItem[];
  resetWishlist: () => void;
  syncWishlistWithBackend: (userId: string) => Promise<void>;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isError: false,
      isInitialFetch: false,

      syncWishlistWithBackend: async (userId) => {
        if (!userId || get().isInitialFetch) return;
        set({ isLoading: true, isError: false, isInitialFetch: true });
        try {
          const response = await apiClient.get(
            `${apiClient.URLS.wishlist}/${userId}`,
            "",
            true
          );
          if (response.body?.length) {
            toast.success("Wishlist synced");
            set({ items: response.body, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({ isError: true, isLoading: false });
          toast.error("Failed to sync wishlist with backend");
        }
      },

      fetchWishlistItems: async (userId) => {
        if (!userId) return;
        set({ isLoading: true, isError: false });
        try {
          const response = await apiClient.get(
            `${apiClient.URLS.wishlist}/${userId}`,
            "",
            true
          );
          set({ items: response.body, isLoading: false });
        } catch (error) {
          set({ isError: true, isLoading: false });
        }
      },

      addToWishlist: async (userId, type, itemId) => {
        set({ isLoading: true, isError: false });
        try {
          const response = await apiClient.post(
            `${apiClient.URLS.wishlist}/${userId}/${type}/${itemId}`,
            "",
            true
          );
          set({ items: response.body.wishlistItems, isLoading: false });
        } catch (error) {
          set({ isError: true, isLoading: false });
        }
      },

      removeFromWishlist: async (itemId) => {
        set({ isLoading: true, isError: false });
        try {
          await apiClient.delete(
            `${apiClient.URLS.wishlist}/${String(itemId)}`,
            "",
            true
          );
          set((state) => ({
            items: state.items.filter((item) => String(item.id) !== String(itemId)),
            isLoading: false,
          }));
        } catch (error) {
          set({ isError: true, isLoading: false });
        }
      },

      setWishlistItems: (items) => {
        set({ items });
      },

      getItems: () => {
        return get().items;
      },

      resetWishlist: () => {
        set({
          items: [],
          isLoading: false,
          isError: false,
          isInitialFetch: false,
        });
      },
    }),
    {
      name: "wishlist-store", // Key for localStorage
      partialize: (state) => ({ items: state.items }), // Persist only 'items', not loading state
    }
  )
);
