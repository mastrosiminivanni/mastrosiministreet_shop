import {
  INSTAGRAM_DM_URL,
  INSTAGRAM_URL,
  MARKET_HOURS,
  SUNDAY_NOTE,
  VINTED_URL,
} from "@/data/markets";
import { SITE_NAME, SITE_URL } from "@/data/site";

// Sito statico: il file si genera una volta a ogni pubblicazione.
export const dynamic = "force-static";

/** Indice del sito per i modelli linguistici, nel formato di llmstxt.org (Markdown, un H1, riassunto, elenchi di link). */
export function GET() {
  const orario = `dalle ${MARKET_HOURS.from} alle ${MARKET_HOURS.to}`;
  const testo = `# ${SITE_NAME}

> Mercato ambulante di abbigliamento uomo (camicie, felpe, pantaloni, street e oversize) a prezzi da mercato. Un furgone che gira un paese diverso ogni giorno, in Puglia, dal lunedì al sabato ${orario}. ${SUNDAY_NOTE} Azienda italiana di famiglia, da oltre 70 anni sui mercati.

Dal sito non si acquista: si compra al furgone, scrivendo su Instagram o dal profilo Vinted. Tutti i capi sono nuovi e in quantità limitata.

## Pagine

- [Home](${SITE_URL}/): dove siamo oggi e il giro della settimana
- [Shop](${SITE_URL}/shop/): i capi in vendita, con prezzi, taglie e misure
- [Dove siamo](${SITE_URL}/dove-siamo/): il paese di oggi, la mappa e il calendario dei mercati
- [Chi siamo](${SITE_URL}/chi-siamo/): la famiglia e la storia del banco
- [Contatti e domande frequenti](${SITE_URL}/contatti/): come comprare, orari, taglie

## Dati leggibili da programmi

- [Catalogo in JSON](${SITE_URL}/catalogo.json): tutti i capi con prezzo, taglie e disponibilità
- [Calendario dei mercati (.ics)](${SITE_URL}/calendario.ics): un evento settimanale per ogni mercato
- [Sitemap](${SITE_URL}/sitemap.xml)

## Contatti

- [Chat Instagram](${INSTAGRAM_DM_URL}): il modo più veloce per chiedere un capo o una taglia
- [Profilo Instagram](${INSTAGRAM_URL}): storie con il punto esatto di ogni tappa
- [Profilo Vinted](${VINTED_URL}): se manca la taglia, la carichiamo su richiesta

## Optional

- [Privacy](${SITE_URL}/legal/privacy/)
- [Cookie](${SITE_URL}/legal/cookie/)
- [Note legali](${SITE_URL}/legal/note-legali/)
`;
  return new Response(testo, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
