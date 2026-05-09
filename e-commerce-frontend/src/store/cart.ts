import { create } from "zustand";
import type { Product } from "@/lib/products";
import { supabase } from "@/lib/supabase";

export type CartItem = Product & { qty: number };

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

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

  // Fetch cart from server (called on login)
  fetch: async () => {
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) return; // Not logged in
      set({ isLoading: true });
      const res = await fetch(`${API_BASE}/cart`, { headers });
      if (res.ok) {
        const data = await res.json();
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
      }
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
      const headers = await getAuthHeaders();
      if (!headers.Authorization) return; // Guest — keep optimistic state only
      await fetch(`${API_BASE}/cart/add`, {
        method: "POST",
        headers,
        body: JSON.stringify({ productId: p.id, quantity: 1 }),
      });
    } catch (e) {
      console.error("Failed to sync cart add:", e);
    }
  },

  remove: async (id) => {
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) return;
      await fetch(`${API_BASE}/cart/${id}`, { method: "DELETE", headers });
    } catch (e) {
      console.error("Failed to sync cart remove:", e);
    }
  },

  setQty: async (id, qty) => {
    set((s) => ({
      items: s.items.map((i) => i.id === id ? { ...i, qty: Math.max(1, qty) } : i),
    }));
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) return;
      await fetch(`${API_BASE}/cart/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ quantity: Math.max(1, qty) }),
      });
    } catch (e) {
      console.error("Failed to sync cart qty:", e);
    }
  },

  // Clear cart on server and locally
  clear: async () => {
    set({ items: [] });
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) return;
      await fetch(`${API_BASE}/cart/clear`, { method: "DELETE", headers });
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
