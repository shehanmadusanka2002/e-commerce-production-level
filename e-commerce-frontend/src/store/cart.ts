import { create } from "zustand";
import type { Product } from "@/lib/products";
import { api } from "@/services/api";

export type CartItem = Product & { qty: number };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  // Actions
  fetch: () => Promise<void>;
  add: (p: Product) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setQty: (id: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  clearLocal: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: () => number;
  total: () => number;
};

export const useCart = create<CartState>()((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,

  // Fetch cart from server
  fetch: async () => {
    try {
      set({ isLoading: true });
      const data = await api.fetchCart();
      const items: CartItem[] = data.map((item: any) => ({
        id: item.id,
        name: item.title,
        price: item.price,
        images: item.image ? [item.image] : [],  // CartDrawer reads images[0]
        categoryId: item.category,
        qty: item.qty,
        // Fill optional fields with defaults
        description: item.description ?? "",
        stock: item.stock ?? 0,
        rating: item.rating ?? 4.5,
        brand: item.brand ?? "",
      }));
      set({ items });
    } catch (e) {
      console.error("Failed to fetch cart:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  // Add item — optimistic update then sync
  add: async (p) => {
    // Optimistic update
    set((s) => {
      const found = s.items.find((i) => i.id === p.id);
      return {
        items: found
          ? s.items.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
          : [...s.items, { ...p, qty: 1 }],
        isOpen: true,
      };
    });
    try {
      await api.addToCart(p.id, 1);
    } catch (e) {
      console.error("Failed to sync cart add:", e);
    }
  },

  remove: async (id) => {
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    try {
      await api.removeFromCart(id);
    } catch (e) {
      console.error("Failed to sync cart remove:", e);
    }
  },

  setQty: async (id, qty) => {
    set((s) => ({
      items: s.items.map((i) => i.id === id ? { ...i, qty: Math.max(1, qty) } : i),
    }));
    try {
      await api.updateCartQty(id, Math.max(1, qty));
    } catch (e) {
      console.error("Failed to sync cart qty:", e);
    }
  },

  // Clear cart on server and locally
  clear: async () => {
    set({ items: [] });
    try {
      await api.clearCart();
    } catch (e) {
      console.error("Failed to sync cart clear:", e);
    }
  },

  // Clear local only (used on logout before token is gone)
  clearLocal: () => set({ items: [], isOpen: false }),

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  count: () => get().items.reduce((n, i) => n + i.qty, 0),
  total: () => get().items.reduce((n, i) => n + i.qty * i.price, 0),
}));
