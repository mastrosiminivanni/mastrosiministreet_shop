/** Impostazioni generali del sito. */
export const SITE_NAME = "Mastrosimini Street Shop";
export const SITE_TAGLINE = "Un mercato diverso ogni giorno";

/** Indirizzo pubblico del sito (serve per anteprime social, sitemap e dati per Google). Con un dominio tuo si cambia qui. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mastrosiminishop.it";

/**
 * ID del progetto Microsoft Clarity (si trova in Clarity → Settings → Overview).
 * Si carica solo dopo il consenso dato dal banner cookie. Se lo svuoti, non si carica nulla e il banner sparisce.
 * (L'ID non è un segreto: è visibile in qualunque sito che lo usa.)
 */
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "ysybuodtqv";

/**
 * ID di misurazione di Google Analytics (si trova in Analytics → Amministrazione → Flussi di dati).
 * Si carica solo dopo il consenso dato dal banner cookie, mai nell'area /admin. Se lo svuoti, non si carica.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-Q1LE66RZB6";

/** C'è almeno uno strumento di statistiche (serve per mostrare il banner cookie). */
export const HA_STATISTICHE = Boolean(CLARITY_ID || GA_ID);
