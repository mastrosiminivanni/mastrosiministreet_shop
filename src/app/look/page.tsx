import type { Metadata } from "next";
import { LookComposer } from "@/components/shop/LookComposer";
import { ProductCard } from "@/components/shop/ProductCard";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { PRODUCTS } from "@/data/products";

export const metadata: Metadata = {
  title: "Look completi",
  description: "Look completo a 50€: felpa + pantalone. Già pronti o componi il tuo.",
};

export default function LookPage() {
  const bundles = PRODUCTS.filter((p) => p.isBundle);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PlateBadge>Look completi</PlateBadge>
      <div className="mt-3 flex items-center gap-4">
        <h1 className="titolo text-4xl sm:text-6xl">Quanto costa tutto?</h1>
        <PriceBadge price={50} label="Totale look" size="lg" className="shrink-0" />
      </div>
      <p className="mt-2 text-bianco/80">Felpa + pantalone, a prezzo fisso. Già pronti qui sotto, oppure componi il tuo.</p>
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {bundles.map((p) => (
          <li key={p.id}><ProductCard product={p} /></li>
        ))}
      </ul>
      <div className="mt-10">
        <LookComposer />
      </div>
    </main>
  );
}
