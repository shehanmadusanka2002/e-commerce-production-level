import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/services/api";
import type { Product } from "@/lib/products";

type WishlistState = {
  items: Product[];
  isLoading: boolean;
  fetch: () => Promise<void>;
  toggle: (p: Product) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      fetch: async () => {
        set({ isLoading: true });
        try {
          const items = await api.fetchWishlist();
          set({ items });
        } catch (e) {
          console.error("Failed to fetch wishlist", e);
        } finally {
          set({ isLoading: false });
        }
      },
      toggle: async (p) => {
        try {
          const { status } = await api.toggleWishlist(p.id);
          if (status === 'added') {
            set((s) => ({ items: [p, ...s.items] }));
          } else {
            set((s) => ({ items: s.items.filter(i => i.id !== p.id) }));
          }
        } catch (e) {
          console.error("Failed to toggle wishlist", e);
          throw e; // Rethrow to handle in UI (e.g. login prompt)
        }
      },
      isInWishlist: (id) => get().items.some(i => i.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: "wishlist-storage" }
  )
);
