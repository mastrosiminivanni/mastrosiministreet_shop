# Mastrosimini Street Shop

Sito di **Mastrosimini Street Shop**: il mercato ambulante di abbigliamento uomo con il furgone che gira un paese diverso ogni giorno.
Instagram: [@mastrosiministreet_shop](https://www.instagram.com/mastrosiministreet_shop/).

Sito live: https://mastrosiminivanni.github.io/mastrosiministreet_shop/

Non è un negozio online: si compra al furgone o scrivendo su Instagram. Il sito mostra i capi, i prezzi e dove siamo oggi.

## Avvio in locale

```bash
export PATH=$HOME/.local/node/bin:$PATH     # Node è installato in ~/.local/node
npm install
npm run dev                                  # http://localhost:3000
```

Altri comandi: `npm run lint`, `npm run build`, `npm test` (logica orari), `npm run test:e2e` (percorso principale su telefono + accessibilità).

## Dove si cambiano le cose

| Cosa | File |
| --- | --- |
| Mercati, giorni, punti di sosta, **orari 7–13** | `src/data/markets.ts` (`MARKETS`, `MARKET_HOURS`) |
| Tappe speciali della **domenica** (e il loro orario) | `src/data/special-stops.ts` |
| Capi, prezzi, taglie, foto (oggi di **esempio**) | `src/data/products.ts` |
| **Dati aziendali** (ragione sociale, P.IVA, sede, email, PEC) | `src/data/azienda.ts` — finché sono tra `[parentesi]` il sito li evidenzia |
| Indirizzo del sito, **ID Microsoft Clarity** | `src/data/site.ts` |
| Testi di Chi siamo, Contatti/FAQ, Privacy, Cookie | `src/app/chi-siamo`, `src/app/contatti`, `src/app/legal/*` |
| Foto "Vanni e Gianfranco" in Chi siamo | copia il file in `public/foto/` chiamandolo `banco.jpg` (o `.png`, `.webp`) |

## Cookie e statistiche

Solo **Microsoft Clarity**, caricato **dopo il consenso** dal banner (Accetta e Rifiuta alla pari). Senza consenso non parte nessuna richiesta.
La scelta si cambia da *Cookie* nel footer. Se in `src/data/site.ts` svuoti `CLARITY_ID`, il banner sparisce e non si carica nulla.

## Furgone 3D

Sprinter con la livrea Mastrosimini e ruote che girano, in `public/models/van.glb`. Si rigenera con gli script in `blender/`
(istruzioni in `blender/README.md`). Modello di partenza: "Mercedes-Benz Sprinter" di Savelliy 07, CC BY 4.0 (vedi `CREDITS.md`).

Per la velocità, in home si vede subito un'immagine del furgone (`public/brand/poster-mobile.webp` e `poster-desktop.webp`) e il 3D parte
circa 3 secondi dopo il caricamento (o al primo tocco/scorrimento). Senza 3D (browser vecchio, "riduci movimento", telefono lento) o se il
modello non arriva, resta l'immagine. **Se cambi il modello o la livrea, rigenera le immagini**: avvia il sito (`npm run dev -- -p 3400`) e
lancia `node scripts/genera-poster.mjs http://localhost:3400`.

## Pubblicare

Il sito è statico su **GitHub Pages**:

```bash
git push                              # salva il codice
bash scripts/deploy-pages.sh          # costruisce e pubblica sul ramo gh-pages
```

Con un dominio proprio (es. da Aruba) conviene spostare l'hosting su **Vercel** (gratis): vedi la sezione sotto.

## Sito e pannello admin (da fare)

Per inserire i capi da soli (foto, taglia, prezzo → annuncio e SEO generati) serve un archivio dati e un login: non si può fare su GitHub Pages.
Piano: **Vercel** (sito) + **Supabase** (database, foto, login). Il sito oggi legge `src/data/products.ts`; la forma di `Product` è già pensata per migrare.

## Controlli fatti

Lighthouse mobile (misurato in locale): Accessibilità 100, Best practices 100, SEO 100. La velocità dipende dal 3D: su un telefono vero va verificata
con [PageSpeed Insights](https://pagespeed.web.dev/) una volta pubblicato su dominio.
