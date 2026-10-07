"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import type { Product } from "@/data/products";
import { ProductImage } from "./ProductImage";

/** Galleria 9:16: si scorre con il dito (o le frecce), con contatore, puntini e miniature. */
export function ProductGallery({ product }: { product: Product }) {
  const [i, setI] = useState(0);
  const pista = useRef<HTMLUListElement>(null);
  const n = product.images.length;

  function vaiA(idx: number) {
    const el = pista.current;
    if (!el) return;
    el.scrollTo({
      left: idx * el.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  return (
    <div>
      <div className="relative">
        <ul
          ref={pista}
          onScroll={(e) => {
            const el = e.currentTarget;
            setI(Math.round(el.scrollLeft / el.clientWidth));
          }}
          tabIndex={0}
          aria-label={`Foto di ${product.title}`}
          onKeyDown={(e) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
            e.preventDefault();
            vaiA(e.key === "ArrowRight" ? Math.min(n - 1, i + 1) : Math.max(0, i - 1));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-tag [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {product.images.map((src, idx) => (
            <li key={src} className="w-full shrink-0 snap-center">
              <ProductImage
                src={src}
                alt={`${product.title}, foto ${idx + 1} di ${n}`}
                category={product.category}
                priority={idx === 0}
              />
            </li>
          ))}
        </ul>
        {n > 1 && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-2 rounded-tag bg-nero/80 px-2 py-1 text-xs font-extrabold text-bianco"
            >
              {i + 1} / {n}
            </span>
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
              {product.images.map((src, idx) => (
                <span
                  key={src}
                  className={clsx("h-2 w-2 rounded-full", idx === i ? "bg-oro" : "bg-bianco/50")}
                />
              ))}
            </div>
            {i > 0 && (
              <button
                type="button"
                onClick={() => vaiA(i - 1)}
                aria-label="Foto precedente"
                className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-nero/80 text-xl font-bold text-bianco md:block"
              >
                ←
              </button>
            )}
            {i < n - 1 && (
              <button
                type="button"
                onClick={() => vaiA(i + 1)}
                aria-label="Foto successiva"
                className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full bg-nero/80 text-xl font-bold text-bianco md:block"
              >
                →
              </button>
            )}
          </>
        )}
      </div>
      {n > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {product.images.map((src, idx) => (
            <li key={src} className="w-20 shrink-0">
              <button
                type="button"
                onClick={() => vaiA(idx)}
                aria-label={`Foto ${idx + 1}`}
                aria-current={idx === i}
                className={clsx(
                  "block w-full overflow-hidden rounded-tag border-2",
                  idx === i ? "border-oro" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <ProductImage src={product.thumbs?.[idx] ?? src} alt="" category={product.category} showTag={false} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
