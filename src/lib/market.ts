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

export type Status = "prima" | "aperto" | "chiuso";

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Il banco è ancora da aprire, aperto o già chiuso, rispetto all'ora italiana `now`. */
export function statusAt(now: Date, start: string, end: string): Status {
  const t = now.getHours() * 60 + now.getMinutes();
  return t < minutes(start) ? "prima" : t < minutes(end) ? "aperto" : "chiuso";
}
