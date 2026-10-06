import type { Metadata } from "next";
import { Dato } from "@/components/legal/Segnaposto";
import { LegalPage } from "@/components/legal/LegalPage";
import { AZIENDA } from "@/data/azienda";
import { CLARITY_ID } from "@/data/site";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <LegalPage titolo="Informativa sulla privacy" aggiornato="6 ottobre 2026">
      <p>
        Questa informativa spiega quali dati personali tratta questo sito e perché, ai sensi del
        Regolamento UE 2016/679 (GDPR).
      </p>

      <h2>Titolare del trattamento</h2>
      <p>
        <Dato v={AZIENDA.ragioneSociale} />, sede legale <Dato v={AZIENDA.sedeLegale} />, P.IVA{" "}
        <Dato v={AZIENDA.partitaIva} />. Contatto per la privacy: <Dato v={AZIENDA.email} />.
      </p>

      <h2>Quali dati trattiamo</h2>
      <ul>
        <li>
          <strong>Dati di navigazione.</strong> Quando visiti il sito, il servizio che lo ospita
          registra in modo tecnico l&apos;indirizzo IP, la data e l&apos;ora, le pagine richieste e
          il tipo di browser. Servono a farlo funzionare e a proteggerlo da abusi.
        </li>
        {CLARITY_ID && (
          <li>
            <strong>Statistiche d&apos;uso (Microsoft Clarity), solo con il tuo consenso.</strong>{" "}
            Registra in forma anonima come usi il sito (clic, scorrimento, mappe di calore,
            riproduzione delle sessioni) per aiutarci a migliorarlo. Se rifiuti, non viene caricato.
          </li>
        )}
        <li>
          <strong>Mappe.</strong> La pagina &quot;Dove siamo&quot; carica le mappe da OpenStreetMap:
          il tuo browser contatta i loro server e quindi il tuo indirizzo IP è visibile a loro.
        </li>
        <li>
          <strong>Contatti su Instagram.</strong> Se ci scrivi su Instagram, i tuoi messaggi sono
          gestiti da Meta secondo la sua informativa; noi li usiamo solo per risponderti.
        </li>
        <li>
          <strong>Link a Vinted.</strong> Dal sito puoi aprire il nostro profilo su Vinted: da quel
          momento i tuoi dati sono trattati da Vinted secondo la sua informativa. Il sito non invia
          a Vinted alcun dato su di te.
        </li>
      </ul>
      <p>
        Il sito pubblico non ha moduli né pagamenti per chi lo visita: non raccogliamo altri dati
        dei visitatori. Esiste un&apos;area riservata al titolare, usata solo per caricare e gestire
        i capi: per entrare si usa un servizio di autenticazione (Supabase) che tratta soltanto
        l&apos;email e i dati di accesso del titolare.
      </p>

      <h2>Perché e su quale base</h2>
      <ul>
        <li>Far funzionare e proteggere il sito: legittimo interesse (art. 6.1.f GDPR).</li>
        {CLARITY_ID && (
          <li>
            Statistiche d&apos;uso: il tuo consenso (art. 6.1.a), che puoi revocare in ogni momento.
          </li>
        )}
        <li>
          Rispondere ai messaggi che ci mandi: misure precontrattuali su tua richiesta (art. 6.1.b).
        </li>
        <li>
          Accesso all&apos;area riservata del titolare: esecuzione dell&apos;attività svolta dal
          titolare stesso (legittimo interesse, art. 6.1.f).
        </li>
      </ul>

      <h2>Per quanto tempo</h2>
      <p>
        I dati di navigazione restano per il tempo tecnico stabilito dal servizio di hosting. I
        messaggi su Instagram, finché serve a rispondere. Per Clarity valgono i tempi indicati
        nell&apos;informativa di Microsoft.
      </p>

      <h2>Con chi li condividiamo</h2>
      <p>
        Con i fornitori che rendono possibile il sito: l&apos;hosting (GitHub),{" "}
        {CLARITY_ID ? "Microsoft per le statistiche, " : ""}OpenStreetMap per le mappe, Supabase per
        l&apos;archivio delle foto dei capi e per l&apos;accesso all&apos;area riservata, e Meta per
        Instagram. Alcuni hanno sede negli Stati Uniti e trattano i dati con le garanzie previste
        dalla normativa (per esempio il Data Privacy Framework UE-USA). Non vendiamo dati a nessuno.
      </p>

      <h2>I tuoi diritti</h2>
      <p>
        Puoi chiedere accesso, rettifica, cancellazione, limitazione, opposizione e portabilità dei
        tuoi dati (artt. 15-22 GDPR) scrivendo a <Dato v={AZIENDA.email} />. Se pensi che i tuoi
        dati non siano trattati correttamente puoi fare reclamo al{" "}
        <a href="https://www.garanteprivacy.it" rel="noopener">
          Garante per la protezione dei dati personali
        </a>
        .
      </p>
    </LegalPage>
  );
}
