"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { useCan3D } from "@/lib/webgl";
import Image from "next/image";
import { SceneBoundary } from "./SceneBoundary";
import { WheelLoader } from "./WheelLoader";

// Canvas caricato solo lato client e in lazy.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <WheelLoader />,
});

function VanPhoto() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <Image
        src={asset("/brand/furgone.png")}
        alt="Il furgone di Mastrosimini Street Shop: nero e oro"
        width={1200}
        height={900}
        priority
        className="w-full max-w-xl object-contain"
      />
    </div>
  );
}

/** Hero: scena 3D se possibile, altrimenti la foto del furgone (anche se il 3D va in errore). */
export function Hero3D() {
  const can3D = useCan3D();
  // La scena parte quando il browser è libero: testo e pulsanti compaiono subito, il 3D subito dopo.
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    type Idle = Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (n: number) => void;
    };
    const w = window as Idle;
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setPronto(true), { timeout: 1200 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setPronto(true), 300);
    return () => clearTimeout(id);
  }, []);
  if (!can3D) return <VanPhoto />;
  if (!pronto) return <WheelLoader />;
  return (
    <SceneBoundary fallback={<VanPhoto />}>
      <HeroScene />
    </SceneBoundary>
  );
}
