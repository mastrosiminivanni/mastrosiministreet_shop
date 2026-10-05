"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { MARKETS, SUNDAY_NOTE } from "@/data/markets";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { useCan3D } from "@/lib/webgl";
import { WheelLoader } from "@/components/3d/WheelLoader";

const RouteScene = dynamic(() => import("@/components/3d/RouteScene"), {
  ssr: false,
  loading: () => <WheelLoader />,
});

function MarketCard({ i }: { i: number }) {
  const m = MARKETS[i];
  return (
    <div className="rounded-tag border-2 border-oro bg-nero/90 p-5">
      <PlateBadge>{m.dayName}</PlateBadge>
      <h3 className="titolo mt-3 text-3xl">{m.town}</h3>
      <p className="mt-2 text-sm text-bianco/80">{m.hours}</p>
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
  useMotionValueEvent(scrollYProgress, "change", (v) =>
    setStop(Math.min(MARKETS.length - 1, Math.round(v * (MARKETS.length - 1)))),
  );
  return (
    <section ref={ref} className="relative" style={{ height: `${MARKETS.length * 70}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0">
          <RouteScene progress={scrollYProgress} />
        </div>
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-between p-4">
          <h2 className="titolo text-4xl sm:text-6xl">Il giro della settimana</h2>
          <motion.div
            key={stop}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm self-end pb-6"
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
  return can3D ? <Journey3D /> : <MarketList />;
}
