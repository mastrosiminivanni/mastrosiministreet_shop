"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { CLARITY_ID } from "@/data/site";

type Scelta = "granted" | "denied" | null;
const KEY = "ms-consent";
const EVENTO = "ms-consent-change";

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

function leggi(): Scelta {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null; // storage bloccato: come se non avesse mai scelto
  }
}
function scrivi(v: Scelta) {
  try {
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
  } catch {
    /* ignora */
  }
  window.dispatchEvent(new Event(EVENTO));
}
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENTO, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENTO, cb);
    window.removeEventListener("storage", cb);
  };
};
/** "ssr" = non ancora letta (niente banner finché non sappiamo cosa ha scelto). */
function useScelta(): Scelta | "ssr" {
  return useSyncExternalStore<Scelta | "ssr">(subscribe, leggi, () => "ssr");
}

/** Carica Microsoft Clarity solo dopo il consenso; se il consenso viene revocato lo spegne e cancella i cookie. */
function Clarity({ scelta }: { scelta: Scelta | "ssr" }) {
  useEffect(() => {
    if (!CLARITY_ID) return;
    if (scelta === "granted") {
      if (!window.clarity) {
        const c = function (...args: unknown[]) {
          (c.q = c.q ?? []).push(args);
        } as NonNullable<Window["clarity"]>;
        window.clarity = c;
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
        document.head.appendChild(s);
      }
      window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
    } else if (scelta === "denied" && window.clarity) {
      window.clarity("consent", false);
    }
  }, [scelta]);
  return null;
}

const bottone = "flex-1 rounded-tag px-4 py-3 text-sm font-extrabold uppercase tracking-wide";

/** Banner cookie: compare solo se c'è uno strumento di statistiche e finché non hai scelto. Accetta e Rifiuta sono alla pari. */
export function CookieBanner() {
  const scelta = useScelta();
  if (!CLARITY_ID) return null;
  return (
    <>
      <Clarity scelta={scelta} />
      {scelta === null && (
        <div
          role="dialog"
          aria-label="Cookie"
          className="fixed inset-x-3 bottom-[4.75rem] z-50 rounded-tag border-2 border-oro bg-nero p-4 shadow-2xl md:inset-x-auto md:bottom-4 md:right-4 md:max-w-sm"
        >
          <p className="text-sm">
            Usiamo Microsoft Clarity per capire come viene usato il sito, in modo anonimo. Puoi accettare o rifiutare: il sito funziona uguale.{" "}
            <Link href="/legal/cookie/" className="text-oro underline">Dettagli</Link>
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" className={`${bottone} border-2 border-oro text-oro hover:bg-oro hover:text-nero`} onClick={() => scrivi("denied")}>
              Rifiuta
            </button>
            <button type="button" className={`${bottone} border-2 border-oro text-oro hover:bg-oro hover:text-nero`} onClick={() => scrivi("granted")}>
              Accetta
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** Nella pagina Cookie: mostra la scelta attuale e permette di cambiarla. */
export function PreferenzeCookie() {
  const scelta = useScelta();
  if (!CLARITY_ID) return <p className="font-semibold">Non c&apos;è nulla da impostare: il sito non usa cookie di statistica.</p>;
  return (
    <div className="rounded-tag border border-white/20 p-4">
      <p className="font-semibold" aria-live="polite">
        Scelta attuale: {scelta === "granted" ? "statistiche accettate" : scelta === "denied" ? "statistiche rifiutate" : "nessuna scelta"}
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" className={`${bottone} border-2 border-oro text-oro hover:bg-oro hover:text-nero`} onClick={() => scrivi("denied")}>
          Rifiuta
        </button>
        <button type="button" className={`${bottone} border-2 border-oro text-oro hover:bg-oro hover:text-nero`} onClick={() => scrivi("granted")}>
          Accetta
        </button>
      </div>
    </div>
  );
}
