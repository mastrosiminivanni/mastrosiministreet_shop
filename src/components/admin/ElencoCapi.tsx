"use client";

import clsx from "clsx";
import { useState } from "react";
import type { AdminStore } from "@/lib/admin/store";
import type { AdminProduct, Stato } from "@/lib/admin/types";

const ETICHETTA: Record<Stato, string> = {
  draft: "Bozza",
  published: "In vendita",
  sold: "Venduto",
};

const azione = "min-h-11 rounded-tag border-2 px-3 text-xs font-extrabold uppercase tracking-wide";

/** Elenco dei capi con i comandi essenziali: pubblica, venduto, bozza, elimina. */
export function ElencoCapi({
  store,
  capi,
  onCambio,
}: {
  store: AdminStore;
  capi: AdminProduct[];
  onCambio: () => void;
}) {
  const [occupato, setOccupato] = useState<string | null>(null);
  const [errore, setErrore] = useState("");

  async function esegui(id: string, fn: () => Promise<void>) {
    setOccupato(id);
    setErrore("");
    try {
      await fn();
      onCambio();
    } catch (e) {
      setErrore(e instanceof Error ? e.message : "Operazione non riuscita.");
    } finally {
      setOccupato(null);
    }
  }

  if (capi.length === 0)
    return (
      <p className="rounded-tag border border-white/15 p-4 text-bianco/70">
        Nessun capo ancora. Aggiungi il primo qui sopra.
      </p>
    );

  return (
    <div>
      {errore && (
        <p role="alert" className="mb-3 text-sm font-semibold text-red-400">
          {errore}
        </p>
      )}
      <ul className="space-y-3">
        {capi.map((c) => (
          <li key={c.id} className="flex gap-3 rounded-tag border border-white/15 p-3">
            {c.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.urlFoto(c.images[0], true)}
                alt=""
                className="aspect-[9/16] w-20 shrink-0 rounded-tag object-cover"
              />
            ) : (
              <div className="aspect-[9/16] w-20 shrink-0 rounded-tag bg-white/10" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-tight">{c.title}</p>
              <p className="mt-1 text-sm text-bianco/75">
                {c.price}€ · taglia {c.sizes.join(" / ")} · {c.stock}{" "}
                {c.stock === 1 ? "pezzo" : "pezzi"} · {c.images.length} foto
              </p>
              <span
                className={clsx(
                  "mt-2 inline-block rounded-tag px-2 py-0.5 text-[11px] font-extrabold uppercase",
                  c.status === "published"
                    ? "bg-oro text-nero"
                    : c.status === "sold"
                      ? "bg-bianco text-nero"
                      : "bg-white/15 text-bianco",
                )}
              >
                {ETICHETTA[c.status]}
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.status === "draft" && (
                  <button
                    type="button"
                    disabled={occupato === c.id}
                    onClick={() => esegui(c.id, () => store.cambiaStato(c.id, "published"))}
                    className={clsx(azione, "border-oro bg-oro text-nero")}
                  >
                    Pubblica
                  </button>
                )}
                {c.status === "published" && (
                  <>
                    <button
                      type="button"
                      disabled={occupato === c.id}
                      onClick={() => esegui(c.id, () => store.cambiaStato(c.id, "sold"))}
                      className={clsx(azione, "border-oro bg-oro text-nero")}
                    >
                      Venduto
                    </button>
                    <button
                      type="button"
                      disabled={occupato === c.id}
                      onClick={() => esegui(c.id, () => store.cambiaStato(c.id, "draft"))}
                      className={clsx(azione, "border-white/30")}
                    >
                      Torna in bozza
                    </button>
                  </>
                )}
                {c.status === "sold" && (
                  <button
                    type="button"
                    disabled={occupato === c.id}
                    onClick={() => esegui(c.id, () => store.cambiaStato(c.id, "published"))}
                    className={clsx(azione, "border-oro text-oro")}
                  >
                    Rimetti in vendita
                  </button>
                )}
                <button
                  type="button"
                  disabled={occupato === c.id}
                  onClick={() =>
                    window.confirm(`Eliminare "${c.title}" e le sue foto? Non si può annullare.`) &&
                    esegui(c.id, () => store.elimina(c))
                  }
                  className={clsx(azione, "border-red-400/60 text-red-300")}
                >
                  Elimina
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
