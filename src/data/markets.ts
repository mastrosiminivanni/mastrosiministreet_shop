/** Mercati settimanali del furgone. Giorno: 0 = domenica … 6 = sabato (come Date.getDay()). */
export type Market = {
  slug: string;
  town: string;
  day: number;
  dayName: string;
  /** Orari non forniti: da completare. */
  hours: string;
};

export const MARKETS: Market[] = [
  { slug: "rutigliano", town: "Rutigliano", day: 1, dayName: "Lunedì", hours: "Orari da confermare" },
  { slug: "noci", town: "Noci", day: 2, dayName: "Martedì", hours: "Orari da confermare" },
  { slug: "putignano", town: "Putignano", day: 3, dayName: "Mercoledì", hours: "Orari da confermare" },
  { slug: "polignano", town: "Polignano", day: 4, dayName: "Giovedì", hours: "Orari da confermare" },
  { slug: "conversano", town: "Conversano", day: 5, dayName: "Venerdì", hours: "Orari da confermare" },
  { slug: "castellana-grotte", town: "Castellana Grotte", day: 6, dayName: "Sabato", hours: "Orari da confermare" },
];

export const SUNDAY_NOTE = "Domenica: tappe speciali annunciate su Instagram.";
export const INSTAGRAM_URL = "https://www.instagram.com/mastrosiministreet_shop/";
