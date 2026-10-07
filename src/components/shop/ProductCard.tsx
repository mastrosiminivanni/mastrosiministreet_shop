"use client";

import Link from "next/link";
import { useRef } from "react";
import clsx from "clsx";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { isLastPiece, isSoldOut, type Product } from "@/data/products";
import { ProductImage } from "./ProductImage";

/** Card 2D con leggero effetto tilt (disattivato con prefers-reduced-motion). */
export function ProductCard({ product }: { product: Product }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const sold = isSoldOut(product);

  function tilt(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || e.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  }

  return (
    <Link
      ref={ref}
      href={`/shop/${product.slug}`}
      onPointerMove={tilt}
      onPointerLeave={() => ref.current && (ref.current.style.transform = "")}
      className="group relative block overflow-hidden rounded-tag border border-white/10 bg-nero transition-transform duration-150"
    >
      <ProductImage
        src={product.thumbs?.[0] ?? product.images[0]}
        alt={`${product.title}${sold ? " (venduto)" : ""}`}
        category={product.category}
        showTag={false}
        className={clsx(sold && "opacity-40 grayscale")}
      />
      <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
        {sold ? (
          <span className="rounded-tag bg-bianco px-2 py-0.5 text-[11px] font-extrabold uppercase text-nero">Venduto</span>
        ) : (
          <span className="rounded-tag bg-nero/85 px-2 py-0.5 text-[11px] font-bold uppercase text-oro">
            {isLastPiece(product) ? "Ultimo pezzo" : product.stock === 1 ? "Pezzo unico" : "Pochi pezzi"}
          </span>
        )}
        {product.images.length > 1 && (
          <span className="rounded-tag bg-nero/85 px-2 py-0.5 text-[10px] font-semibold uppercase text-bianco/80">
            {product.images.length} foto
          </span>
        )}
        {product.isExample && (
          <span className="rounded-tag bg-nero/85 px-2 py-0.5 text-[10px] font-semibold uppercase text-bianco/70">Esempio</span>
        )}
      </div>
      <PriceBadge price={product.price} size="sm" className="absolute right-2 top-2" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-nero via-nero/80 to-transparent p-3 pt-10">
        <h3 className="text-sm font-bold leading-tight">{product.title}</h3>
        <p className="mt-0.5 text-xs text-bianco/70">Taglia {product.sizes.join(" / ")}</p>
      </div>
    </Link>
  );
}
