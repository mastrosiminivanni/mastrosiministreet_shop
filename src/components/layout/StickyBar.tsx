"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { INSTAGRAM_DM_URL } from "@/data/markets";
import { statusLabel, useTodayStop } from "@/components/sections/TodayBanner";

/** Barra fissa in basso, solo su telefono: dove siamo oggi e contatto Instagram sempre a portata di pollice. */
export function StickyBar() {
  const stop = useTodayStop();
  // Nel pannello riservato la barra non serve e coprirebbe il modulo.
  if (usePathname().startsWith("/admin")) return null;
  const label = stop
    ? stop.town
      ? `${stop.town}${stop.status ? ` · ${statusLabel(stop.status, stop.hours?.start).toLowerCase()}` : ""}`
      : "Domenica: tappa speciale"
    : "Dove siamo oggi";
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-oro/40 bg-nero/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-5xl gap-2 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Link
          href="/dove-siamo"
          className="flex-[3] truncate rounded-tag bg-oro px-2 py-3 text-center text-xs font-extrabold uppercase text-nero"
        >
          📍 {label}
        </Link>
        <a
          href={INSTAGRAM_DM_URL}
          rel="noopener"
          className="flex-[2] rounded-tag border-2 border-oro px-2 py-3 text-center text-xs font-extrabold uppercase text-oro"
        >
          Scrivici su IG
        </a>
      </div>
    </div>
  );
}
