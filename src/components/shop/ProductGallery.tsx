"use client";

import { useState } from "react";
import clsx from "clsx";
import type { Product } from "@/data/products";
import { ProductImage } from "./ProductImage";

/** Galleria verticale 9:16; tocca/clicca per zoomare. */
export function ProductGallery({ product }: { product: Product }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setZoom((z) => !z)}
        aria-pressed={zoom}
        aria-label={zoom ? "Riduci la foto" : "Ingrandisci la foto"}
        className={clsx("block w-full overflow-hidden rounded-tag", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
      >
        <ProductImage
          src={product.images[i]}
          alt={`${product.title}, foto ${i + 1}`}
          category={product.category}
          priority
          className={clsx("transition-transform duration-300", zoom && "scale-150")}
        />
      </button>
      {product.images.length > 1 && (
        <ul className="mt-2 flex gap-2">
          {product.images.map((src, idx) => (
            <li key={src} className="w-16">
              <button type="button" onClick={() => setI(idx)} aria-label={`Foto ${idx + 1}`} aria-current={idx === i}>
                <ProductImage src={src} alt="" category={product.category} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
