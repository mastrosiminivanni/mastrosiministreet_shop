"use client";

import { useEffect, useState } from "react";
import type { AdminStore } from "@/lib/admin/store";

const VALIDO = /^https:\/\/([\w-]+\.)?vinted\.[a-z.]+\//i;

/** Link al profilo Vinted mostrato sul sito. Si cambia qui, senza toccare il codice. */
export function ImpostazioniSito({ store }: { store: AdminStore }) {
  const [url, setUrl] = useState("");
  const [stato, setStato] = useState<{ tipo: "info" | "errore" | "ok"; testo: string } | null>(
    null,
  );

  useEffect(() => {
    let vivo = true;
    store
      .leggiVinted()
      .then((v) => vivo && setUrl(v))
      .catch(
        (e) =>
          vivo &&
          setStato({
            tipo: "errore",
            testo: e instanceof Error ? e.message : "Non riesco a leggere il link.",
          }),
      );
    return () => {
      vivo = false;
    };
  }, [store]);

  async function salva(e: React.FormEvent) {
    e.preventDefault();
    const v = url.trim();
    if (!VALIDO.test(v))
      return setStato({
        tipo: "errore",
        testo: "Incolla l'indirizzo del profilo, che inizia con https://www.vinted.it/",
      });
    setStato({ tipo: "info", testo: "Salvo…" });
    try {
      await store.salvaVinted(v);
      setStato({
        tipo: "ok",
        testo:
          store.modo === "supabase"
            ? "Salvato. Il sito si aggiorna entro un paio di minuti."
            : "Salvato (solo in prova).",
      });
    } catch (err) {
      setStato({
        tipo: "errore",
        testo: err instanceof Error ? err.message : "Non riesco a salvare.",
      });
    }
  }

  return (
    <form onSubmit={salva} className="space-y-3">
      <label htmlFor="vinted" className="text-sm font-bold uppercase text-bianco/70">
        Profilo Vinted
      </label>
      <input
        id="vinted"
        type="url"
        inputMode="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="min-h-12 w-full rounded-tag border border-white/25 bg-nero px-3 text-base"
      />
      <button
        type="submit"
        className="min-h-12 rounded-tag border-2 border-oro px-5 text-sm font-extrabold uppercase text-oro"
      >
        Salva il link
      </button>
      <p
        role="status"
        aria-live="polite"
        className={
          stato?.tipo === "errore"
            ? "text-sm font-semibold text-red-400"
            : "text-sm font-semibold text-oro"
        }
      >
        {stato?.testo}
      </p>
    </form>
  );
}
