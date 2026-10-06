import { SITE_URL } from "@/data/site";
import { isSoldOut, isUnique } from "@/data/products";
import { getProducts } from "@/lib/catalog";

// Sito statico: il file si genera una volta a ogni pubblicazione, con i capi del momento.
export const dynamic = "force-static";

/** Catalogo in JSON per agenti e programmi: stessi dati dello shop. */
export async function GET() {
  const prodotti = await getProducts();
  const corpo = {
    site: SITE_URL,
    generated_at: new Date().toISOString(),
    currency: "EUR",
    online_checkout: false,
    how_to_buy: `${SITE_URL}/contatti/`,
    items: prodotti.map((p) => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      price_eur: p.price,
      sizes: p.sizes,
      available: !isSoldOut(p),
      pieces_left: p.stock,
      unique_piece: isUnique(p),
      example: p.isExample,
      url: `${SITE_URL}/shop/${p.slug}/`,
      image: p.images.find((i) => i.startsWith("http")) ?? null,
    })),
  };
  return new Response(JSON.stringify(corpo, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
