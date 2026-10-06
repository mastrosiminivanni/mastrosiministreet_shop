import type { Metadata } from "next";
import Link from "next/link";
import { Dato } from "@/components/legal/Segnaposto";
import { AZIENDA, dato } from "@/data/azienda";
import {
  INSTAGRAM_DM_URL,
  INSTAGRAM_URL,
  MARKET_HOURS,
  SUNDAY_NOTE,
  CTA_INSTAGRAM,
} from "@/data/markets";
import { getVintedUrl } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Contatti e domande frequenti",
  description:
    "Come comprare un capo, a che ora siamo al mercato e come contattarci: il modo più veloce è Instagram.",
};

const faq = (vinted: string) => [
  {
    d: "Come compro?",
    r: (
      <>
        Ci sono tre modi. <strong>Al furgone:</strong> vieni nel mercato del giorno, provi e porti a
        casa. <strong>Su Instagram:</strong> scrivici in chat con il nome del capo e ci mettiamo
        d&apos;accordo. <strong>Su Vinted:</strong> trovi i nostri capi sul{" "}
        <a href={vinted} target="_blank" rel="noopener noreferrer" className="text-oro underline">
          profilo Vinted
        </a>
        ; se non c&apos;è la taglia che cerchi, chiedicela su Instagram e la carichiamo noi per te.
        Dal sito non si acquista: serve a farti vedere cosa c&apos;è e dove siamo.
      </>
    ),
  },
  {
    d: "Dove siete oggi?",
    r: (
      <>
        Lo trovi in{" "}
        <Link href="/dove-siamo" className="text-oro underline">
          Dove siamo
        </Link>
        : il paese del giorno, il punto e la mappa.
      </>
    ),
  },
  {
    d: "A che ora siete al mercato?",
    r: (
      <>
        Dal lunedì al sabato dalle {MARKET_HOURS.from} alle {MARKET_HOURS.to}. {SUNDAY_NOTE}
      </>
    ),
  },
  {
    d: "Come faccio a sapere se un capo è ancora disponibile?",
    r: (
      <>
        Scrivici su Instagram con il nome del capo. Sono pezzi in quantità limitata: quando è
        andato, è andato.
      </>
    ),
  },
  {
    d: "Quali taglie e misure avete?",
    r: (
      <>
        Ogni scheda indica le taglie e le misure in centimetri. Il banco ha roba per ragazzi e per
        adulti.
      </>
    ),
  },
];

export default async function ContattiPage() {
  const FAQ = faq(await getVintedUrl());
  const email = dato(AZIENDA.email);
  const tel = dato(AZIENDA.telefono);
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="titolo text-4xl sm:text-6xl">Scrivici</h1>
      <p className="mt-3 text-lg">Il modo più veloce per parlare con noi è Instagram.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={INSTAGRAM_DM_URL}
          rel="noopener"
          className="rounded-tag bg-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-tinta hover:brightness-110"
        >
          {CTA_INSTAGRAM}
        </a>
        <a
          href={INSTAGRAM_URL}
          rel="noopener"
          className="rounded-tag border-2 border-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:bg-oro hover:text-tinta"
        >
          @mastrosiministreet_shop
        </a>
      </div>
      {(email || tel) && (
        <p className="mt-4 text-bianco/80">
          {email && (
            <>
              Email:{" "}
              <a className="text-oro underline" href={`mailto:${email}`}>
                {email}
              </a>
            </>
          )}
          {email && tel && ", "}
          {tel && (
            <>
              Telefono:{" "}
              <a className="text-oro underline" href={`tel:${tel.replace(/\s/g, "")}`}>
                {tel}
              </a>
            </>
          )}
        </p>
      )}

      <h2 className="titolo mt-12 text-3xl">Domande frequenti</h2>
      <div className="mt-4 divide-y divide-white/15 border-y border-white/15">
        {FAQ.map((f) => (
          <details key={f.d} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
              {f.d}
              <span
                aria-hidden="true"
                className="text-2xl text-oro transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-bianco/85">{f.r}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-sm text-bianco/60">
        Dati dell&apos;azienda e note legali:{" "}
        <Link href="/legal/note-legali/" className="text-oro underline">
          Note legali
        </Link>
        . {!email && <Dato v={AZIENDA.email} />}
      </p>
    </main>
  );
}
