/**
 * Dati aziendali per footer, privacy e note legali. Si cambiano qui e si aggiornano ovunque.
 * Un dato non applicabile o non pubblicato non si scrive: la riga corrispondente non esiste.
 */
export const AZIENDA = {
  ragioneSociale: "SPACE92 di Mastrosimini Gianfranco",
  partitaIva: "05868730721",
  codiceFiscale: "MSTGFR75M19C134G",
  sedeLegale: "Via Putignano 92, 70013 Castellana Grotte (BA)",
  email: "mastrosiminivanni@gmail.com",
} as const;

export const isSegnaposto = (v: string) => v.startsWith("[");

/** Valore vero, oppure undefined se è ancora un segnaposto. */
export const dato = (v: string) => (isSegnaposto(v) ? undefined : v);
