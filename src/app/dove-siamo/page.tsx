import type { Metadata } from "next";
import { MARKETS, MARKET_HOURS } from "@/data/markets";
import { WhereWeAre } from "@/components/sections/WhereWeAre";

export const metadata: Metadata = {
  title: "Dove siamo: i mercati della settimana",
  description: `Dove trovare il furgone di Mastrosimini Street Shop: ${MARKETS.map((m) => `${m.dayName.toLowerCase()} ${m.town}`).join(", ")}, dalle ${MARKET_HOURS.from} alle ${MARKET_HOURS.to}. Calendario, mappa e indicazioni.`,
};

export default function DoveSiamoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="titolo mb-6 text-4xl sm:text-6xl">Un mercato diverso ogni giorno</h1>
      <WhereWeAre />
    </main>
  );
}
