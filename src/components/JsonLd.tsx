import { AZIENDA, dato } from "@/data/azienda";
import { INSTAGRAM_URL, MARKETS, PROVINCIA, VINTED_URL, nomeComune } from "@/data/markets";
import { MARKET_HOURS } from "@/data/markets";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/data/site";

const CENTRO = MARKETS.find((m) => m.slug === "castellana-grotte")!;

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
    description: `Mercato ambulante di abbigliamento uomo nuovo: un furgone che gira un paese diverso ogni giorno in ${PROVINCIA.nome}.`,
    address: { "@type": "PostalAddress", addressRegion: PROVINCIA.sigla, addressCountry: "IT" },
    sameAs: [INSTAGRAM_URL, VINTED_URL],
    priceRange: "€",
    currenciesAccepted: "EUR",
    // la zona che serviamo: 50 km intorno a Castellana Grotte (arriva a Bari, Monopoli, Fasano, Martina Franca, Gioia del Colle)
    areaServed: [
      {
        "@type": "GeoCircle",
        geoMidpoint: { "@type": "GeoCoordinates", latitude: CENTRO.lat, longitude: CENTRO.lng },
        geoRadius: 50000,
      },
      { "@type": "AdministrativeArea", name: "Città metropolitana di Bari" },
      ...MARKETS.map((m) => ({ "@type": "City", name: nomeComune(m), url: `${SITE_URL}/dove-siamo/${m.slug}/` })),
    ],
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
