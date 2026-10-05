import { get } from "node:https";
import { cache } from "react";
import { VINTED_URL } from "@/data/markets";
import { SAMPLE_PRODUCTS, type Category, type Product } from "@/data/products";
import { BUCKET_FOTO, SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurato } from "@/lib/supabase";

/** Una riga della tabella "products" di Supabase. */
type Riga = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number;
  sizes: string[];
  measurements: Record<string, number> | null;
  images: string[];
  stock: number;
  initial_stock: number | null;
  market_pickup: string[];
  created_at: string;
};

const CATEGORIE: Category[] = ["camicia", "felpa", "pantaloni", "altro"];
const urlFoto = (percorso: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_FOTO}/${percorso}`;
const piccola = (percorso: string) => percorso.replace(/(\.\w+)$/, "-s$1");

function daRiga(r: Riga): Product {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description ?? undefined,
    category: (CATEGORIE as string[]).includes(r.category ?? "")
      ? (r.category as Category)
      : "altro",
    price: r.price,
    sizes: r.sizes,
    measurements: r.measurements ?? {},
    images: r.images.map(urlFoto),
    thumbs: r.images.map((p) => urlFoto(piccola(p))),
    stock: r.stock,
    initialStock: r.initial_stock ?? undefined,
    marketPickup: r.market_pickup ?? [],
    isExample: false,
    createdAt: r.created_at,
  };
}

/** GET con parsing JSON, senza la cache di Next. Ha un limite di tempo: una richiesta appesa non deve bloccare pagine o pubblicazione. */
function leggiJsonUnaVolta<T>(indirizzo: string, intestazioni: Record<string, string>): Promise<T> {
  return new Promise((ok, no) => {
    const req = get(indirizzo, { headers: intestazioni, agent: false, timeout: 8000 }, (res) => {
      let testo = "";
      res.setEncoding("utf8");
      res.on("data", (pezzo) => (testo += pezzo));
      res.on("end", () => {
        if (!res.statusCode || res.statusCode >= 400)
          return no(new Error(`Supabase non risponde (HTTP ${res.statusCode}).`));
        try {
          ok(JSON.parse(testo) as T);
        } catch {
          no(new Error("Risposta di Supabase non leggibile."));
        }
      });
    });
    req.on("timeout", () => req.destroy(new Error("Supabase non risponde (tempo scaduto).")));
    req.on("error", no);
  });
}

async function leggiJson<T>(indirizzo: string, intestazioni: Record<string, string>): Promise<T> {
  try {
    return await leggiJsonUnaVolta<T>(indirizzo, intestazioni);
  } catch {
    return leggiJsonUnaVolta<T>(indirizzo, intestazioni); // un secondo tentativo, poi l'errore vero
  }
}

/**
 * I capi del sito. Con Supabase collegato legge quelli pubblicati (e venduti) al momento della costruzione del sito;
 * se non ce n'è nemmeno uno mostra i capi di esempio. Se Supabase non risponde la costruzione si ferma: meglio
 * nessuna pubblicazione che un sito con i capi finti per errore.
 */
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!supabaseConfigurato) return SAMPLE_PRODUCTS;
  const righe = await leggiJson<Riga[]>(
    `${SUPABASE_URL}/rest/v1/products?select=*&status=in.(published,sold)&order=created_at.desc`,
    {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  );
  return righe.length ? righe.map(daRiga) : SAMPLE_PRODUCTS;
});

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

/** Link al profilo Vinted: quello scritto nel pannello, altrimenti quello di partenza. */
export const getVintedUrl = cache(async (): Promise<string> => {
  if (!supabaseConfigurato) return VINTED_URL;
  try {
    const righe = await leggiJson<{ value: string }[]>(
      `${SUPABASE_URL}/rest/v1/settings?select=value&key=eq.vinted_url`,
      {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    );
    const v = righe[0]?.value?.trim();
    return v && /^https:\/\/([\w-]+\.)?vinted\.[a-z.]+\//i.test(v) ? v : VINTED_URL;
  } catch {
    return VINTED_URL; // tabella non ancora creata: il sito resta com'è
  }
});
