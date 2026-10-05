import Link from "next/link";
import { Hero3D } from "@/components/3d/Hero3D";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { TodayPill } from "./TodayBanner";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-nero">
      <div className="absolute inset-0 -z-10">
        <Hero3D />
      </div>
      <div className="mx-auto flex min-h-[88svh] max-w-5xl flex-col justify-between px-4 pb-8 pt-8">
        <div>
          <PlateBadge>Un mercato diverso ogni giorno</PlateBadge>
          <div><TodayPill /></div>
          <h1 className="titolo mt-4 text-[clamp(2.6rem,11vw,4.5rem)] lg:text-6xl">
            Mastrosimini
            <span className="block text-oro">Street Shop</span>
          </h1>
          <p className="mt-4 max-w-sm text-base font-medium text-bianco/90">
            Vintage, street, oversize. Pezzi unici a prezzi chiari. Quando è andato, è andato.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="rounded-tag bg-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-nero hover:brightness-110"
          >
            Guarda cosa c&apos;è nel furgone
          </Link>
          <Link
            href="/dove-siamo"
            className="rounded-tag border-2 border-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:bg-oro hover:text-nero"
          >
            Dove siamo oggi
          </Link>
        </div>
      </div>
    </section>
  );
}
