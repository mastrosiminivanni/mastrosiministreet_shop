import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { PreferenzeCookie } from "@/components/CookieBanner";
import { CLARITY_ID } from "@/data/site";

export const metadata: Metadata = { title: "Cookie" };

export default function CookiePolicy() {
  return (
    <LegalPage titolo="Cookie" aggiornato="ottobre 2026">
      <h2>Cosa sono</h2>
      <p>I cookie sono piccoli file che un sito salva nel tuo browser. Alcuni servono a farlo funzionare, altri a capire come viene usato.</p>

      <h2>Cosa usa questo sito</h2>
      <ul>
        <li>
          <strong>Cookie tecnici:</strong> nessuno. Il sito non richiede di accedere e non ha un carrello. Ricordiamo soltanto la tua scelta
          sui cookie, nel browser (non viene inviata a nessuno).
        </li>
        {CLARITY_ID ? (
          <li>
            <strong>Statistiche (Microsoft Clarity), solo se accetti:</strong> ci aiuta a capire come viene usato il sito (pagine viste,
            clic, scorrimento) con mappe di calore e registrazioni anonime delle sessioni. Imposta cookie come <code>_clck</code> e{" "}
            <code>_clsk</code>, con durata massima di un anno. Il testo di Microsoft è su{" "}
            <a href="https://privacy.microsoft.com/privacystatement" rel="noopener">privacy.microsoft.com</a>.
          </li>
        ) : (
          <li><strong>Statistiche e pubblicità:</strong> al momento nessuna.</li>
        )}
      </ul>

      <h2>Come cambiare idea</h2>
      <p>Puoi accettare o rifiutare quando compare il banner, e cambiare scelta in ogni momento:</p>
      <PreferenzeCookie />
      <p>Puoi anche cancellare i cookie dalle impostazioni del tuo browser.</p>
    </LegalPage>
  );
}
