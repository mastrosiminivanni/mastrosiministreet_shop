"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import clsx from "clsx";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { WheelLoader } from "@/components/3d/WheelLoader";
import { MARKETS, SUNDAY_NOTE, mapsUrl } from "@/data/markets";
import { SPECIAL_STOPS } from "@/data/special-stops";
import { asset } from "@/lib/asset";
import { downloadCalendarImage } from "@/lib/calendarImage";
import { marketForDate } from "@/lib/market";
import { useToday } from "@/lib/useToday";
import { statusLabel, useTodayStop } from "@/components/sections/TodayBanner";

const MarketMap = dynamic(() => import("@/components/map/MarketMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] sm:h-[460px]">
      <WheelLoader label="Carico la mappa…" />
    </div>
  ),
});

const btn = "rounded-tag px-5 py-3 text-center text-sm font-extrabold uppercase tracking-wide";

/** Pagina "Dove siamo": mercato di oggi, calendario settimanale, mappa, salva/condividi. */
export function WhereWeAre() {
  const today = useToday();
  const stop = useTodayStop();
  const chiuso = stop?.status === "chiuso";
  const todayMarket = today ? marketForDate(today) : null;
  const [picked, setPicked] = useState("");
  const selected = picked || todayMarket?.slug || MARKETS[0].slug;
  const m = MARKETS.find((x) => x.slug === selected)!;

  const shareText = [
    "Il furgone di Mastrosimini Street Shop: un mercato diverso ogni giorno.",
    ...MARKETS.map((x) => `${x.dayName}: ${x.town}`),
    SUNDAY_NOTE,
  ].join("\n");

  const upcoming = today ? SPECIAL_STOPS.filter((s) => s.date >= toIso(today)) : [];

  return (
    <div>
      <div className="rounded-tag bg-oro p-5 text-tinta">
        <div className="flex flex-wrap items-center gap-2">
          <PlateBadge>Oggi</PlateBadge>
          {stop?.status && (
            <span className="rounded-tag bg-tinta px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-oro">
              {statusLabel(stop.status, stop.hours?.start)}
            </span>
          )}
        </div>
        <p className="titolo mt-3 text-3xl sm:text-5xl" aria-live="polite">
          {today ? (todayMarket ? `${chiuso ? "Eravamo" : "Siamo"} a ${todayMarket.town}` : "Domenica: tappa speciale") : "Dove siamo oggi"}
        </p>
        {todayMarket && <p className="mt-1 font-semibold">{todayMarket.spot}</p>}
        {today && !todayMarket && <p className="mt-1 font-semibold">La tappa è su Instagram. Ti aspettiamo al furgone.</p>}
        {todayMarket && !chiuso && (
          <a href={mapsUrl(todayMarket)} rel="noopener" className={clsx(btn, "mt-4 inline-block bg-tinta text-oro")}>
            Portami al furgone
          </a>
        )}
      </div>

      {upcoming.length > 0 && (
        <ul className="mt-4 space-y-2">
          {upcoming.map((s) => (
            <li key={s.date} className="rounded-tag border-2 border-oro p-3 text-sm font-semibold">
              Tappa speciale {s.date}: {s.town}
              {s.spot ? `, ${s.spot}` : ""}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ol className="space-y-2" aria-label="Calendario settimanale">
          {MARKETS.map((x) => {
            const active = x.slug === selected;
            const isToday = x.slug === todayMarket?.slug;
            return (
              <li key={x.slug}>
                <button
                  type="button"
                  onClick={() => setPicked(x.slug)}
                  aria-pressed={active}
                  className={clsx(
                    "w-full rounded-tag border-2 p-3 text-left",
                    active ? "border-oro bg-oro/10" : "border-white/15 hover:border-oro/60",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-oro">{x.dayName}</span>
                    {isToday && <span className="rounded-tag bg-oro px-2 py-0.5 text-[10px] font-extrabold uppercase text-tinta">Oggi</span>}
                  </span>
                  <span className="titolo mt-1 block text-2xl">{x.town}</span>
                  <span className="mt-0.5 block text-sm text-bianco/75">{x.spot}</span>
                  <span className="block text-xs text-bianco/55">{x.hours}</span>
                </button>
              </li>
            );
          })}
          <li className="px-1 pt-1 text-sm text-bianco/70">{SUNDAY_NOTE}</li>
        </ol>

        <div>
          <MarketMap selected={selected} onSelect={setPicked} />
          <p className="mt-2 text-sm text-bianco/75">
            <strong>{m.dayName}, {m.town}</strong>: {m.spot}.{" "}
            <a href={mapsUrl(m)} rel="noopener" className="font-bold text-oro underline underline-offset-4">Apri in Google Maps</a>
          </p>
          <p className="mt-1 text-xs text-bianco/60">Posizione indicativa: il punto esatto è quello delle storie su Instagram.</p>
        </div>
      </div>

      <section className="mt-10 rounded-tag border-2 border-oro p-5" aria-labelledby="salva">
        <h2 id="salva" className="titolo text-2xl">Tieni il furgone con te</h2>
        <p className="mt-1 text-sm text-bianco/75">Salva il calendario, così sai sempre dove siamo.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a href={asset("/calendario.ics")} download className={clsx(btn, "bg-oro text-tinta hover:brightness-110")}>
            Aggiungi al calendario
          </a>
          <button type="button" onClick={downloadCalendarImage} className={clsx(btn, "border-2 border-oro text-oro hover:bg-oro hover:text-tinta")}>
            Salva il calendario
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            rel="noopener"
            className={clsx(btn, "border-2 border-oro text-oro hover:bg-oro hover:text-tinta")}
          >
            Condividi su WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}

function toIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
