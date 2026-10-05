import type { Metadata } from "next";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { ShopBrowser } from "@/components/shop/ShopBrowser";

export const metadata: Metadata = {
  title: "Cosa c'è nel furgone",
  description: "Camicie 25€, felpe 30€, pantaloni 20€, look completi 50€. Pezzi unici: quando è andato, è andato.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ mercato?: string }> }) {
  const { mercato } = await searchParams;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PlateBadge>Il furgone</PlateBadge>
      <h1 className="titolo mt-3 text-4xl sm:text-6xl">Quanto costa?</h1>
      <p className="mt-2 mb-6 text-bianco/80">Pezzo unico: quando è andato, è andato.</p>
      <ShopBrowser initialMarket={mercato ?? ""} />
    </main>
  );
}
