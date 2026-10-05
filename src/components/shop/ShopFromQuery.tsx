"use client";

import { useSearchParams } from "next/navigation";
import { ShopBrowser } from "./ShopBrowser";

/** Legge ?mercato=… dall'indirizzo nel browser (così la pagina resta statica). */
export function ShopFromQuery() {
  const mercato = useSearchParams().get("mercato") ?? "";
  return <ShopBrowser initialMarket={mercato} />;
}
