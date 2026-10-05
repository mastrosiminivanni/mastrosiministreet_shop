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
  /** "approx": coordinate ricavate dal nome della via, da verificare sul posto. */
  precision: "approx";
  /** Orari non forniti: da completare. */
  hours: string;
};

export const MARKETS: Market[] = [
  { slug: "rutigliano", town: "Rutigliano", day: 1, dayName: "Lunedì", spot: "Via Dante (zona Via Paisiello)", lat: 41.0082, lng: 17.0095, precision: "approx", hours: "Orari da confermare" },
  { slug: "noci", town: "Noci", day: 2, dayName: "Martedì", spot: "Centro storico, zona Via De Pretis", lat: 40.7965, lng: 17.1222, precision: "approx", hours: "Orari da confermare" },
  { slug: "putignano", town: "Putignano", day: 3, dayName: "Mercoledì", spot: "Via Rosata Romanazzi (da confermare)", lat: 40.8486, lng: 17.1226, precision: "approx", hours: "Orari da confermare" },
  { slug: "polignano", town: "Polignano", day: 4, dayName: "Giovedì", spot: "Via Vito Cosimo Basile", lat: 40.9884, lng: 17.2267, precision: "approx", hours: "Orari da confermare" },
  { slug: "conversano", town: "Conversano", day: 5, dayName: "Venerdì", spot: "Via Padre Michele Accolti Gil, vicino al campo sportivo", lat: 40.964, lng: 17.108, precision: "approx", hours: "Orari da confermare" },
  { slug: "castellana-grotte", town: "Castellana Grotte", day: 6, dayName: "Sabato", spot: "Piazza Garibaldi", lat: 40.885, lng: 17.1671, precision: "approx", hours: "Orari da confermare" },
];

export const SUNDAY_NOTE = "Domenica: tappe speciali annunciate su Instagram.";
export const INSTAGRAM_URL = "https://www.instagram.com/mastrosiministreet_shop/";

/** Link che apre il punto esatto in Google Maps (indicazioni stradali). */
export const mapsUrl = (m: Pick<Market, "lat" | "lng">) =>
  `https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`;
