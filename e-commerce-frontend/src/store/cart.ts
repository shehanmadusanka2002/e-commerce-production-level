import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/products";

export type CartItem = Product & { qty: number };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: () => number;
  total: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (p) => set((s) => {
        const found = s.items.find(i => i.id === p.id);
        return {
          items: found
            ? s.items.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
            : [...s.items, { ...p, qty: 1 }],
          isOpen: true,
        };
      }),
      remove: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
      setQty: (id, qty) => set((s) => ({
        items: s.items.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i),
      })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      total: () => get().items.reduce((n, i) => n + i.qty * i.price, 0),
    }),
    { name: "cart-storage" }
  )
);
