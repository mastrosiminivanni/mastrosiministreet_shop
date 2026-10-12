"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CTA_INSTAGRAM, INSTAGRAM_DM_URL, MARKET_HOURS } from "@/data/markets";
import { SPECIAL_STOPS } from "@/data/special-stops";
import { PlateBadge } from "@/components/ui/PlateBadge";
import { useRomeNow } from "@/lib/useRomeNow";

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const oraBreve = (hhmm: string) => hhmm.replace(/^0/, "").replace(":00", "");
const MS_GIORNO = 86_400_000;
/** Attesa prima di aprirsi: la pagina e il furgone compaiono per primi. */
const ATTESA_MS = 1200;
const CHIAVE = "ms-annuncio";

/** Non si apre per i robot (Google, Lighthouse) né nei browser automatici: lì una finestra sopra la pagina non serve a nessuno. */
const èAutomatico = () =>
  typeof navigator !== "undefined" &&
  (navigator.webdriver === true || /bot|crawl|spider|slurp|lighthouse/i.test(navigator.userAgent));

const leggiChiusura = () => {
  try {
    return localStorage.getItem(CHIAVE);
  } catch {
    return null; // storage bloccato: come se non l'avessi mai chiuso
  }
};
const salvaChiusura = (v: string) => {
  try {
    localStorage.setItem(CHIAVE, v);
  } catch {
    /* ignora */
  }
};

/**
 * Finestra di annuncio della prossima tappa speciale (di solito la domenica).
 * Si legge da SPECIAL_STOPS: si apre da sola quando si entra nel sito, fino alla fine della tappa
 * (la domenica fino alle 13:00), poi sparisce da sola. Chi la chiude non la rivede fino al giorno dopo.
 * Non è nel codice HTML iniziale: si apre dopo il caricamento ed è sempre chiudibile (non blocca la pagina).
 */
export function AnnuncioTappa() {
  const now = useRomeNow();
  const [aperta, setAperta] = useState(false);
  const chiudi = useRef<HTMLButtonElement>(null);
  const finestra = useRef<HTMLDivElement>(null);

  const oggi = now ? iso(now) : "";
  const tappa = now
    ? SPECIAL_STOPS.filter((s) => s.date >= oggi)
        .sort((a, b) => a.date.localeCompare(b.date))
        .find((s) => {
          if (s.date > oggi) return true;
          // il giorno stesso resta fino all'ora di chiusura della tappa
          const fine = (s.end ?? MARKET_HOURS.end).split(":").map(Number);
          return now.getHours() * 60 + now.getMinutes() < fine[0] * 60 + (fine[1] ?? 0);
        })
    : undefined;
  const idTappa = tappa ? `${tappa.date}|${oggi}` : "";

  // si apre una volta al giorno per persona, poco dopo il caricamento
  useEffect(() => {
    if (!idTappa || leggiChiusura() === idTappa || èAutomatico()) return;
    const t = setTimeout(() => setAperta(true), ATTESA_MS);
    return () => clearTimeout(t);
  }, [idTappa]);

  const chiusa = useCallback(() => {
    setAperta(false);
    if (idTappa) salvaChiusura(idTappa);
  }, [idTappa]);

  useEffect(() => {
    if (!aperta) return;
    const prima = document.activeElement as HTMLElement | null;
    // finché l'annuncio è aperto il banner dei cookie aspetta (vedi globals.css), così non si sovrappongono
    document.documentElement.dataset.annuncio = "aperto";
    chiudi.current?.focus();
    const tasti = (e: KeyboardEvent) => {
      if (e.key === "Escape") return chiusa();
      if (e.key !== "Tab" || !finestra.current) return;
      const el = Array.from(
        finestra.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      );
      if (!el.length) return;
      const primo = el[0];
      const ultimo = el[el.length - 1];
      if (e.shiftKey && document.activeElement === primo) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primo.focus();
      }
    };
    document.addEventListener("keydown", tasti);
    return () => {
      document.removeEventListener("keydown", tasti);
      delete document.documentElement.dataset.annuncio;
      prima?.focus?.();
    };
  }, [aperta, chiusa]);

  if (!now || !tappa || !aperta) return null;

  const [y, m, d] = tappa.date.split("-").map(Number);
  const data = new Date(y, m - 1, d);
  const inizioOggi = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const giorni = Math.round((data.getTime() - inizioOggi.getTime()) / MS_GIORNO);
  const dataLeggibile = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" }).format(data);
  const orario = tappa.start && tappa.end ? `dalle ${oraBreve(tappa.start)} alle ${oraBreve(tappa.end)}` : null;
  const conto = giorni === 0 ? "Oggi" : giorni === 1 ? "Domani" : `Mancano ${giorni} giorni`;
  // "Domenica 18 ottobre:" e sotto "siamo a Putignano"; il giorno stesso una riga sola
  const titolo =
    giorni === 0 ? (
      `Oggi siamo a ${tappa.town}`
    ) : (
      <>
        <span className="block">{dataLeggibile}:</span> <span className="block">siamo a {tappa.town}</span>
      </>
    );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={chiusa}
        className="absolute inset-0 cursor-default bg-black/70"
      />
      <div
        ref={finestra}
        role="dialog"
        aria-modal="true"
        aria-labelledby="annuncio-tappa"
        className="relative w-full max-w-md rounded-tag border-2 border-oro bg-nero p-6 shadow-2xl"
      >
        <button
          ref={chiudi}
          type="button"
          onClick={chiusa}
          aria-label="Chiudi annuncio"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-2xl leading-none hover:border-oro"
        >
          ×
        </button>
        <div className="flex flex-wrap items-center gap-2 pr-12">
          <PlateBadge>Tappa speciale</PlateBadge>
          <span className="rounded-tag bg-oro px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-tinta">
            {conto}
          </span>
        </div>
        <h2 id="annuncio-tappa" className="titolo mt-4 text-3xl first-letter:uppercase sm:text-4xl">
          {titolo}
        </h2>
        <p className="mt-3 font-semibold">
          {tappa.spot}
          {orario ? `, ${orario}` : ""}
        </p>
        <p className="mt-1 text-bianco/80">Passa a trovarci!</p>
        <div className="mt-5 flex flex-col gap-3">
          <Link
            href="/dove-siamo/"
            onClick={chiusa}
            className="rounded-tag bg-oro px-5 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-tinta hover:brightness-110"
          >
            Tutte le tappe
          </Link>
          <a
            href={INSTAGRAM_DM_URL}
            rel="noopener"
            className="rounded-tag border-2 border-oro px-5 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-oro hover:bg-oro hover:text-tinta"
          >
            {CTA_INSTAGRAM}
          </a>
        </div>
      </div>
    </div>
  );
}
