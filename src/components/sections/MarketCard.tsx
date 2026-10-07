import Link from "next/link";
import { MARKETS } from "@/data/markets";

export function MarketCard({ i }: { i: number }) {
  const m = MARKETS[i];
  return (
    <div className="rounded-tag border-2 border-oro bg-nero/90 p-5">
      <h3 className="titolo text-3xl">{m.town}</h3>
      <p className="mt-2 text-sm font-semibold text-oro">
        {m.dayName}: {m.spot}
      </p>
      <p className="text-sm text-bianco/70">{m.hours}</p>
      <Link
        href="/shop/"
        className="mt-4 inline-block text-sm font-extrabold uppercase tracking-wide text-oro underline underline-offset-4"
      >
        Guarda i capi →
      </Link>
    </div>
  );
}

/** Altezza della sezione animata: uguale per segnaposto e versione completa, così la pagina non salta. */
export const ALTEZZA_GIRO = `${MARKETS.length * 70}svh`;

export function TitoloGiro() {
  return (
    <h2 className="titolo mx-auto w-full max-w-5xl px-4 pt-4 text-3xl sm:text-6xl">
      Il giro della settimana
    </h2>
  );
}
