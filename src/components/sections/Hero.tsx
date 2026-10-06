import Link from "next/link";
import { Hero3D } from "@/components/3d/Hero3D";
import { TodayPill } from "./TodayBanner";

/**
 * Su telefono i blocchi stanno in colonna (testo, furgone, pulsanti) e il furgone ha la sua zona: niente sovrapposizioni.
 * Da tablet in su il furgone è dietro al testo, a destra.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-nero">
      <div className="mx-auto flex max-w-5xl flex-col px-4 pb-6 pt-6 md:min-h-[88svh] md:justify-between md:pb-8 md:pt-8">
        <div>
          <div>
            <TodayPill />
          </div>
          <h1 className="titolo mt-3 text-[clamp(2.4rem,11vw,4.5rem)] lg:text-6xl">
            Mastrosimini
            <span className="block text-oro">Street Shop</span>
          </h1>
          <p className="mt-3 max-w-sm text-base font-medium text-bianco/90 md:mt-4">
            Le ultime mode, street e oversize, a prezzi da mercato. Quando è andato, è andato.
          </p>
        </div>

        {/* zona del furgone: sotto al testo su telefono, sullo sfondo da tablet in su */}
        <div className="relative -mx-4 mt-2 h-[min(36svh,300px)] md:absolute md:inset-0 md:z-[-10] md:m-0 md:h-auto">
          <Hero3D />
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row md:mt-0">
          <Link
            href="/shop"
            className="rounded-tag bg-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-tinta hover:brightness-110"
          >
            Guarda cosa c&apos;è nel furgone
          </Link>
          <Link
            href="/dove-siamo"
            className="rounded-tag border-2 border-oro px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:bg-oro hover:text-tinta"
          >
            Dove siamo oggi
          </Link>
        </div>
      </div>
    </section>
  );
}
