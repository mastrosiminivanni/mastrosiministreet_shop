import { INSTAGRAM_DM_URL, VINTED_URL } from "@/data/markets";
import { isSoldOut, type Product } from "@/data/products";

/** Per ora non si compra online: si scrive su Instagram. */
export function ProductActions({ product }: { product: Product }) {
  if (isSoldOut(product)) {
    return (
      <p className="rounded-tag border border-white/20 p-4 font-semibold">
        Venduto. Quando è andato, è andato. Guarda gli altri capi nel furgone.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <a
        href={INSTAGRAM_DM_URL}
        rel="noopener"
        className="rounded-tag bg-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-nero hover:brightness-110"
      >
        Contattaci su Instagram
      </a>
      <p className="text-sm text-bianco/70">
        Scrivici in chat con il nome del capo: {product.title}.
      </p>
      <a
        href={VINTED_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 rounded-tag border-2 border-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:bg-oro/10"
      >
        Guarda il nostro profilo Vinted
      </a>
      <p className="text-sm text-bianco/70">
        Non trovi la tua taglia? Scrivici su Instagram e la carichiamo noi su Vinted per te.
      </p>
    </div>
  );
}
