"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { useCan3D } from "@/lib/webgl";
import { SceneBoundary } from "./SceneBoundary";

// Canvas caricato solo lato client e in lazy.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/** Quanto aspettare dopo il caricamento della pagina prima di far partire il 3D (il testo e i pulsanti sono già usabili). */
const ATTESA_3D_MS = 3000;

/** Immagine di partenza: uno scatto del furgone 3D vero (senza sfondo, vale per tema chiaro e scuro). */
function Poster({ nascosto }: { nascosto: boolean }) {
  return (
    <picture
      className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${nascosto ? "opacity-0" : "opacity-100"}`}
    >
      <source media="(min-width: 768px)" srcSet={asset("/brand/poster-desktop.webp")} />
      <img
        src={asset("/brand/poster-mobile.webp")}
        alt="Il furgone di Mastrosimini Street Shop: nero e oro"
        width={780}
        height={600}
        fetchPriority="high"
        className="h-full w-full object-contain md:object-cover"
      />
    </picture>
  );
}

/**
 * Hero: subito l'immagine del furgone; dopo ~3 secondi (o al primo tocco/scorrimento) parte la scena 3D, che compare
 * con una dissolvenza quando il furgone è pronto. Senza 3D (browser vecchio, "riduci movimento", telefono lento) resta l'immagine.
 */
export function Hero3D() {
  const can3D = useCan3D();
  const [avvia, setAvvia] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!can3D) return;
    let timer: number | undefined;
    const parti = () => setAvvia(true);
    const dopoCaricamento = () => {
      timer = window.setTimeout(parti, ATTESA_3D_MS);
    };
    if (document.readyState === "complete") dopoCaricamento();
    else window.addEventListener("load", dopoCaricamento, { once: true });
    const gesti = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"] as const;
    for (const g of gesti) window.addEventListener(g, parti, { once: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", dopoCaricamento);
      for (const g of gesti) window.removeEventListener(g, parti);
    };
  }, [can3D]);

  useEffect(() => {
    const ok = () => setPronto(true);
    window.addEventListener("ms-van-ready", ok);
    return () => window.removeEventListener("ms-van-ready", ok);
  }, []);

  return (
    <div className="relative h-full w-full">
      <Poster nascosto={pronto} />
      {can3D && avvia && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${pronto ? "opacity-100" : "opacity-0"}`}
        >
          <SceneBoundary fallback={null}>
            <HeroScene />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
