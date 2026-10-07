"use client";

import { useRef, useState } from "react";
import { Camera } from "@phosphor-icons/react";
import clsx from "clsx";
import { preparaFoto } from "@/lib/admin/image";
import type { AdminStore } from "@/lib/admin/store";
import type { FotoPronta } from "@/lib/admin/types";

const TAGLIE = ["XS", "S", "M", "L", "XL", "XXL", "Unica"];
const PREZZI_VELOCI = [20, 25, 30];
const CATEGORIE = [
  ["", "Decide il sistema"],
  ["camicia", "Camicia"],
  ["felpa", "Felpa"],
  ["pantaloni", "Pantaloni"],
  ["altro", "Altro"],
] as const;

const chip = (attivo: boolean) =>
  clsx(
    "min-h-12 min-w-12 rounded-tag border-2 px-4 text-sm font-extrabold uppercase",
    attivo ? "border-oro bg-oro text-tinta" : "border-white/25 text-bianco hover:border-oro",
  );

/** Modulo "nuovo capo": foto, taglia, prezzo. Il resto lo scrive il sistema. */
export function NuovoCapoForm({ store, onSalvato }: { store: AdminStore; onSalvato: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [foto, setFoto] = useState<FotoPronta[]>([]);
  const [inElaborazione, setInElaborazione] = useState(0);
  const [taglie, setTaglie] = useState<string[]>([]);
  const [altra, setAltra] = useState("");
  const [nome, setNome] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [pezzi, setPezzi] = useState(1);
  const [categoria, setCategoria] = useState("");
  const [stato, setStato] = useState<{ tipo: "info" | "errore" | "ok"; testo: string } | null>(
    null,
  );
  const [salvataggio, setSalvataggio] = useState(false);

  async function aggiungiFoto(files: FileList | null) {
    if (!files?.length) return;
    setStato(null);
    const lista = Array.from(files);
    setInElaborazione((n) => n + lista.length);
    for (const f of lista) {
      try {
        const pronta = await preparaFoto(f);
        setFoto((prev) => [...prev, pronta]);
      } catch {
        setStato({
          tipo: "errore",
          testo: `Non riesco a leggere "${f.name}". Prova con una foto JPG o PNG.`,
        });
      } finally {
        setInElaborazione((n) => n - 1);
      }
    }
    if (input.current) input.current.value = "";
  }

  const togliFoto = (i: number) => setFoto((prev) => prev.filter((_, k) => k !== i));
  const copertina = (i: number) => setFoto((prev) => [prev[i], ...prev.filter((_, k) => k !== i)]);
  const alterna = (t: string) =>
    setTaglie((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const aggiungiAltra = () => {
    const v = altra.trim().toUpperCase();
    if (v && !taglie.includes(v)) setTaglie((prev) => [...prev, v]);
    setAltra("");
  };

  const prezzoNum = Number(prezzo);
  const mancano = [
    foto.length === 0 && "almeno una foto",
    !nome.trim() && "il nome",
    taglie.length === 0 && "la taglia",
    !(prezzoNum > 0) && "il prezzo",
  ].filter(Boolean) as string[];

  async function salva(e: React.FormEvent) {
    e.preventDefault();
    if (mancano.length || inElaborazione) return;
    setSalvataggio(true);
    setStato({ tipo: "info", testo: "Salvo…" });
    try {
      await store.crea(
        { title: nome.trim(), price: Math.round(prezzoNum), sizes: taglie, stock: pezzi, category: categoria || null },
        foto,
        (fatte, totale) =>
          setStato({ tipo: "info", testo: `Carico le foto: ${fatte} di ${totale}…` }),
      );
      foto.forEach((f) => URL.revokeObjectURL(f.preview));
      setFoto([]);
      setTaglie([]);
      setNome("");
      setPrezzo("");
      setPezzi(1);
      setCategoria("");
      setStato({ tipo: "ok", testo: "Capo salvato in bozza. Lo trovi qui sotto." });
      onSalvato();
    } catch (err) {
      setStato({
        tipo: "errore",
        testo: err instanceof Error ? err.message : "Qualcosa è andato storto. Riprova.",
      });
    } finally {
      setSalvataggio(false);
    }
  }

  return (
    <form onSubmit={salva} className="space-y-8" aria-label="Nuovo capo">
      {/* FOTO */}
      <section aria-labelledby="t-foto">
        <h2 id="t-foto" className="text-lg font-extrabold uppercase">
          1. Foto
        </h2>
        <p className="mt-1 text-sm text-bianco/70">
          Scattale in verticale. La prima è la copertina.
        </p>
        <input
          ref={input}
          id="foto"
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => aggiungiFoto(e.target.files)}
        />
        <label
          htmlFor="foto"
          className="mt-3 flex min-h-16 cursor-pointer items-center justify-center rounded-tag border-2 border-dashed border-oro px-4 text-center text-base font-extrabold uppercase text-oro hover:bg-oro/10 focus-within:outline focus-within:outline-2 focus-within:outline-oro"
        >
          <Camera size={22} aria-hidden="true" className="mr-2 inline-block" />
          Aggiungi foto
        </label>
        {(foto.length > 0 || inElaborazione > 0) && (
          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {foto.map((f, i) => (
              <li key={f.preview} className="relative">
                {/* anteprima 9:16: come la vedrà chi guarda il sito */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.preview}
                  alt={`Foto ${i + 1}`}
                  className="aspect-[9/16] w-full rounded-tag object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded-tag bg-oro px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-tinta">
                    Copertina
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => togliFoto(i)}
                  aria-label={`Togli la foto ${i + 1}`}
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-nero/85 text-lg font-bold"
                >
                  ×
                </button>
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => copertina(i)}
                    className="absolute inset-x-1 bottom-1 rounded-tag bg-nero/85 py-1 text-[10px] font-extrabold uppercase text-oro"
                  >
                    Metti in copertina
                  </button>
                )}
              </li>
            ))}
            {Array.from({ length: inElaborazione }).map((_, k) => (
              <li
                key={`el-${k}`}
                className="flex aspect-[9/16] animate-pulse items-center justify-center rounded-tag bg-white/10 text-xs text-bianco/60"
              >
                Preparo…
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* NOME */}
      <section aria-labelledby="t-nome">
        <h2 id="t-nome" className="text-lg font-extrabold uppercase">
          2. Nome
        </h2>
        <p className="mt-1 text-sm text-bianco/70">
          Cos&apos;è e di che colore, in poche parole (es. &quot;Felpa zip bordeaux&quot;). Da qui il sistema crea titolo,
          indirizzo e descrizione per Google.
        </p>
        <label className="sr-only" htmlFor="nome">
          Nome del capo
        </label>
        <input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={80}
          placeholder="Es. Jeans blu sfumato"
          className="mt-3 min-h-12 w-full rounded-tag border border-white/25 bg-nero px-3 text-base"
        />
      </section>

      {/* TAGLIA */}
      <section aria-labelledby="t-taglia">
        <h2 id="t-taglia" className="text-lg font-extrabold uppercase">
          3. Taglia
        </h2>
        <p className="mt-1 text-sm text-bianco/70">Tocca tutte quelle disponibili.</p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Taglie">
          {[...TAGLIE, ...taglie.filter((t) => !TAGLIE.includes(t))].map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={taglie.includes(t)}
              onClick={() => alterna(t)}
              className={chip(taglie.includes(t))}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <label className="sr-only" htmlFor="altra-taglia">
            Altra taglia
          </label>
          <input
            id="altra-taglia"
            value={altra}
            onChange={(e) => setAltra(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), aggiungiAltra())}
            placeholder="Altra taglia (es. 46)"
            className="min-h-12 flex-1 rounded-tag border border-white/25 bg-nero px-3 text-base"
          />
          <button
            type="button"
            onClick={aggiungiAltra}
            className="min-h-12 rounded-tag border-2 border-oro px-4 text-sm font-extrabold uppercase text-oro"
          >
            Aggiungi
          </button>
        </div>
      </section>

      {/* PREZZO */}
      <section aria-labelledby="t-prezzo">
        <h2 id="t-prezzo" className="text-lg font-extrabold uppercase">
          4. Prezzo
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {PREZZI_VELOCI.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={prezzoNum === p}
              onClick={() => setPrezzo(String(p))}
              className={chip(prezzoNum === p)}
            >
              {p}€
            </button>
          ))}
          <label className="sr-only" htmlFor="prezzo">
            Prezzo in euro
          </label>
          <input
            id="prezzo"
            inputMode="numeric"
            pattern="[0-9]*"
            value={prezzo}
            onChange={(e) => setPrezzo(e.target.value.replace(/\D/g, ""))}
            placeholder="Altro prezzo"
            className="min-h-12 w-36 rounded-tag border border-white/25 bg-nero px-3 text-base"
          />
          <span aria-hidden="true" className="text-xl font-extrabold">
            €
          </span>
        </div>
      </section>

      {/* EXTRA */}
      <section aria-labelledby="t-extra" className="grid gap-4 sm:grid-cols-2">
        <h2 id="t-extra" className="sr-only">
          Facoltativi
        </h2>
        <div>
          <p className="text-sm font-bold uppercase text-bianco/70">Quanti pezzi</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPezzi((n) => Math.max(1, n - 1))}
              aria-label="Meno pezzi"
              className="h-12 w-12 rounded-tag border-2 border-white/25 text-2xl font-bold"
            >
              −
            </button>
            <span className="min-w-8 text-center text-xl font-extrabold" aria-live="polite">
              {pezzi}
            </span>
            <button
              type="button"
              onClick={() => setPezzi((n) => n + 1)}
              aria-label="Più pezzi"
              className="h-12 w-12 rounded-tag border-2 border-white/25 text-2xl font-bold"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="categoria" className="text-sm font-bold uppercase text-bianco/70">
            Cos&apos;è (facoltativo)
          </label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-2 min-h-12 w-full rounded-tag border border-white/25 bg-nero px-3 text-base"
          >
            {CATEGORIE.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div>
        <button
          type="submit"
          disabled={salvataggio || mancano.length > 0 || inElaborazione > 0}
          className="min-h-14 w-full rounded-tag bg-oro px-6 text-base font-extrabold uppercase tracking-wide text-tinta disabled:cursor-not-allowed disabled:opacity-40"
        >
          {salvataggio ? "Salvo…" : "Salva come bozza"}
        </button>
        {mancano.length > 0 && (
          <p className="mt-2 text-sm text-bianco/70">Manca: {mancano.join(", ")}.</p>
        )}
        <p
          role="status"
          aria-live="polite"
          className={clsx(
            "mt-3 text-sm font-semibold",
            stato?.tipo === "errore"
              ? "text-red-400"
              : stato?.tipo === "ok"
                ? "text-oro"
                : "text-bianco/80",
          )}
        >
          {stato?.testo}
        </p>
      </div>
    </form>
  );
}
