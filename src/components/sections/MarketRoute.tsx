"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MARKETS, SUNDAY_NOTE } from "@/data/markets";
import { useCan3D } from "@/lib/webgl";
import { SceneBoundary } from "@/components/3d/SceneBoundary";
import { ALTEZZA_GIRO, MarketCard, TitoloGiro } from "./MarketCard";

/** Segnaposto leggero con le stesse misure della sezione animata. */
function SegnapostoGiro() {
  return (
    <section className="relative" style={{ height: ALTEZZA_GIRO }}>
      <div className="sticky top-14 flex h-[calc(100svh-3.5rem-4rem)] flex-col overflow-hidden md:h-[calc(100svh-3.5rem)]">
        <TitoloGiro />
        <div className="relative min-h-0 flex-1">
          <p className="flex h-full items-center justify-center px-4 text-center text-xs font-semibold uppercase tracking-widest text-oro">
            Scorri per seguire il giro dei mercati
          </p>
        </div>
      </div>
    </section>
  );
}

// framer-motion e la scena 3D stanno in questo pezzo, scaricato solo quando ci si avvicina alla sezione
const Journey3D = dynamic(() => import("./Journey3D"), {
  ssr: false,
  loading: () => <SegnapostoGiro />,
});

/** Alternativa non 3D (e per tastiera/screen reader): elenco dei 6 mercati. */
function MarketList() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="titolo text-4xl">Il giro della settimana</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MARKETS.map((_, i) => (
          <li key={i}>
            <MarketCard i={i} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-bianco/70">{SUNDAY_NOTE}</p>
    </section>
  );
}

/** Il giro animato parte solo quando ci si avvicina: finché si è in alto nella pagina non pesa sul caricamento. */
function GiroQuandoVicino() {
  const ref = useRef<HTMLDivElement>(null);
  const [vicina, setVicina] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVicina(true);
          io.disconnect();
        }
      },
      { rootMargin: "150px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{vicina ? <Journey3D /> : <SegnapostoGiro />}</div>;
}

export function MarketRoute() {
  const can3D = useCan3D();
  if (!can3D) return <MarketList />;
  return (
    <SceneBoundary fallback={<MarketList />}>
      <GiroQuandoVicino />
    </SceneBoundary>
  );
}
