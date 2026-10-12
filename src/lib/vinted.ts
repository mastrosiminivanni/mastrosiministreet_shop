import { VINTED_URL } from "@/data/markets";

/**
 * Controlla il link Vinted scritto nel pannello. Vuoto = nessun link (campo facoltativo).
 * Accetta solo indirizzi https di Vinted (vinted.it, vinted.com…): niente link a siti qualunque.
 */
export function normalizzaVinted(valore: string | null | undefined): string | null {
  const v = (valore ?? "").trim();
  if (!v) return null;
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    throw new Error("Il link Vinted non è valido: copialo per intero dalla barra del browser (inizia con https://www.vinted.it/…).");
  }
  const host = u.hostname.toLowerCase();
  if (u.protocol !== "https:" || !/(^|\.)vinted\.(it|com|fr|de|es|pt|nl|be|lu|at|pl|cz|sk|hu|ro|hr|lt|se|fi|dk|gr|co\.uk)$/.test(host))
    throw new Error("Il link deve essere di Vinted e iniziare con https:// (per esempio https://www.vinted.it/items/…).");
  return u.toString();
}

/** Dove porta il pulsante Vinted di un capo: il suo link diretto se c'è, altrimenti l'armadio. */
export function destinazioneVinted(
  capo: { vintedUrl?: string | null },
  armadio: string = VINTED_URL,
): { href: string; diretto: boolean; etichetta: string } {
  const diretto = Boolean(capo.vintedUrl?.trim());
  return diretto
    ? { href: capo.vintedUrl!.trim(), diretto: true, etichetta: "Acquista su Vinted" }
    : { href: armadio, diretto: false, etichetta: "Guarda il nostro armadio su Vinted" };
}
