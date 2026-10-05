import type { Metadata } from "next";
import Link from "next/link";
import { Dato } from "@/components/legal/Segnaposto";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { AZIENDA, dato } from "@/data/azienda";
import { INSTAGRAM_DM_URL, INSTAGRAM_URL, MARKET_HOURS, SUNDAY_NOTE, VINTED_URL } from "@/data/markets";

export const metadata: Metadata = {
  title: "Contatti e domande frequenti",
  description: "Come comprare un capo, a che ora siamo al mercato e come contattarci: il modo più veloce è Instagram.",
};

const FAQ = [
  {
    d: "Come si compra un capo?",
    r: (
      <>
        Vieni al furgone nel mercato del giorno oppure scrivici su Instagram. Dal sito non si acquista: il sito serve a farti vedere cosa
        c&apos;è e dove siamo. Siamo anche su{" "}
        <a href={VINTED_URL} target="_blank" rel="noopener noreferrer" className="text-oro underline">Vinted</a>: se non trovi la taglia
        che cerchi, scrivici su Instagram e la carichiamo noi per te.
      </>
    ),
  },
  {
    d: "Dove siete oggi?",
    r: (
      <>
        Lo trovi in <Link href="/dove-siamo" className="text-oro underline">Dove siamo</Link>: il paese del giorno, il punto e la mappa.
      </>
    ),
  },
  {
    d: "A che ora siete al mercato?",
    r: (
      <>
        Dal lunedì al sabato dalle {MARKET_HOURS.label.replace(" – ", " alle ")}. {SUNDAY_NOTE}
      </>
    ),
  },
  {
    d: "Come faccio a sapere se un capo è ancora disponibile?",
    r: <>Scrivici su Instagram con il nome del capo. Sono pezzi in quantità limitata: quando è andato, è andato.</>,
  },
  {
    d: "Quali taglie e misure avete?",
    r: <>Ogni scheda indica le taglie e le misure in centimetri. Il banco ha roba per ragazzi e per adulti.</>,
  },
];

export default function ContattiPage() {
  const email = dato(AZIENDA.email);
  const tel = dato(AZIENDA.telefono);
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PlateBadge>Contatti</PlateBadge>
      <h1 className="titolo mt-3 text-4xl sm:text-6xl">Scrivici</h1>
      <p className="mt-3 text-lg">Il modo più veloce per parlare con noi è Instagram.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={INSTAGRAM_DM_URL}
          rel="noopener"
          className="rounded-tag bg-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-nero hover:brightness-110"
        >
          Contattaci su Instagram
        </a>
        <a
          href={INSTAGRAM_URL}
          rel="noopener"
          className="rounded-tag border-2 border-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:bg-oro hover:text-nero"
        >
          @mastrosiministreet_shop
        </a>
      </div>
      {(email || tel) && (
        <p className="mt-4 text-bianco/80">
          {email && <>Email: <a className="text-oro underline" href={`mailto:${email}`}>{email}</a></>}
          {email && tel && " · "}
          {tel && <>Telefono: <a className="text-oro underline" href={`tel:${tel.replace(/\s/g, "")}`}>{tel}</a></>}
        </p>
      )}

      <h2 className="titolo mt-12 text-3xl">Domande frequenti</h2>
      <div className="mt-4 divide-y divide-white/15 border-y border-white/15">
        {FAQ.map((f) => (
          <details key={f.d} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
              {f.d}
              <span aria-hidden="true" className="text-2xl text-oro transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-bianco/85">{f.r}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-sm text-bianco/60">
        Dati dell&apos;azienda e note legali: <Link href="/legal/note-legali/" className="text-oro underline">Note legali</Link>.{" "}
        {!email && <Dato v={AZIENDA.email} />}
      </p>
    </main>
  );
}
