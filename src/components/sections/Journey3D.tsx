"use client";

import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { MARKETS } from "@/data/markets";
import { WheelLoader } from "@/components/3d/WheelLoader";
import { ALTEZZA_GIRO, MarketCard, TitoloGiro } from "./MarketCard";

const RouteScene = dynamic(() => import("@/components/3d/RouteScene"), {
  ssr: false,
  loading: () => <WheelLoader />,
});

/** Storytelling a scroll: il furgone "si ferma" a ogni mercato e si apre il pannello del paese. Si carica solo vicino alla sezione. */
export default function Journey3D() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stop, setStop] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) =>
    setStop(Math.min(MARKETS.length - 1, Math.round(v * (MARKETS.length - 1)))),
  );
  return (
    <section ref={ref} className="relative" style={{ height: ALTEZZA_GIRO }}>
      {/* tre fasce che non si sovrappongono: titolo, strada con il furgone, scheda del paese */}
      <div className="sticky top-14 flex h-[calc(100svh-3.5rem-4rem)] flex-col overflow-hidden md:h-[calc(100svh-3.5rem)]">
        <TitoloGiro />
        <div className="relative min-h-0 flex-1">
          <RouteScene progress={scrollYProgress} />
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
