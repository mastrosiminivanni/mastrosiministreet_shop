import Image from "next/image";
import { asset } from "@/lib/asset";
import clsx from "clsx";

/** Foto della pagina Chi siamo: se `src` manca mostra un riquadro che dice quale foto metterci. */
export function Foto({
  src,
  alt,
  segnaposto,
  className,
  ratio = "aspect-[4/5]",
}: {
  src?: string;
  alt: string;
  segnaposto: string;
  className?: string;
  ratio?: string;
}) {
  if (src) {
    return (
      <div className={clsx("relative overflow-hidden rounded-tag border border-white/10", ratio, className)}>
        <Image src={src.startsWith("/") ? asset(src) : src} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={clsx(
        "flex flex-col items-center justify-center gap-2 rounded-tag border-2 border-dashed p-6 text-center",
        "border-oro/50 bg-nero",
        ratio,
        className,
      )}
    >
      <span className="text-xs font-extrabold uppercase tracking-widest text-oro">Foto in arrivo</span>
      <span className="text-sm text-bianco/70">{segnaposto}</span>
    </div>
  );
}
