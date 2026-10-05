"use client";

import { useState } from "react";
import { MARKETS } from "@/data/markets";
import { isSoldOut, type Product } from "@/data/products";
import { nextDateForMarket } from "@/lib/market";
import { useCart } from "@/store/cart";

const primary = "rounded-tag bg-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-nero hover:brightness-110";
const secondary = "rounded-tag border-2 border-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:bg-oro hover:text-nero";

/** Compra ora, prenota e ritira al furgone, chiedi su Instagram/WhatsApp. */
export function ProductActions({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [market, setMarket] = useState("");
  const [booked, setBooked] = useState("");
  const sold = isSoldOut(product);
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const options = MARKETS.filter((m) => product.marketPickup.length === 0 || product.marketPickup.includes(m.slug));

  if (sold) {
    return <p className="rounded-tag border border-white/20 p-4 font-semibold">Venduto. Quando è andato, è andato. Guarda gli altri capi nel furgone.</p>;
  }

  function reserve() {
    const m = MARKETS.find((x) => x.slug === market);
    if (!m) return;
    const date = nextDateForMarket(m);
    add({ slug: product.slug, pickup: { market: m.slug, date } });
    setBooked(`${m.dayName} a ${m.town}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <button type="button" className={primary} onClick={() => add({ slug: product.slug })}>
        Compra ora
      </button>

      <fieldset className="rounded-tag border border-white/20 p-4">
        <legend className="px-2 text-xs font-bold uppercase tracking-wide text-bianco/70">Prenota e ritira al furgone</legend>
        <label className="text-sm font-semibold">
          Dove ci vediamo?
          <select
            className="mt-1 w-full rounded-tag border border-white/20 bg-nero px-3 py-3 text-sm"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
          >
            <option value="">Scegli il mercato</option>
            {options.map((m) => (
              <option key={m.slug} value={m.slug}>{m.dayName} · {m.town}</option>
            ))}
          </select>
        </label>
        <button type="button" disabled={!market} className={`${secondary} mt-3 w-full disabled:cursor-not-allowed disabled:opacity-40`} onClick={reserve}>
          Prenota
        </button>
        <p className="mt-2 text-sm text-oro" aria-live="polite">
          {booked && `Prenotato per ${booked}. Ti aspettiamo al furgone.`}
        </p>
      </fieldset>

      <div className="flex gap-3">
        <a className={`${secondary} flex-1`} href={`https://ig.me/m/mastrosiministreet_shop`} rel="noopener">
          Chiedi su Instagram
        </a>
        {wa && (
          <a
            className={`${secondary} flex-1`}
            href={`https://wa.me/${wa}?text=${encodeURIComponent(`Ciao! Mi interessa: ${product.title} (${product.price}€)`)}`}
            rel="noopener"
          >
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
