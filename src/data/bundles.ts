import type { Category } from "@/data/products";

/** Regole di prezzo dei look. Da confermare con il negozio: oggi felpa + pantalone = 50€ (come nel reel). */
export type BundleRule = { name: string; price: number; top: Category[]; bottom: Category[] };

export const BUNDLE_RULES: BundleRule[] = [
  { name: "Look completo", price: 50, top: ["felpa", "felpa-strass"], bottom: ["pantaloni"] },
];
