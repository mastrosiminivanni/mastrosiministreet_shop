import type { Metadata } from "next";
import { Dato } from "@/components/legal/Segnaposto";
import { LegalPage } from "@/components/legal/LegalPage";
import { AZIENDA, dato } from "@/data/azienda";
import { INSTAGRAM_URL } from "@/data/markets";

export const metadata: Metadata = { title: "Note legali" };

export default function NoteLegali() {
  return (
    <LegalPage titolo="Note legali" aggiornato="ottobre 2026">
      <h2>Chi siamo</h2>
      <dl className="space-y-1">
        <div>
          <dt className="inline font-semibold">Ragione sociale: </dt>
          <dd className="inline">
            <Dato v={AZIENDA.ragioneSociale} />
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold">Sede legale: </dt>
          <dd className="inline">
            <Dato v={AZIENDA.sedeLegale} />
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold">Partita IVA: </dt>
          <dd className="inline">
            <Dato v={AZIENDA.partitaIva} />
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold">Codice fiscale: </dt>
          <dd className="inline">
            <Dato v={AZIENDA.codiceFiscale} />
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold">Iscrizione REA: </dt>
          <dd className="inline">
            <Dato v={AZIENDA.rea} />
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold">Email: </dt>
          <dd className="inline">
            <Dato v={AZIENDA.email} />
          </dd>
        </div>
        {dato(AZIENDA.pec) && (
          <div>
            <dt className="inline font-semibold">PEC: </dt>
            <dd className="inline">
              <Dato v={AZIENDA.pec} />
            </dd>
          </div>
        )}
      </dl>

      <h2>Cosa fa questo sito</h2>
      <p>
        Questo sito presenta i capi che portiamo ai mercati settimanali, i prezzi e il calendario
        delle tappe del furgone. Non è un negozio online: non si acquista dal sito. Per comprare si
        viene al furgone oppure ci si mette in contatto con noi su{" "}
        <a href={INSTAGRAM_URL} rel="noopener">
          Instagram
        </a>
        .
      </p>

      <h2>Contenuti e immagini</h2>
      <p>
        Testi, logo e grafica del furgone sono di Mastrosimini Street Shop. Il modello 3D del
        furgone è &quot;Mercedes-Benz Sprinter&quot; di Savelliy 07, licenza{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">
          CC BY 4.0
        </a>
        , adattato con la nostra livrea. I prezzi sono in euro e i capi sono pezzi in quantità
        limitata: la disponibilità può cambiare nel corso della giornata.
      </p>

      <h2>Mappe</h2>
      <p>
        Le mappe usano i dati di{" "}
        <a href="https://www.openstreetmap.org/copyright" rel="noopener">
          OpenStreetMap
        </a>{" "}
        (© collaboratori di OpenStreetMap). I punti di sosta del furgone sono indicativi: il punto
        esatto lo annunciamo su Instagram.
      </p>
    </LegalPage>
  );
}
