"use client";

import Link from "next/link";
import clsx from "clsx";
import { INSTAGRAM_URL, MARKETS, MARKET_HOURS, mapsUrl } from "@/data/markets";
import { SPECIAL_STOPS } from "@/data/special-stops";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { marketForDate, nextMarket } from "@/lib/market";
import { useToday } from "@/lib/useToday";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dateLabel = (d: Date) => new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" }).format(d);

/** Cosa fa il furgone oggi: mercato del giorno, tappa speciale della domenica o domenica "libera". */
export function useTodayStop() {
  const today = useToday();
  if (!today) return null;
  const special = SPECIAL_STOPS.find((s) => s.date === iso(today));
  const market = marketForDate(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const next = marketForDate(tomorrow) ?? nextMarket(tomorrow);
  return {
    today,
    special,
    market,
    next,
    town: special?.town ?? market?.town ?? null,
    spot: special?.spot ?? market?.spot ?? null,
    coords: special?.lat && special?.lng ? { lat: special.lat, lng: special.lng } : market,
  };
}

/** Punto che pulsa: "il furgone è qui oggi". */
function LiveDot() {
  return (
    <span className="relative flex h-3 w-3" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nero/60" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-nero" />
    </span>
  );
}

/** Grande blocco "Oggi siamo a…" sotto l'hero: la cosa che chi arriva da Instagram deve vedere subito. */
export function TodayBanner() {
  const stop = useTodayStop();
  const todayIdx = stop?.market ? MARKETS.indexOf(stop.market) : -1;
  const sundayFree = stop && !stop.town;

  return (
    <section className="bg-oro text-nero" aria-labelledby="oggi-titolo">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em]">
            <LiveDot /> Oggi al furgone
          </span>
          <PlateBadge>{stop ? dateLabel(stop.today) : "Oggi"}</PlateBadge>
        </div>

        <h2 id="oggi-titolo" className="titolo mt-5 text-[clamp(2.4rem,12.5vw,8.5rem)]" aria-live="polite">
          {stop ? (
            sundayFree ? (
              <>Domenica: tappa speciale</>
            ) : (
              <>
                <span className="block text-[0.32em] tracking-[0.04em]">Oggi siamo a</span>
                {stop.town}
              </>
            )
          ) : (
            <>
              <span className="block text-[0.32em] tracking-[0.04em]">Oggi siamo a</span>…
            </>
          )}
        </h2>

        {stop && (
          <p className="mt-4 max-w-xl text-lg font-semibold sm:text-xl">
            {sundayFree
              ? "La tappa di oggi la annunciamo su Instagram. Guarda le storie."
              : `${stop.spot}. Ti aspettiamo al furgone.`}
          </p>
        )}
        {stop && !sundayFree && stop.market && !stop.special && (
          <p className="mt-2 inline-block rounded-tag bg-nero px-3 py-1 text-sm font-extrabold uppercase tracking-wider text-oro">
            Dalle {MARKET_HOURS.start.replace(/^0/, "").replace(":00", "")} alle {MARKET_HOURS.end.replace(":00", "")}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {stop && !sundayFree && stop.coords && (
            <a
              href={mapsUrl(stop.coords)}
              rel="noopener"
              className="rounded-tag bg-nero px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:brightness-125"
            >
              Portami al furgone
            </a>
          )}
          {sundayFree && (
            <a href={INSTAGRAM_URL} rel="noopener" className="rounded-tag bg-nero px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:brightness-125">
              Guarda la storia su Instagram
            </a>
          )}
          <Link
            href="/dove-siamo"
            className="rounded-tag border-2 border-nero px-6 py-4 text-center text-sm font-extrabold uppercase tracking-wide hover:bg-nero hover:text-oro"
          >
            Tutta la settimana
          </Link>
        </div>

        {/* La settimana in sei pillole: oggi è acceso */}
        <ol className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Il giro della settimana">
          {MARKETS.map((m, i) => (
            <li key={m.slug}>
              <Link
                href={`/dove-siamo`}
                aria-current={i === todayIdx ? "date" : undefined}
                className={clsx(
                  "block rounded-tag border-2 px-2 py-2 text-center",
                  i === todayIdx ? "border-nero bg-nero text-oro" : "border-nero/40 hover:border-nero",
                )}
              >
                <span className="block text-[10px] font-extrabold uppercase tracking-widest opacity-80">{m.dayName.slice(0, 3)}</span>
                <span className="block text-xs font-bold leading-tight sm:text-sm">{m.town}</span>
              </Link>
            </li>
          ))}
        </ol>
        {stop && !sundayFree && stop.next && (
          <p className="mt-4 text-sm font-semibold">Domani: {stop.next.town}.</p>
        )}
        {stop && sundayFree && stop.next && <p className="mt-4 text-sm font-semibold">Domani: {stop.next.town}.</p>}
      </div>
    </section>
  );
}

/** Pillola dentro l'hero: il mercato di oggi visibile già prima di scrollare. */
export function TodayPill() {
  const stop = useTodayStop();
  const label = stop ? (stop.town ? `Oggi: ${stop.town}` : "Domenica: tappa speciale") : "Dove siamo oggi";
  return (
    <Link
      href="/dove-siamo"
      className="mt-4 inline-flex items-center gap-2 rounded-full bg-oro px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-nero shadow-[0_0_0_3px_rgba(212,168,92,0.25)]"
    >
      <LiveDot />
      <span aria-live="polite">{label}</span>
    </Link>
  );
}
