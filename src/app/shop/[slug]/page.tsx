import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { ProductActions } from "@/components/shop/ProductActions";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { CATEGORY_LABEL, isLastPiece, isSoldOut, isUnique } from "@/data/products";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { SITE_NAME, SITE_URL } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  const descrizione = p.description ?? `${p.title} a ${p.price}€. ${CATEGORY_LABEL[p.category]}, taglia ${p.sizes.join(" / ")}. Disponibile al furgone.`;
  const foto = p.images.filter((i) => !i.startsWith("placeholder:"));
  return {
    title: p.title,
    description: descrizione,
    openGraph: { title: p.title, description: descrizione, type: "website", ...(foto[0] && { images: [{ url: foto[0] }] }) },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();

  // Abbinamenti: felpe/camicie suggeriscono pantaloni e viceversa.
  const wantPants = p.category !== "pantaloni";
  const tutti = await getProducts();
  const matches = tutti.filter(
    (x) => x.slug !== p.slug && !isSoldOut(x) && (wantPants ? x.category === "pantaloni" : ["felpa", "camicia"].includes(x.category)),
  ).slice(0, 4);

  // Dati strutturati "Prodotto" solo per i capi veri (con foto vere): niente dati finti per Google.
  const foto = p.images.filter((i) => !i.startsWith("placeholder:"));
  const jsonLd =
    !p.isExample && foto.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.title,
          description: p.description ?? `${p.title}, taglia ${p.sizes.join(" / ")}.`,
          image: foto.map((f) => (f.startsWith("http") ? f : `${SITE_URL}${f}`)),
          sku: p.id,
          brand: { "@type": "Brand", name: SITE_NAME },
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: p.price,
            itemCondition: "https://schema.org/NewCondition",
            availability: isSoldOut(p) ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
          },
        }
      : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
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
          </dl>
          <div className="mt-6">
            <ProductActions product={p} />
          </div>
        </div>
      </div>
      {matches.length > 0 && (
        <section className="mt-14" aria-labelledby="abbina">
          <h2 id="abbina" className="titolo text-2xl">Abbinalo con</h2>
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
