import Image from "next/image";
import { asset } from "@/lib/asset";
import clsx from "clsx";
import type { Category } from "@/data/products";

/** Foto 9:16. Con "placeholder:*" disegna un segnaposto a tema (nessun logo di terzi). */
export function ProductImage({
  src,
  alt,
  category,
  className,
  priority,
  showTag = true,
}: {
  src: string;
  alt: string;
  category: Category;
  className?: string;
  priority?: boolean;
  showTag?: boolean;
}) {
  if (!src.startsWith("placeholder:")) {
    return (
      <div className={clsx("relative aspect-[9/16] overflow-hidden bg-[#161616]", className)}>
        <Image src={src.startsWith("/") ? asset(src) : src} alt={alt} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" priority={priority} />
      </div>
    );
  }
  const stripes = category === "camicia";
  const checks = false;
  return (
    <div
      role="img"
      aria-label={alt}
      className={clsx("relative flex aspect-[9/16] items-center justify-center overflow-hidden bg-[#161616]", className)}
      style={{
        backgroundImage: stripes
          ? "repeating-linear-gradient(90deg,#1d1d1d 0 10px,#2a2a2a 10px 14px)"
          : checks
            ? "repeating-linear-gradient(90deg,#d4a85c22 0 14px,transparent 14px 28px),repeating-linear-gradient(0deg,#d4a85c22 0 14px,transparent 14px 28px)"
            : undefined,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-2/3 text-oro/80" aria-hidden="true">
        <path d="M50 14 v10 M50 24 L12 52 h76 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 58 h40 v30 h-40 z" fill="currentColor" opacity="0.35" />
      </svg>
      {showTag && (
        <span className="absolute bottom-2 left-2 rounded-tag bg-nero/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-bianco/70">
          Foto di esempio
        </span>
      )}
    </div>
  );
}
