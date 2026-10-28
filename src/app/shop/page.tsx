import type { Metadata } from "next";
import Link from "next/link";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { isSoldOut } from "@/data/products";
import { SITE_NAME, SITE_URL } from "@/data/site";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Abbigliamento uomo nuovo: felpe, jeans, maglie e camicie",
  description:
    "I capi nel furgone di Mastrosimini Street Shop: felpe, jeans, pantaloni, maglie e camicie da uomo, nuovi, dai 25€. Li trovi ai mercati della settimana o li prenoti su Instagram.",
};

export default async function ShopPage() {
  const products = await getProducts();
  // Elenco dei capi veri in vendita: aiuta Google a capire che questa pagina è il catalogo.
  const veri = products.filter((p) => !p.isExample && !isSoldOut(p));
  const elenco = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Cosa c'è nel furgone",
    url: `${SITE_URL}/shop/`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: veri.length,
      itemListElement: veri.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/shop/${p.slug}/`,
        name: p.title,
      })),
    },
  };
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(elenco) }} />
      <h1 className="titolo text-4xl sm:text-6xl">Cosa c&apos;è nel furgone</h1>
      <p className="mt-2 max-w-2xl text-bianco/80">
        Felpe, jeans, pantaloni, maglie e camicie da uomo, tutti nuovi. Ogni capo è un pezzo unico: quando lo
        trovi, è tuo. Domani chissà. Passa al furgone nei{" "}
        <Link href="/dove-siamo/" className="font-semibold text-oro underline underline-offset-4">
          mercati della settimana
        </Link>{" "}
        oppure prenotalo scrivendoci su Instagram.
      </p>
      <div className="mt-6">
        <ShopBrowser products={products} />
      </div>
    </main>
  );
}
