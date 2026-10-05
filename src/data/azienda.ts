/**
 * Dati aziendali per footer, privacy e note legali.
 * Finché un valore è tra [parentesi quadre] è un segnaposto: il sito lo mostra evidenziato e nei dati
 * strutturati per Google non viene usato. Sostituisci i valori qui e rigenera il sito: si aggiorna ovunque.
 */
export const AZIENDA = {
  ragioneSociale: "[RAGIONE SOCIALE]",
  partitaIva: "[P.IVA]",
  codiceFiscale: "[CODICE FISCALE]",
  sedeLegale: "[INDIRIZZO SEDE LEGALE]",
  rea: "[NUMERO REA]",
  email: "[EMAIL DI CONTATTO]",
  pec: "[PEC]",
  telefono: "[TELEFONO]",
} as const;

export const isSegnaposto = (v: string) => v.startsWith("[");

/** Valore vero, oppure undefined se è ancora un segnaposto. */
export const dato = (v: string) => (isSegnaposto(v) ? undefined : v);
