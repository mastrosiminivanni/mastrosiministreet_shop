import Link from "next/link";
import { AZIENDA, dato } from "@/data/azienda";
import { INSTAGRAM_URL, VINTED_URL } from "@/data/markets";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-nero px-4 py-10 text-sm text-bianco/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <p className="titolo text-lg text-bianco">Mastrosimini Street Shop</p>
          <p>Un mercato diverso ogni giorno.</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <a href={INSTAGRAM_URL} className="hover:text-oro" rel="noopener">
              @mastrosiministreet_shop
            </a>
          </li>
          <li>
            <a
              href={VINTED_URL}
              className="hover:text-oro"
              rel="noopener noreferrer"
              target="_blank"
            >
              Il nostro profilo Vinted
            </a>
          </li>
          <li>
            <Link href="/contatti" className="hover:text-oro">
              Contatti e FAQ
            </Link>
          </li>
          <li>
            <Link href="/legal/privacy" className="hover:text-oro">
              Privacy
            </Link>
          </li>
          <li>
            <Link href="/legal/cookie" className="hover:text-oro">
              Cookie
            </Link>
          </li>
          <li>
            <Link href="/legal/note-legali" className="hover:text-oro">
              Note legali
            </Link>
          </li>
        </ul>
      </div>
      {dato(AZIENDA.ragioneSociale) && (
        <p className="mx-auto mt-6 max-w-6xl text-xs text-bianco/60">
          © {new Date().getFullYear()} {AZIENDA.ragioneSociale}
          {dato(AZIENDA.partitaIva) && ` · P.IVA ${AZIENDA.partitaIva}`}
          {dato(AZIENDA.sedeLegale) && ` · ${AZIENDA.sedeLegale}`}
        </p>
      )}
      <p className="mx-auto mt-6 max-w-6xl text-xs text-bianco/50">
        Modello 3D del furgone: &quot;Mercedes-Benz Sprinter&quot; di{" "}
        <a
          href="https://sketchfab.com/3d-models/mercedes-benz-sprinter-152f62800be34652af0545487129ca2e"
          rel="noopener"
          className="underline hover:text-oro"
        >
          Savelliy 07
        </a>
        , licenza{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          rel="noopener"
          className="underline hover:text-oro"
        >
          CC BY 4.0
        </a>
        . Adattato: livrea Mastrosimini, marchi del costruttore rimossi, ruote separate.
      </p>
    </footer>
  );
}
