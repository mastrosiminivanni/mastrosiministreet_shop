import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { Foto } from "@/components/ui/FotoSegnaposto";
import { RoadDivider } from "@/components/ui/RoadDivider";
import { CTA_INSTAGRAM, INSTAGRAM_DM_URL } from "@/data/markets";

export const metadata: Metadata = {
  title: "Chi siamo",
  description:
    "Mastrosimini Street Shop: azienda italiana di famiglia, al mercato da più di 70 anni. Da nonno Giovanni a papà Gianfranco e Vanni, un mercato diverso ogni giorno.",
};

/**
 * Una sola foto: Vanni e Gianfranco dietro il banco.
 * Per metterla basta copiare il file in public/foto/ con il nome "banco" (banco.jpg, banco.jpeg, banco.png o banco.webp).
 */
function fotoBanco() {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    if (existsSync(join(process.cwd(), "public", "foto", `banco.${ext}`)))
      return `/foto/banco.${ext}`;
  }
  return undefined;
}

const NUMERI = [
  { n: "+70", t: "anni di mercato" },
  { n: "3", t: "generazioni al banco" },
  { n: "6:00", t: "si parte da casa" },
  { n: "6", t: "mercati a settimana" },
];

function Capitolo({ titolo, children }: { titolo: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 py-8 md:grid-cols-[2fr_3fr] md:gap-12 md:py-10">
      <h2 className="titolo text-3xl sm:text-5xl">{titolo}</h2>
      <div className="space-y-4 text-lg leading-relaxed text-bianco/90">{children}</div>
    </section>
  );
}

export default function ChiSiamoPage() {
  const banco = fotoBanco();
  return (
    <main>
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <h1 className="titolo text-[clamp(2.6rem,11vw,6.5rem)]">
          Tre generazioni <span className="text-oro">di mercato</span>
        </h1>
        <p className="mt-5 max-w-2xl text-xl font-medium">
          Siamo un&apos;azienda italiana di famiglia. Il mercato lo facciamo da più di 70 anni, e da
          sempre è così: un furgone, un banco, un mercato diverso ogni giorno.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {NUMERI.map((x) => (
            <li key={x.t} className="rounded-tag border-2 border-oro p-4">
              <span className="titolo block text-4xl text-oro sm:text-5xl">{x.n}</span>
              <span className="mt-1 block text-sm font-semibold uppercase tracking-wide">
                {x.t}
              </span>
            </li>
          ))}
        </ul>

        <figure className="mt-8">
          <Foto
            src={banco}
            alt="Gianfranco e Vanni dietro il banco del mercato"
            segnaposto="Vanni e Gianfranco dietro il banco"
            ratio="aspect-[4/3] sm:aspect-[16/9]"
          />
          <figcaption className="mt-2 text-sm text-bianco/60">
            Gianfranco e Vanni, dietro il banco.
          </figcaption>
        </figure>
      </div>

      <div className="mx-auto mt-2 max-w-5xl px-4">
        <Capitolo titolo="Tutto è partito da nonno Giovanni">
          <p>
            Ha cominciato questo lavoro da giovanissimo e, con gli anni, si è costruito una
            reputazione che ancora oggi si sostiene.
          </p>
          <p>Da lì siamo partiti, e da lì continuiamo.</p>
        </Capitolo>

        <Capitolo titolo="Papà Gianfranco: sveglia alle 6">
          <p>
            Oggi il banco lo porta avanti mio padre Gianfranco. Ogni giorno parte di casa alle 6 per
            andare ai mercati, e si dedica a questo lavoro con tutto sé stesso.
          </p>
          <p>
            Quasi ogni giorno gira tra i vari magazzini per portare sempre novità. Per questo, al
            furgone, trovi sempre roba nuova.
          </p>
        </Capitolo>

        <Capitolo titolo="Poi ci sono io, Vanni">
          <p>Nel mercato ci sono cresciuto: ci sono dentro fin da bambino.</p>
          <p>
            Ora voglio portarlo anche online, con i social e con questo sito. Il banco resta il
            banco: il sito serve a farti sapere dove siamo e cosa c&apos;è nel furgone.
          </p>
        </Capitolo>
      </div>

      <RoadDivider />

      <div className="mx-auto max-w-5xl px-4">
        <Capitolo titolo="Cosa trovi al banco">
          <p>Da generazioni ci impegniamo a portare sempre le ultime mode.</p>
          <p>
            Il banco è diviso in due: da una parte la roba per i ragazzi, dall&apos;altra quella per
            gli adulti. Qui sul sito mostriamo soprattutto la parte più giovane, pensata per i
            ragazzi dai 16 ai 25 anni.
          </p>
          <p>
            <strong>Prezzi da mercato, per tutti.</strong> Vogliamo essere accessibili a chiunque.
          </p>
        </Capitolo>
      </div>

      <section className="bg-oro text-tinta">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div>
            <h2 className="titolo text-4xl sm:text-6xl">Un sorriso in più</h2>
            <p className="mt-4 text-xl font-semibold">
              Siamo persone spontanee e simpatiche. Oltre ai vestiti, cerchiamo di regalarti anche
              un sorriso.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dove-siamo"
                className="rounded-tag bg-tinta px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:brightness-125"
              >
                Dove siamo oggi
              </Link>
              <a
                href={INSTAGRAM_DM_URL}
                rel="noopener"
                className="rounded-tag border-2 border-tinta px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide hover:bg-tinta hover:text-oro"
              >
                {CTA_INSTAGRAM}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
