import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Cosa c'è nel furgone",
  description: "Felpe, pantaloni, camicie e maglie nuovi, dai 25€. Pezzi unici: quando è andato, è andato.",
};

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="titolo text-4xl sm:text-6xl">Quanto costa?</h1>
      <p className="mt-2 mb-6 text-bianco/80">Pezzo unico: quando è andato, è andato.</p>
      <ShopBrowser products={products} />
    </main>
  );
}
