import type { Metadata } from "next";
import Link from "next/link";
import { MARKETS, MARKET_HOURS, PROVINCIA, nomeComune } from "@/data/markets";
import { WhereWeAre } from "@/components/sections/WhereWeAre";

export const metadata: Metadata = {
  title: "Dove siamo: i mercati della settimana in provincia di Bari",
  description: `Dove trovare il furgone di Mastrosimini Street Shop in provincia di Bari: ${MARKETS.map((m) => `${m.dayName.toLowerCase()} ${nomeComune(m)}`).join(", ")}, dalle ${MARKET_HOURS.from} alle ${MARKET_HOURS.to}. Calendario, mappa e indicazioni.`,
};

export default function DoveSiamoPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="titolo text-4xl sm:text-6xl">Un mercato diverso ogni giorno</h1>
      <p className="mb-6 mt-3 max-w-3xl text-bianco/85">
        Il furgone di Mastrosimini Street Shop, abbigliamento uomo nuovo, è in un mercato diverso ogni giorno in{" "}
        {PROVINCIA.nome}, dalle {MARKET_HOURS.from} alle {MARKET_HOURS.to}:{" "}
        {MARKETS.map((m, i) => (
          <span key={m.slug}>
            {m.dayName.toLowerCase()}{" "}
            <Link href={`/dove-siamo/${m.slug}/`} className="font-semibold text-oro underline underline-offset-4">
              {nomeComune(m)}
            </Link>
            {i < MARKETS.length - 2 ? ", " : i === MARKETS.length - 2 ? " e " : ""}
          </span>
        ))}
        . La domenica ci sono tappe speciali. Hai dubbi? Guarda le{" "}
        <Link href="/contatti/" className="font-semibold text-oro underline underline-offset-4">
          domande frequenti
        </Link>
        .
      </p>
      <WhereWeAre />
    </main>
  );
}
