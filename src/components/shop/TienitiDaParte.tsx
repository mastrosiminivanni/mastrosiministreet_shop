"use client";

import { INSTAGRAM_DM_URL } from "@/data/markets";

/**
 * "Tienilo da parte": copia il messaggio già scritto e apre la chat Instagram.
 * Instagram non permette di precompilare il testo di un DM, quindi il messaggio va incollato.
 * Resta un normale link: senza JavaScript o con la copia bloccata apre comunque la chat.
 * Il clic si misura solo se l'utente ha accettato le statistiche (gtag e clarity esistono solo dopo il consenso).
 */
export function TienitiDaParte({ nome, prezzo }: { nome: string; prezzo: number }) {
  function alClic() {
    const testo = `Ciao! Vorrei tenere da parte: ${nome} (${prezzo}€). Taglia: `;
    try {
      void navigator.clipboard?.writeText(testo).catch(() => {});
    } catch {
      /* copia non disponibile: la chat si apre lo stesso */
    }
    window.gtag?.("event", "tieni_da_parte", { capo: nome });
    window.clarity?.("event", "tieni_da_parte");
  }

  return (
    <>
      <a
        href={INSTAGRAM_DM_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={alClic}
        className="rounded-tag bg-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-tinta hover:brightness-110"
      >
        Tienilo da parte su Instagram
      </a>
      <p className="text-sm text-bianco/70">Il messaggio è già copiato: incollalo nella chat.</p>
    </>
  );
}
