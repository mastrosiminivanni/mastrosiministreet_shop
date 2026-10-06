"use client";

import { useEffect } from "react";
import { creaStrumenti, type CapoCatalogo } from "@/lib/agent-tools";
import { asset } from "@/lib/asset";

type ModelContext = {
  registerTool: (tool: unknown, opzioni?: { signal?: AbortSignal }) => unknown;
};

/** Il browser (se supporta WebMCP) espone `document.modelContext`; versioni precedenti `navigator.modelContext`. */
function trovaContesto(): ModelContext | null {
  const d = document as Document & { modelContext?: ModelContext };
  const n = navigator as Navigator & { modelContext?: ModelContext };
  return d.modelContext ?? n.modelContext ?? null;
}

/**
 * Registra gli strumenti per gli agenti (WebMCP, standard proposto): dove siamo oggi, il giro della settimana, il catalogo, come si compra.
 * Sono tutti di sola lettura sui dati pubblici. Nei browser senza WebMCP non succede nulla.
 */
export function WebMcp() {
  useEffect(() => {
    const contesto = trovaContesto();
    if (!contesto) return;
    const stop = new AbortController();
    const leggiCatalogo = async (): Promise<CapoCatalogo[]> => {
      const r = await fetch(asset("/catalogo.json"));
      if (!r.ok)
        throw new Error(
          "Catalogo non disponibile al momento: riprova tra poco o guarda la pagina /shop/.",
        );
      return ((await r.json()) as { items: CapoCatalogo[] }).items;
    };
    for (const strumento of creaStrumenti(leggiCatalogo)) {
      try {
        void Promise.resolve(contesto.registerTool(strumento, { signal: stop.signal })).catch(
          () => {},
        );
      } catch {
        // API sperimentale: un errore di registrazione non deve toccare il sito
      }
    }
    return () => stop.abort();
  }, []);
  return null;
}
