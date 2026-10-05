"use client";

import Link from "next/link";
import { marketForDate, nextMarket } from "@/lib/market";
import { useToday } from "@/lib/useToday";

/** "Il furgone oggi": mercato del giorno calcolato dalla data (fuso Italia). */
export function TodayStrip() {
  const now = useToday();
  let text = "Il furgone oggi…";
  if (now) {
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
