"use client";

import { useEffect, useState } from "react";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurato } from "@/lib/supabase";
import type { Product } from "@/data/products";

type Stato = { status: "published" | "sold"; stock: number };
export type CapiLive = Map<string, Stato>;

// Una sola richiesta per visita: negozio e pagine dei capi la condividono.
let richiesta: Promise<CapiLive | null> | null = null;

function leggiStato(): Promise<CapiLive | null> {
  if (!supabaseConfigurato) return Promise.resolve(null);
  richiesta ??= fetch(`${SUPABASE_URL}/rest/v1/products?select=id,status,stock&status=in.(published,sold)`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  })
    .then((r) => (r.ok ? (r.json() as Promise<{ id: string; status: Stato["status"]; stock: number }[]>) : null))
    .then((righe) => (righe ? new Map(righe.map((x) => [x.id, { status: x.status, stock: x.stock }])) : null))
    .catch(() => null);
  return richiesta;
}

/**
 * Lo stato di oggi dei capi (in vendita / venduto), letto dall'archivio a ogni visita.
 * Il sito pubblicato è statico: così un capo segnato "venduto" nel pannello si vede subito, senza ripubblicare.
 * Se la richiesta non riesce resta quello che era al momento della pubblicazione.
 */
export function useCapiLive(): CapiLive | null {
  const [live, setLive] = useState<CapiLive | null>(null);
  useEffect(() => {
    let attivo = true;
    leggiStato().then((m) => attivo && setLive(m));
    return () => {
      attivo = false;
    };
  }, []);
  return live;
}

/** Venduto o tolto dal pannello: non più acquistabile. */
export const nonDisponibile = (live: CapiLive | null, id: string) => {
  if (!live) return false;
  const s = live.get(id);
  return !s || s.status === "sold" || s.stock <= 0;
};

/** Applica lo stato di oggi ai capi pubblicati: i venduti restano in elenco ma segnati, quelli tolti spariscono. */
export function conStatoLive(products: Product[], live: CapiLive | null): Product[] {
  if (!live) return products;
  return products
    .filter((p) => p.isExample || live.has(p.id))
    .map((p) => {
      const s = live.get(p.id);
      return s && (s.status === "sold" || s.stock <= 0) ? { ...p, stock: 0 } : p;
    });
}
