import type { Metadata } from "next";
import Link from "next/link";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Abbigliamento uomo nuovo: felpe, jeans, maglie e camicie",
  description:
    "I capi nel furgone di Mastrosimini Street Shop: felpe, jeans, pantaloni, maglie e camicie da uomo, nuovi, dai 25€. Li trovi ai mercati della settimana o li prenoti su Instagram.",
};

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="titolo text-4xl sm:text-6xl">Cosa c&apos;è nel furgone</h1>
      <p className="mt-2 max-w-2xl text-bianco/80">
        Felpe, jeans, pantaloni, maglie e camicie da uomo, tutti nuovi. Ogni capo è un pezzo unico: quando è
        andato, è andato. Lo trovi al furgone nei{" "}
        <Link href="/dove-siamo/" className="font-semibold text-oro underline underline-offset-4">
          mercati della settimana
        </Link>{" "}
        oppure lo prenoti scrivendoci su Instagram.
      </p>
      <div className="mt-6">
        <ShopBrowser products={products} />
      </div>
    </main>
  );
}
