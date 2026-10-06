"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MARKETS, SUNDAY_NOTE } from "@/data/markets";
import { useCan3D } from "@/lib/webgl";
import { SceneBoundary } from "@/components/3d/SceneBoundary";
import { WheelLoader } from "@/components/3d/WheelLoader";

const RouteScene = dynamic(() => import("@/components/3d/RouteScene"), {
  ssr: false,
  loading: () => <WheelLoader />,
});

function MarketCard({ i }: { i: number }) {
  const m = MARKETS[i];
  return (
    <div className="rounded-tag border-2 border-oro bg-nero/90 p-5">
      <h3 className="titolo text-3xl">{m.town}</h3>
      <p className="mt-2 text-sm font-semibold text-oro">
        {m.dayName}: {m.spot}
      </p>
      <p className="text-sm text-bianco/70">{m.hours}</p>
      <Link
        href={`/shop?mercato=${m.slug}`}
        className="mt-4 inline-block text-sm font-extrabold uppercase tracking-wide text-oro underline underline-offset-4"
      >
        Cosa trovi a {m.town} →
      </Link>
    </div>
  );
}

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

/** Storytelling a scroll: il furgone "si ferma" a ogni mercato e si apre il pannello del paese. */
function Journey3D() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stop, setStop] = useState(0);
  // la scena è molto in basso nella pagina: si prepara solo quando ci si avvicina, così non pesa sul caricamento
  const [vicina, setVicina] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return;
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
  useMotionValueEvent(scrollYProgress, "change", (v) =>
    setStop(Math.min(MARKETS.length - 1, Math.round(v * (MARKETS.length - 1)))),
  );
  return (
    <section ref={ref} className="relative" style={{ height: `${MARKETS.length * 70}svh` }}>
      {/* tre fasce che non si sovrappongono: titolo, strada con il furgone, scheda del paese */}
      <div className="sticky top-14 flex h-[calc(100svh-3.5rem-4rem)] flex-col overflow-hidden md:h-[calc(100svh-3.5rem)]">
        <h2 className="titolo mx-auto w-full max-w-5xl px-4 pt-4 text-3xl sm:text-6xl">
          Il giro della settimana
        </h2>
        <div className="relative min-h-0 flex-1">
          {vicina || !("IntersectionObserver" in window) ? (
            <RouteScene progress={scrollYProgress} />
          ) : (
            <WheelLoader />
          )}
        </div>
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-4">
          <motion.div
            key={stop}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:ml-auto md:max-w-sm"
          >
            <MarketCard i={stop} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function MarketRoute() {
  const can3D = useCan3D();
  if (!can3D) return <MarketList />;
  return (
    <SceneBoundary fallback={<MarketList />}>
      <Journey3D />
    </SceneBoundary>
  );
}
