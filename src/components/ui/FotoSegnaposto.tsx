import Image from "next/image";
import clsx from "clsx";

/** Foto della pagina Chi siamo: se `src` manca mostra un riquadro che dice quale foto metterci. */
export function Foto({
  src,
  alt,
  segnaposto,
  className,
  ratio = "aspect-[4/5]",
  suOro = false,
}: {
  src?: string;
  alt: string;
  segnaposto: string;
  className?: string;
  ratio?: string;
  /** true quando il riquadro sta su sfondo oro: testo scuro, per il contrasto */
  suOro?: boolean;
}) {
  if (src) {
    return (
      <div className={clsx("relative overflow-hidden rounded-tag border border-white/10", ratio, className)}>
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={clsx(
        "flex flex-col items-center justify-center gap-2 rounded-tag border-2 border-dashed p-6 text-center",
        suOro ? "border-nero/50 bg-nero/10 text-nero" : "border-oro/50 bg-[#141414]",
        ratio,
        className,
      )}
    >
      <span className={clsx("text-xs font-extrabold uppercase tracking-widest", suOro ? "text-nero" : "text-oro")}>Foto in arrivo</span>
      <span className={clsx("text-sm", suOro ? "text-nero/80" : "text-bianco/70")}>{segnaposto}</span>
    </div>
  );
}
