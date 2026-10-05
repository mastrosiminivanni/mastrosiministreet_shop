import clsx from "clsx";

type Props = {
  price: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-14 w-14 text-lg",
  md: "h-20 w-20 text-2xl",
  lg: "h-32 w-32 text-5xl",
};

/** Tondo oro con prezzo, stile reel "QUANTO COSTA?". Formato sempre 25€. */
export function PriceBadge({ price, label, size = "md", className }: Props) {
  return (
    <div
      className={clsx(
        "stampa flex flex-col items-center justify-center rounded-full bg-oro text-nero font-extrabold ring-2 ring-nero/80 ring-offset-2 ring-offset-oro/60",
        sizes[size],
        className,
      )}
      aria-label={`${label ? label + " " : ""}${price} euro`}
    >
      {label && (
        <span className="text-[0.32em] font-bold uppercase leading-none tracking-wide">{label}</span>
      )}
      <span className="leading-none tracking-tighter">{price}€</span>
    </div>
  );
}
