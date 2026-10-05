"use client";

import { useState } from "react";
import { BUNDLE_RULES } from "@/data/bundles";
import { PRODUCTS, isSoldOut, type Product } from "@/data/products";
import { eur } from "@/lib/format";
import { useCart } from "@/store/cart";

const TOPS = PRODUCTS.filter((p) => !isSoldOut(p) && ["felpa", "felpa-strass", "camicia-righe", "camicia-quadri"].includes(p.category));
const BOTTOMS = PRODUCTS.filter((p) => !isSoldOut(p) && p.category === "pantaloni");

const sel = "mt-1 w-full rounded-tag border border-white/20 bg-nero px-3 py-3 text-sm";

/** Compone un look (capo sopra + pantalone) e mostra prezzo e risparmio rispetto ai pezzi singoli. */
export function LookComposer() {
  const add = useCart((s) => s.add);
  const [top, setTop] = useState("");
  const [bottom, setBottom] = useState("");
  const t: Product | undefined = TOPS.find((p) => p.slug === top);
  const b: Product | undefined = BOTTOMS.find((p) => p.slug === bottom);

  const singles = (t?.price ?? 0) + (b?.price ?? 0);
  const rule = t && b ? BUNDLE_RULES.find((r) => r.top.includes(t.category) && r.bottom.includes(b.category)) : undefined;
  const total = rule ? rule.price : singles;
  const saving = Math.max(0, singles - total);

  return (
    <div className="rounded-tag border-2 border-oro p-5">
      <h2 className="titolo text-2xl">Componi il tuo look</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Sopra
          <select className={sel} value={top} onChange={(e) => setTop(e.target.value)}>
            <option value="">Scegli</option>
            {TOPS.map((p) => (
              <option key={p.slug} value={p.slug}>{p.title} · {eur(p.price)}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Pantalone
          <select className={sel} value={bottom} onChange={(e) => setBottom(e.target.value)}>
            <option value="">Scegli</option>
            {BOTTOMS.map((p) => (
              <option key={p.slug} value={p.slug}>{p.title} · {eur(p.price)}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4" aria-live="polite">
        {t && b ? (
          <>
            <p className="text-lg font-extrabold">
              Totale look: <span className="text-oro">{eur(total)}</span>
              {rule && <span className="ml-2 text-sm font-semibold text-bianco/70">({rule.name} a prezzo fisso)</span>}
            </p>
            <p className="text-sm text-bianco/70">
              {saving > 0 ? `Risparmi ${eur(saving)} rispetto ai pezzi singoli (${eur(singles)}).` : `Pezzi singoli: ${eur(singles)}.`}
            </p>
            <button
              type="button"
              className="mt-3 rounded-tag bg-oro px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-nero hover:brightness-110"
              onClick={() => {
                add({ slug: t.slug });
                add({ slug: b.slug });
              }}
            >
              Metti il look nel carrello
            </button>
          </>
        ) : (
          <p className="text-sm text-bianco/70">Scegli un capo sopra e un pantalone: vedi subito il prezzo.</p>
        )}
      </div>
    </div>
  );
}
