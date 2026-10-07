"use client";

import { useMemo, useState } from "react";
import { CATEGORY_LABEL, isSoldOut, type Category, type Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

type Sort = "novita" | "prezzo-asc" | "prezzo-desc";

const selectCls =
  "w-full rounded-tag border border-white/20 bg-nero px-3 py-2 text-sm font-semibold text-bianco";

/** Catalogo con filtri (categoria, taglia, prezzo) e ordinamento. */
export function ShopBrowser({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<Category | "">("");
  const [size, setSize] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);
  const [sort, setSort] = useState<Sort>("novita");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const sizes = useMemo(() => [...new Set(products.flatMap((p) => p.sizes))].sort(), [products]);

  const list = useMemo(() => {
    const out = products.filter(
      (p) =>
        (!category || p.category === category) &&
        (!size || p.sizes.includes(size)) &&
        (!maxPrice || p.price <= maxPrice) &&
        (!onlyAvailable || !isSoldOut(p)),
    );
    out.sort((a, b) => {
      // I venduti restano visibili (social proof) ma in fondo.
      if (isSoldOut(a) !== isSoldOut(b)) return isSoldOut(a) ? 1 : -1;
      if (sort === "prezzo-asc") return a.price - b.price;
      if (sort === "prezzo-desc") return b.price - a.price;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return out;
  }, [products, category, size, maxPrice, sort, onlyAvailable]);

  return (
    <div>
      <form className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" onSubmit={(e) => e.preventDefault()} aria-label="Filtri">
        <label className="text-xs font-bold uppercase tracking-wide text-bianco/70">
          Categoria
          <select className={selectCls} value={category} onChange={(e) => setCategory(e.target.value as Category | "")}>
            <option value="">Tutte</option>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-wide text-bianco/70">
          Taglia
          <select className={selectCls} value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="">Tutte</option>
            {sizes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-wide text-bianco/70">
          Prezzo
          <select className={selectCls} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}>
            <option value={0}>Tutti</option>
            <option value={20}>Fino a 20€</option>
            <option value={25}>Fino a 25€</option>
            <option value={30}>Fino a 30€</option>
            <option value={40}>Fino a 40€</option>
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-wide text-bianco/70">
          Ordina
          <select className={selectCls} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="novita">Novità</option>
            <option value="prezzo-asc">Prezzo ↑</option>
            <option value="prezzo-desc">Prezzo ↓</option>
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2 text-xs font-bold uppercase tracking-wide text-bianco/70">
          <input type="checkbox" className="h-5 w-5 accent-oro" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          Solo disponibili
        </label>
      </form>

      <p className="mt-4 text-sm text-bianco/70" aria-live="polite">{list.length} capi</p>
      {list.length === 0 ? (
        <p className="mt-8 text-lg font-semibold">Niente con questi filtri. Il furgone cambia ogni giorno: riprova domani.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
