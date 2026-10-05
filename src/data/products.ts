/**
 * Catalogo prodotti. Oggi è un file tipizzato (seed di ESEMPIO); la forma di `Product`
 * è pensata per mappare 1:1 una tabella Supabase o un documento Sanity (vedi README).
 */
export type Category = "camicia-righe" | "camicia-quadri" | "felpa" | "felpa-strass" | "pantaloni";

export type Product = {
  id: string;
  slug: string;
  title: string;
  /** Descrizione dell'annuncio (per scheda, Google e anteprime). Il pannello admin la genera da solo. */
  description?: string;
  category: Category;
  /** Prezzo in euro, intero. */
  price: number;
  sizes: string[];
  /** Misure reali in cm. */
  measurements: Record<string, number>;
  /** URL reali, oppure "placeholder:<nome>" finché non ci sono le foto vere (9:16). */
  images: string[];
  /** 1 per i pezzi unici; 0 = venduto. */
  stock: number;
  /** Pezzi iniziali, se più di uno: con stock 1 il capo diventa "Ultimo pezzo" (altrimenti "Pezzo unico"). */
  initialStock?: number;
  /** Slug dei mercati dove il pezzo è sul furgone. */
  marketPickup: string[];
  /** Dato di esempio: da togliere quando si caricano i capi veri. */
  isExample: boolean;
  /** ISO date, per ordinare per novità. */
  createdAt: string;
};

export const CATEGORY_LABEL: Record<Category, string> = {
  "camicia-righe": "Camicie a righe",
  "camicia-quadri": "Camicie a quadri",
  felpa: "Felpe",
  "felpa-strass": "Felpe con strass",
  pantaloni: "Pantaloni",
};

const base = { isExample: true } as const;

function p(
  n: number,
  slug: string,
  title: string,
  category: Category,
  price: number,
  extra: Partial<Product> = {},
): Product {
  return {
    ...base,
    id: `ex-${String(n).padStart(2, "0")}`,
    slug,
    title,
    category,
    price,
    sizes: ["M"],
    measurements: { spalle: 52, lunghezza: 72 },
    images: [`placeholder:${category}-${n}`],
    stock: 1,
    marketPickup: [],
    createdAt: `2026-09-${String(30 - n).padStart(2, "0")}`,
    ...extra,
  };
}

export const PRODUCTS: Product[] = [
  p(1, "camicia-righe-1", "Camicia a righe", "camicia-righe", 25, { sizes: ["L"], marketPickup: ["rutigliano", "noci"] }),
  p(2, "camicia-righe-2", "Camicia a righe beige", "camicia-righe", 25, { sizes: ["M"], marketPickup: ["putignano"] }),
  p(3, "camicia-righe-3", "Camicia a righe oversize", "camicia-righe", 25, { sizes: ["XL"], marketPickup: ["polignano", "conversano"] }),
  p(4, "camicia-quadri-1", "Camicia a quadri blu", "camicia-quadri", 25, { sizes: ["L"], marketPickup: ["rutigliano"] }),
  p(5, "camicia-quadri-2", "Camicia a quadri rossa", "camicia-quadri", 25, { sizes: ["M"], stock: 1, initialStock: 3, marketPickup: ["castellana-grotte"] }),
  p(6, "felpa-oversize-strass-1", "Felpa oversize nera con strass", "felpa-strass", 30, { sizes: ["L"], marketPickup: ["noci", "putignano"] }),
  p(7, "felpa-oversize-strass-2", "Felpa mimetica con strass", "felpa-strass", 30, { sizes: ["XL"], marketPickup: ["conversano"] }),
  p(8, "felpa-oversize-1", "Felpa oversize grigia", "felpa", 30, { sizes: ["L", "XL"], stock: 2, marketPickup: ["polignano"] }),
  p(9, "pantaloni-1", "Pantaloni larghi marrone", "pantaloni", 20, { sizes: ["M"], measurements: { vita: 40, lunghezza: 104 }, marketPickup: ["putignano", "castellana-grotte"] }),
  p(10, "pantaloni-2", "Pantaloni street neri", "pantaloni", 20, { sizes: ["L"], measurements: { vita: 42, lunghezza: 106 }, stock: 0 }),
];

export const getProduct = (slug: string) => PRODUCTS.find((x) => x.slug === slug);
export const isSoldOut = (x: Product) => x.stock <= 0;
export const isUnique = (x: Product) => x.stock === 1 && (x.initialStock ?? 1) === 1;
export const isLastPiece = (x: Product) => x.stock === 1 && (x.initialStock ?? 1) > 1;
