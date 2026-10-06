/**
 * Dati aziendali per footer, privacy e note legali.
 * Finché un valore è tra [parentesi quadre] è un segnaposto: il sito lo mostra evidenziato e nei dati
 * strutturati per Google non viene usato. Sostituisci i valori qui e rigenera il sito: si aggiorna ovunque.
 */
export const AZIENDA = {
  ragioneSociale: "SPACE92 di Mastrosimini Gianfranco",
  partitaIva: "05868730721",
  codiceFiscale: "MSTGFR75M19C134G",
  sedeLegale: "Via Putignano 92, 70013 Castellana Grotte (BA)",
  rea: "[NUMERO REA]",
  email: "[EMAIL DI CONTATTO]",
  pec: "[PEC]",
  telefono: "[TELEFONO]",
} as const;

export const isSegnaposto = (v: string) => v.startsWith("[");

/** Valore vero, oppure undefined se è ancora un segnaposto. */
export const dato = (v: string) => (isSegnaposto(v) ? undefined : v);
