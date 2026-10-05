import { MARKETS, type Market } from "@/data/markets";

/** Mercato del giorno (null di domenica: tappe speciali). */
export function marketForDate(date: Date): Market | null {
  return MARKETS.find((m) => m.day === date.getDay()) ?? null;
}

/** Prossimo mercato a partire da oggi (incluso). */
export function nextMarket(from: Date): Market {
  for (let i = 0; i < 7; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const m = marketForDate(d);
    if (m) return m;
  }
  return MARKETS[0];
}

/** "Adesso" nel fuso orario italiano, a prescindere dal dispositivo/server. */
export function romeNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Rome" }));
}
