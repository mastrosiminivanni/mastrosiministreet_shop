"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { marketForDate, nextMarket, romeNow } from "@/lib/market";

const subscribe = () => () => {};
// Chiave "yyyy-m-d" stabile: la striscia si calcola sul client, nessun valore bloccato al build.
const today = () => {
  const d = romeNow();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/** "Il furgone oggi": mercato del giorno calcolato dalla data (fuso Italia). */
export function TodayStrip() {
  const key = useSyncExternalStore(subscribe, today, () => "");
  let text = "Il furgone oggi…";
  if (key) {
    const now = romeNow();
    const m = marketForDate(now);
    text = m
      ? `Oggi siamo a ${m.town}. Ti aspettiamo al furgone.`
      : `Oggi è domenica: tappa speciale, guarda Instagram. Domani: ${nextMarket(new Date(now.getTime() + 864e5)).town}.`;
  }
  return (
    <Link
      href="/dove-siamo"
      className="block bg-oro px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-nero"
    >
      <span aria-live="polite">📍 {text}</span>
    </Link>
  );
}
