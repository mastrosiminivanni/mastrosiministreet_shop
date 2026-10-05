/**
 * Tappe speciali (di solito la domenica), annunciate su Instagram.
 * Aggiungi qui una voce per ogni tappa: appare in /dove-siamo e nel calendario .ics.
 */
export type SpecialStop = {
  /** yyyy-mm-dd */
  date: string;
  town: string;
  spot?: string;
  lat?: number;
  lng?: number;
  note?: string;
};

export const SPECIAL_STOPS: SpecialStop[] = [
  // Esempio:
  // { date: "2026-10-11", town: "Putignano", spot: "Via Rosata Romanazzi", lat: 40.8486, lng: 17.1226 },
];
