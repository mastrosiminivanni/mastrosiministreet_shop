"use client";

import { useRef, useState } from "react";
import { Camera } from "@phosphor-icons/react";
import clsx from "clsx";
import { preparaFoto } from "@/lib/admin/image";
import type { AdminStore } from "@/lib/admin/store";
import type { AdminProduct, VoceFoto } from "@/lib/admin/types";

const TAGLIE = ["XS", "S", "M", "L", "XL", "XXL", "Unica"];
const CATEGORIE = [
  ["", "Nessuna"],
  ["camicia", "Camicia"],
  ["felpa", "Felpa"],
  ["pantaloni", "Pantaloni"],
  ["altro", "Altro"],
] as const;

const chip = (attivo: boolean) =>
  clsx(
    "min-h-11 min-w-11 rounded-tag border-2 px-3 text-sm font-extrabold uppercase",
    attivo ? "border-oro bg-oro text-tinta" : "border-white/25 text-bianco hover:border-oro",
  );
const campo = "mt-2 min-h-12 w-full rounded-tag border border-white/25 bg-nero px-3 text-base";
const etichetta = "text-sm font-bold uppercase text-bianco/70";

/** Modulo per cambiare un capo già salvato: testi, prezzo, taglie, pezzi, categoria e foto. */
export function ModificaCapoForm({
  store,
  capo,
  onFatto,
  onAnnulla,
}: {
  store: AdminStore;
  capo: AdminProduct;
  onFatto: () => void;
  onAnnulla: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [titolo, setTitolo] = useState(capo.title);
  const [descrizione, setDescrizione] = useState(capo.description ?? "");
  const [prezzo, setPrezzo] = useState(String(capo.price));
  const [taglie, setTaglie] = useState<string[]>(capo.sizes);
  const [altra, setAltra] = useState("");
  const [pezzi, setPezzi] = useState(capo.stock);
  const [categoria, setCategoria] = useState(capo.category ?? "");
  const [foto, setFoto] = useState<VoceFoto[]>(
    capo.images.map((percorso) => ({ tipo: "esistente", percorso })),
  );
  const [inElaborazione, setInElaborazione] = useState(0);
  const [errore, setErrore] = useState("");
  const [salvataggio, setSalvataggio] = useState(false);

  const prezzoNum = Number(prezzo);
  const mancano = [
    !titolo.trim() && "il nome",
    foto.length === 0 && "almeno una foto",
    taglie.length === 0 && "la taglia",
    !(prezzoNum > 0) && "il prezzo",
  ].filter(Boolean) as string[];

  async function aggiungiFoto(files: FileList | null) {
    if (!files?.length) return;
    setErrore("");
    const lista = Array.from(files);
    setInElaborazione((n) => n + lista.length);
    for (const f of lista) {
      try {
        const pronta = await preparaFoto(f);
        setFoto((prev) => [...prev, { tipo: "nuova", foto: pronta }]);
      } catch {
        setErrore(`Non riesco a leggere "${f.name}". Prova con una foto JPG o PNG.`);
      } finally {
        setInElaborazione((n) => n - 1);
      }
    }
    if (input.current) input.current.value = "";
  }

  const alterna = (t: string) =>
    setTaglie((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const aggiungiAltra = () => {
    const v = altra.trim().toUpperCase();
    if (v && !taglie.includes(v)) setTaglie((prev) => [...prev, v]);
    setAltra("");
  };
  const togli = (i: number) => setFoto((prev) => prev.filter((_, k) => k !== i));
  const copertina = (i: number) => setFoto((prev) => [prev[i], ...prev.filter((_, k) => k !== i)]);
  const sposta = (i: number, d: -1 | 1) =>
    setFoto((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const n = [...prev];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const src = (v: VoceFoto) =>
    v.tipo === "esistente" ? store.urlFoto(v.percorso, true) : v.foto.preview;

  async function salva(e: React.FormEvent) {
    e.preventDefault();
    if (mancano.length || inElaborazione) return;
    setSalvataggio(true);
    setErrore("");
    try {
      await store.modifica(capo, {
        title: titolo.trim(),
        description: descrizione.trim() || null,
        category: categoria || null,
        price: Math.round(prezzoNum),
        sizes: taglie,
        stock: pezzi,
        foto,
      });
      foto.forEach((v) => v.tipo === "nuova" && URL.revokeObjectURL(v.foto.preview));
      onFatto();
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Qualcosa è andato storto. Riprova.");
      setSalvataggio(false);
    }
  }

  return (
    <form
      onSubmit={salva}
      aria-label={`Modifica ${capo.title}`}
      className="mt-3 space-y-5 rounded-tag border-2 border-oro p-3"
    >
      <div>
        <label htmlFor={`t-${capo.id}`} className={etichetta}>
          Nome
        </label>
        <input
          id={`t-${capo.id}`}
          value={titolo}
          onChange={(e) => setTitolo(e.target.value)}
          className={campo}
        />
      </div>
      <div>
        <label htmlFor={`d-${capo.id}`} className={etichetta}>
          Descrizione (facoltativa)
        </label>
        <textarea
          id={`d-${capo.id}`}
          value={descrizione}
          onChange={(e) => setDescrizione(e.target.value)}
          rows={3}
          className={clsx(campo, "py-2")}
        />
      </div>

      <div>
        <p className={etichetta}>Taglie</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Taglie">
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
        <div className="mt-2 flex gap-2">
          <label className="sr-only" htmlFor={`a-${capo.id}`}>
            Altra taglia
          </label>
          <input
            id={`a-${capo.id}`}
            value={altra}
            onChange={(e) => setAltra(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), aggiungiAltra())}
            placeholder="Altra taglia (es. 46)"
            className="min-h-11 flex-1 rounded-tag border border-white/25 bg-nero px-3 text-base"
          />
          <button
            type="button"
            onClick={aggiungiAltra}
            className="min-h-11 rounded-tag border-2 border-oro px-4 text-sm font-extrabold uppercase text-oro"
          >
            Aggiungi
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`p-${capo.id}`} className={etichetta}>
            Prezzo (€)
          </label>
          <input
            id={`p-${capo.id}`}
            inputMode="numeric"
            pattern="[0-9]*"
            value={prezzo}
            onChange={(e) => setPrezzo(e.target.value.replace(/\D/g, ""))}
            className={campo}
          />
        </div>
        <div>
          <p className={etichetta}>Quanti pezzi</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPezzi((n) => Math.max(0, n - 1))}
              aria-label="Meno pezzi"
              className="h-11 w-11 rounded-tag border-2 border-white/25 text-2xl font-bold"
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
              className="h-11 w-11 rounded-tag border-2 border-white/25 text-2xl font-bold"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label htmlFor={`c-${capo.id}`} className={etichetta}>
            Cos&apos;è
          </label>
          <select
            id={`c-${capo.id}`}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={campo}
          >
            {CATEGORIE.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className={etichetta}>Foto (la prima è la copertina)</p>
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {foto.map((v, i) => (
            <li key={v.tipo === "esistente" ? v.percorso : v.foto.preview} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src(v)}
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
                onClick={() => togli(i)}
                aria-label={`Togli la foto ${i + 1}`}
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-nero/85 text-lg font-bold"
              >
                ×
              </button>
              <div className="absolute inset-x-1 bottom-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => sposta(i, -1)}
                  disabled={i === 0}
                  aria-label={`Sposta la foto ${i + 1} prima`}
                  className="flex-1 rounded-tag bg-nero/85 py-1 text-xs font-extrabold text-oro disabled:opacity-30"
                >
                  ←
                </button>
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => copertina(i)}
                    aria-label={`Metti la foto ${i + 1} in copertina`}
                    className="flex-1 rounded-tag bg-nero/85 py-1 text-xs font-extrabold text-oro"
                  >
                    ★
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => sposta(i, 1)}
                  disabled={i === foto.length - 1}
                  aria-label={`Sposta la foto ${i + 1} dopo`}
                  className="flex-1 rounded-tag bg-nero/85 py-1 text-xs font-extrabold text-oro disabled:opacity-30"
                >
                  →
                </button>
              </div>
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
        <input
          ref={input}
          id={`f-${capo.id}`}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => aggiungiFoto(e.target.files)}
        />
        <label
          htmlFor={`f-${capo.id}`}
          className="mt-3 flex min-h-12 cursor-pointer items-center justify-center rounded-tag border-2 border-dashed border-oro px-4 text-center text-sm font-extrabold uppercase text-oro hover:bg-oro/10 focus-within:outline focus-within:outline-2 focus-within:outline-oro"
        >
          <Camera size={20} aria-hidden="true" className="mr-2 inline-block" />
          Aggiungi foto
        </label>
      </div>

      {errore && (
        <p role="alert" className="text-sm font-semibold text-red-400">
          {errore}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={salvataggio || mancano.length > 0 || inElaborazione > 0}
          className="min-h-12 flex-1 rounded-tag bg-oro px-4 text-sm font-extrabold uppercase tracking-wide text-tinta disabled:cursor-not-allowed disabled:opacity-40"
        >
          {salvataggio ? "Salvo…" : "Salva modifiche"}
        </button>
        <button
          type="button"
          onClick={onAnnulla}
          disabled={salvataggio}
          className="min-h-12 rounded-tag border-2 border-white/30 px-4 text-sm font-extrabold uppercase"
        >
          Annulla
        </button>
      </div>
      {mancano.length > 0 && (
        <p className="text-sm text-bianco/70">Manca: {mancano.join(", ")}.</p>
      )}
    </form>
  );
}
