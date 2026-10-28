/** Mercati settimanali del furgone. Giorno: 0 = domenica … 6 = sabato (come Date.getDay()). */
export type Market = {
  slug: string;
  town: string;
  day: number;
  dayName: string;
  /** Punto esatto dove si ferma il furgone (dalle storie "Dove siamo" di settembre 2026). */
  spot: string;
  lat: number;
  lng: number;
  /** "approx": coordinate dei punti segnati su Google Maps dal titolare (ottobre 2026); il punto esatto resta quello delle storie. */
  precision: "approx";
  /** Orario di apertura da mostrare (vedi MARKET_HOURS). */
  hours: string;
  /** Nome ufficiale del comune, se diverso da quello che si usa a voce (per Google). */
  comune?: string;
};

/** Tutti i mercati sono nella provincia (città metropolitana) di Bari: lo si scrive nei testi e nei dati per Google. */
export const PROVINCIA = { nome: "provincia di Bari", sigla: "BA", regione: "Puglia" } as const;

export const nomeComune = (m: Market) => m.comune ?? m.town;

/** Orario di tutti i mercati settimanali: dalle 7 alle 13. */
export const MARKET_HOURS = { start: "07:00", end: "13:00", from: "7:00", to: "13:00", label: "7:00-13:00" } as const;

/** Posti abituali dei mercati: non si toccano per uno spostamento provvisorio (vedi SPOSTAMENTI qui sotto). */
const MERCATI_ABITUALI: Market[] = [
  { slug: "rutigliano", town: "Rutigliano", day: 1, dayName: "Lunedì", spot: "Via Dante, 51", lat: 41.00812, lng: 17.01025, precision: "approx", hours: MARKET_HOURS.label },
  { slug: "noci", town: "Noci", day: 2, dayName: "Martedì", spot: "Piazza Garibaldi", lat: 40.7965, lng: 17.12219, precision: "approx", hours: MARKET_HOURS.label },
  { slug: "putignano", town: "Putignano", day: 3, dayName: "Mercoledì", spot: "Via Estramurale a Mezzogiorno", lat: 40.84814, lng: 17.12242, precision: "approx", hours: MARKET_HOURS.label },
  { slug: "polignano", town: "Polignano", day: 4, dayName: "Giovedì", spot: "Via Vito Cosimo Basile (angolo Via Papa Giovanni Paolo II)", lat: 40.98839, lng: 17.22669, precision: "approx", hours: MARKET_HOURS.label, comune: "Polignano a Mare" },
  { slug: "conversano", town: "Conversano", day: 5, dayName: "Venerdì", spot: "Via Padre Michele Accolti Gil, vicino al campo sportivo", lat: 40.964, lng: 17.108, precision: "approx", hours: MARKET_HOURS.label },
  { slug: "castellana-grotte", town: "Castellana Grotte", day: 6, dayName: "Sabato", spot: "Piazza Garibaldi", lat: 40.885, lng: 17.16711, precision: "approx", hours: MARKET_HOURS.label },
];

/**
 * Spostamenti provvisori: dal giorno "dal" al giorno "al" (compresi, yyyy-mm-dd) il mercato sta qui invece che nel posto abituale.
 * Il sito è statico: il cambio vale per le pubblicazioni fatte in quelle date. Finito lo spostamento, cancella la riga e ripubblica.
 */
type Spostamento = { slug: string; dal: string; al: string; spot: string; lat: number; lng: number };

const SPOSTAMENTI: Spostamento[] = [
  // Conversano spostato dal comune per 3 settimane (venerdì 30/10, 6/11 e 13/11)
  { slug: "conversano", dal: "2026-10-28", al: "2026-11-13", spot: "Via Pietro Nenni, 33", lat: 40.9612248, lng: 17.1086004 },
];

const oggiRoma = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());

export const MARKETS: Market[] = MERCATI_ABITUALI.map((m) => {
  const s = SPOSTAMENTI.find((x) => x.slug === m.slug && x.dal <= oggiRoma && oggiRoma <= x.al);
  if (!s) return m;
  const fino = new Date(`${s.al}T12:00:00`).toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  return { ...m, spot: `${s.spot} (posto provvisorio fino al ${fino})`, lat: s.lat, lng: s.lng };
});

export const SUNDAY_NOTE = "Domenica: tappe speciali annunciate su Instagram.";
export const INSTAGRAM_URL = "https://www.instagram.com/mastrosiministreet_shop/";
/** Apre direttamente la chat (DM) con il profilo. */
/** Profilo Vinted: un canale in più, non l'unico. Le taglie che mancano si caricano su richiesta. */
export const VINTED_URL = "https://www.vinted.it/member/261904496-mastrosiminishop";
/** Un solo testo per il pulsante che porta alla chat Instagram, ovunque nel sito. */
export const CTA_INSTAGRAM = "Scrivici su Instagram";
export const INSTAGRAM_DM_URL = "https://ig.me/m/mastrosiministreet_shop";

/** Link che apre il punto esatto in Google Maps (indicazioni stradali). */
export const mapsUrl = (m: Pick<Market, "lat" | "lng">) =>
  `https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`;
