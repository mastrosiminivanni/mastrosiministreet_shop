import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { ProductActions } from "@/components/shop/ProductActions";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { CATEGORY_LABEL, PRODUCTS, getProduct, isLastPiece, isSoldOut, isUnique } from "@/data/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  return { title: p.title, description: `${p.title} a ${p.price}€. ${CATEGORY_LABEL[p.category]}, pezzo unico.` };
}

export default async function ProductPage({ params }: Props) {
  const p = getProduct((await params).slug);
  if (!p) notFound();

  // Abbinamento look: felpe/camicie suggeriscono pantaloni e viceversa.
  const wantPants = p.category !== "pantaloni" && p.category !== "look";
  const matches = PRODUCTS.filter(
    (x) => x.slug !== p.slug && !isSoldOut(x) && (wantPants ? x.category === "pantaloni" : ["felpa", "felpa-strass", "camicia-righe", "camicia-quadri"].includes(x.category)),
  ).slice(0, 4);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <nav aria-label="Percorso" className="mb-4 text-sm text-bianco/70">
        <Link href="/shop" className="hover:text-oro">← Torna al furgone</Link>
      </nav>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative mx-auto w-full max-w-sm md:max-w-none">
          <ProductGallery product={p} />
          <PriceBadge price={p.price} size="lg" className="absolute right-3 top-3" />
        </div>
        <div>
          <PlateBadge>{CATEGORY_LABEL[p.category]}</PlateBadge>
          <h1 className="titolo mt-3 text-3xl sm:text-5xl">{p.title}</h1>
          {p.isExample && <p className="mt-2 text-xs font-bold uppercase text-oro">Prodotto di esempio</p>}
          <p className="mt-3 font-semibold">
            {isSoldOut(p) ? "Venduto" : isLastPiece(p) ? "Ultimo pezzo" : isUnique(p) ? "Pezzo unico: quando è andato, è andato." : `Disponibili: ${p.stock}`}
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-bianco/60">Taglia</dt>
            <dd className="font-semibold">{p.sizes.join(" / ")}</dd>
            {Object.entries(p.measurements).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="capitalize text-bianco/60">{k}</dt>
                <dd className="font-semibold">{v} cm</dd>
              </div>
            ))}
            <dt className="text-bianco/60">Condizioni</dt>
            <dd className="font-semibold">{p.condition}</dd>
          </dl>
          <div className="mt-6">
            <ProductActions product={p} />
          </div>
        </div>
      </div>
      {matches.length > 0 && (
        <section className="mt-14" aria-labelledby="abbina">
          <h2 id="abbina" className="titolo text-2xl">Fai il look completo</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {matches.map((m) => (
              <li key={m.id}><ProductCard product={m} /></li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
