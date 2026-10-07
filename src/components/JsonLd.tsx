import { AZIENDA, dato } from "@/data/azienda";
import { INSTAGRAM_URL, MARKETS, VINTED_URL } from "@/data/markets";
import { MARKET_HOURS } from "@/data/markets";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/data/site";

const GIORNI = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Dati strutturati per Google: il negozio (furgone) con i giorni e gli orari dei mercati. Indirizzo ed email solo se veri. */
export function JsonLd() {
  const email = dato(AZIENDA.email);
  const legalName = dato(AZIENDA.ragioneSociale);
  const vatID = dato(AZIENDA.partitaIva);
  const sito = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: ["Mastrosimini", "Mastrosimini Shop", "Mastrosimini Street Shop", "mastrosiminishop"],
    url: `${SITE_URL}/`,
    inLanguage: "it-IT",
  };
  const data = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE_NAME,
    alternateName: ["Mastrosimini", "Mastrosimini Shop", "mastrosiminishop"],
    slogan: SITE_TAGLINE,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/brand/logo-profilo.png`,
    image: `${SITE_URL}/og.jpg`,
    description: "Mercato ambulante di abbigliamento uomo: un furgone che gira un paese diverso ogni giorno.",
    sameAs: [INSTAGRAM_URL, VINTED_URL],
    priceRange: "€",
    currenciesAccepted: "EUR",
    areaServed: MARKETS.map((m) => ({ "@type": "City", name: m.town })),
    openingHoursSpecification: MARKETS.map((m) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: GIORNI[m.day],
      opens: MARKET_HOURS.start,
      closes: MARKET_HOURS.end,
    })),
    ...(legalName && { legalName }),
    ...(vatID && { vatID: `IT${vatID}` }),
    ...(email && { email }),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sito) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
    </>
  );
}
