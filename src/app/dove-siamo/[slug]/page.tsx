import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { asset } from "@/lib/asset";
import {
  CTA_INSTAGRAM,
  INSTAGRAM_DM_URL,
  MARKETS,
  MARKET_HOURS,
  PROVINCIA,
  mapsUrl,
  nomeComune,
} from "@/data/markets";
import { isSoldOut } from "@/data/products";
import { SITE_NAME, SITE_URL } from "@/data/site";
import { getProducts } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

const GIORNI = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function generateStaticParams() {
  return MARKETS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = MARKETS.find((x) => x.slug === slug);
  if (!m) return {};
  return {
    title: `Abbigliamento uomo a ${nomeComune(m)}: al mercato ogni ${m.dayName.toLowerCase()}`,
    description: `Il furgone di ${SITE_NAME} è al mercato di ${nomeComune(m)} (${PROVINCIA.sigla}) ogni ${m.dayName.toLowerCase()} dalle ${MARKET_HOURS.from} alle ${MARKET_HOURS.to}, in ${m.spot}. Felpe, jeans, maglie e camicie da uomo, nuovi, dai 25€.`,
  };
}

/** Una pagina per ogni paese: chi cerca "abbigliamento uomo" più il nome del paese trova giorno, punto e capi. */
export default async function MercatoPage({ params }: Props) {
  const { slug } = await params;
  const m = MARKETS.find((x) => x.slug === slug);
  if (!m) notFound();
  const comune = nomeComune(m);
  const capi = (await getProducts()).filter((p) => !isSoldOut(p)).slice(0, 8);
  const altri = MARKETS.filter((x) => x.slug !== m.slug);

  const luogo = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: `${SITE_NAME} al mercato di ${comune}`,
    url: `${SITE_URL}/dove-siamo/${m.slug}/`,
    image: `${SITE_URL}/og.jpg`,
    priceRange: "€",
    parentOrganization: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/` },
    address: {
      "@type": "PostalAddress",
      streetAddress: m.spot,
      addressLocality: comune,
      addressRegion: PROVINCIA.sigla,
      addressCountry: "IT",
    },
    geo: { "@type": "GeoCoordinates", latitude: m.lat, longitude: m.lng },
    hasMap: mapsUrl(m),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: GIORNI[m.day],
      opens: MARKET_HOURS.start,
      closes: MARKET_HOURS.end,
    },
  };
  const briciole = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Dove siamo", item: `${SITE_URL}/dove-siamo/` },
      { "@type": "ListItem", position: 3, name: comune },
    ],
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(luogo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(briciole) }} />
      <nav aria-label="Percorso" className="mb-4 text-sm text-bianco/70">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-oro">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/dove-siamo/" className="hover:text-oro">Dove siamo</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-bianco">{comune}</li>
        </ol>
      </nav>
      <h1 className="titolo text-4xl sm:text-6xl">Abbigliamento uomo a {comune}</h1>
      <p className="mt-3 max-w-3xl text-lg text-bianco/85">
        Ogni <strong>{m.dayName.toLowerCase()}</strong>, dalle {MARKET_HOURS.from} alle {MARKET_HOURS.to}, il
        furgone di {SITE_NAME} è al mercato settimanale di {comune}, in {PROVINCIA.nome}. Trovi felpe, jeans,
        pantaloni, maglie, cardigan e camicie da uomo, tutti nuovi, dai 25€: li provi al banco e li porti a casa.
      </p>

      <dl className="mt-6 grid max-w-xl grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        <dt className="text-bianco/60">Giorno</dt>
        <dd className="font-semibold">Ogni {m.dayName.toLowerCase()}</dd>
        <dt className="text-bianco/60">Orario</dt>
        <dd className="font-semibold">
          {MARKET_HOURS.from}-{MARKET_HOURS.to}
        </dd>
        <dt className="text-bianco/60">Dove</dt>
        <dd className="font-semibold">
          {m.spot}, {comune} ({PROVINCIA.sigla})
        </dd>
      </dl>
      <p className="mt-3 text-sm text-bianco/60">
        Il punto esatto lo mettiamo ogni mattina nelle storie Instagram.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={mapsUrl(m)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-tag bg-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-tinta hover:brightness-110"
        >
          Portami al mercato
        </a>
        <a
          href={INSTAGRAM_DM_URL}
          rel="noopener"
          className="rounded-tag border-2 border-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:bg-oro hover:text-tinta"
        >
          {CTA_INSTAGRAM}
        </a>
        <a
          href={asset("/calendario.ics")}
          className="rounded-tag border-2 border-white/20 px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide hover:border-oro hover:text-oro"
        >
          Aggiungi al calendario
        </a>
      </div>

      {capi.length > 0 && (
        <section className="mt-14" aria-labelledby="capi">
          <h2 id="capi" className="titolo text-2xl">Cosa trovi nel furgone a {comune}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {capi.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <Link href="/shop/" className="font-semibold text-oro underline underline-offset-4">
              Tutti i capi
            </Link>
          </p>
        </section>
      )}

      <section className="mt-14" aria-labelledby="altri">
        <h2 id="altri" className="titolo text-2xl">Gli altri mercati in {PROVINCIA.nome}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {altri.map((x) => (
            <li key={x.slug}>
              <Link href={`/dove-siamo/${x.slug}/`} className="hover:text-oro">
                <strong>{x.dayName}</strong>: {nomeComune(x)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
