"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  slug: string;
  /** Se presente, il capo si ritira al furgone (mercato + data ISO) invece di essere spedito. */
  pickup?: { market: string; date: string };
};

type CartState = {
  items: CartItem[];
  open: boolean;
  add: (item: CartItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
  setOpen: (v: boolean) => void;
};

/** localStorage può mancare o lanciare (privacy mode): in quel caso il carrello vive solo in memoria. */
const safeStorage = createJSONStorage<Pick<CartState, "items">>(() => {
  try {
    localStorage.setItem("__t", "1");
    localStorage.removeItem("__t");
    return localStorage;
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => void mem.set(k, v),
      removeItem: (k) => void mem.delete(k),
    };
  }
});

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      // Pezzi unici: un capo può stare nel carrello una sola volta.
      add: (item) =>
        set((s) => ({
          items: [...s.items.filter((i) => i.slug !== item.slug), item],
          open: true,
        })),
      remove: (slug) => set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
    }),
    { name: "ms-cart", storage: safeStorage, partialize: (s) => ({ items: s.items }) },
  ),
);
