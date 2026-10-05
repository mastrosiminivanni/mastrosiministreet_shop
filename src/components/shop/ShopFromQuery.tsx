"use client";

import { useSearchParams } from "next/navigation";
import type { Product } from "@/data/products";
import { ShopBrowser } from "./ShopBrowser";

/** Legge ?mercato=… dall'indirizzo nel browser (così la pagina resta statica). */
export function ShopFromQuery({ products }: { products: Product[] }) {
  const mercato = useSearchParams().get("mercato") ?? "";
  return <ShopBrowser products={products} initialMarket={mercato} />;
}
