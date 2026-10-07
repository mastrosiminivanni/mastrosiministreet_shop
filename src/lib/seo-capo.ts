import { MARKETS } from "@/data/markets";
import { SITE_NAME } from "@/data/site";

/** "Felpa zip bordeaux" -> "felpa-zip-bordeaux": indirizzo leggibile (senza accenti né simboli). */
export function slugDa(titolo: string): string {
  return (
    titolo
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "") || "capo"
  );
}

const elenco = (v: string[]) => (v.length > 1 ? `${v.slice(0, -1).join(", ")} e ${v[v.length - 1]}` : (v[0] ?? ""));

/**
 * Descrizione scritta dal sistema quando non ne hai messa una tua: nome del capo, taglie, prezzo, "nuovo", dove trovarlo.
 * Serve a Google e alle anteprime sui social; una descrizione scritta a mano nel pannello ha sempre la precedenza.
 */
export function descrizioneAuto(c: { title: string; price: number; sizes: string[] }): string {
  const taglie = c.sizes.length ? `, taglie ${elenco(c.sizes)}` : "";
  const paesi = elenco(MARKETS.map((m) => m.town));
  return `${c.title}: capo nuovo${taglie}, a ${c.price}€. Pezzo unico di ${SITE_NAME}, il furgone che ogni giorno è in un mercato diverso della Puglia (${paesi}). Passa a trovarci o scrivici su Instagram per prenotarlo.`;
}
