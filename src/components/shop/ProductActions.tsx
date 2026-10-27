import { TienitiDaParte } from "@/components/shop/TienitiDaParte";
import { getVintedUrl } from "@/lib/catalog";
import { isSoldOut, type Product } from "@/data/products";
import { destinazioneVinted } from "@/lib/vinted";

/** Per ora non si compra online: si scrive su Instagram. */
export async function ProductActions({ product }: { product: Product }) {
  const vinted = destinazioneVinted(product, await getVintedUrl());
  if (isSoldOut(product)) {
    return (
      <p className="rounded-tag border border-white/20 p-4 font-semibold">
        Venduto: ti è scappato! Guarda gli altri capi nel furgone.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <TienitiDaParte nome={product.title} prezzo={product.price} />
      <a
        href={vinted.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 rounded-tag border-2 border-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:bg-oro/10"
      >
        {vinted.etichetta}
      </a>
      <p className="text-sm text-bianco/70">
        {vinted.diretto
          ? "Si apre questo capo su Vinted. Non trovi la tua taglia? Scrivici su Instagram."
          : "Non trovi la tua taglia? Scrivici su Instagram e la carichiamo noi su Vinted per te."}
      </p>
    </div>
  );
}
