"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { asset } from "@/lib/asset";
import { creaStore } from "@/lib/admin/store";
import type { AdminProduct } from "@/lib/admin/types";
import { getSupabase, supabaseConfigurato } from "@/lib/supabase";
import { ElencoCapi } from "./ElencoCapi";
import { NuovoCapoForm } from "./NuovoCapoForm";

type Accesso = "carico" | "fuori" | "non-abilitato" | "dentro";

const btn = "min-h-12 rounded-tag px-5 text-sm font-extrabold uppercase tracking-wide";

/** Pagina riservata: entra solo chi è abilitato; senza Supabase collegato lavora in "modalità prova". */
export function AdminApp() {
  const sb = getSupabase();
  const store = useMemo(() => creaStore(), []);
  const [accesso, setAccesso] = useState<Accesso>(supabaseConfigurato ? "carico" : "dentro");
  const [email, setEmail] = useState("");
  const [mail, setMail] = useState("");
  const [msg, setMsg] = useState("");
  const [capi, setCapi] = useState<AdminProduct[]>([]);
  const [errore, setErrore] = useState("");

  // Sessione Supabase: chi sono, e se sono abilitato
  useEffect(() => {
    if (!sb) return;
    let vivo = true;
    async function verifica(sessioneEmail: string | undefined) {
      if (!vivo) return;
      if (!sessioneEmail) return setAccesso("fuori");
      setMail(sessioneEmail);
      const { data } = await sb!.from("admins").select("email").limit(1);
      if (vivo) setAccesso(data && data.length > 0 ? "dentro" : "non-abilitato");
    }
    sb.auth.getSession().then(({ data }) => verifica(data.session?.user.email));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => void verifica(s?.user.email));
    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, [sb]);

  const carica = useCallback(async () => {
    try {
      setCapi(await store.lista());
      setErrore("");
    } catch (e) {
      setErrore(e instanceof Error ? e.message : "Non riesco a leggere i capi.");
    }
  }, [store]);

  // Primo caricamento dell'elenco quando si entra
  useEffect(() => {
    if (accesso !== "dentro") return;
    let vivo = true;
    store
      .lista()
      .then((l) => vivo && setCapi(l))
      .catch(
        (e) => vivo && setErrore(e instanceof Error ? e.message : "Non riesco a leggere i capi."),
      );
    return () => {
      vivo = false;
    };
  }, [accesso, store]);

  async function inviaLink(e: React.FormEvent) {
    e.preventDefault();
    if (!sb || !email.trim()) return;
    setMsg("Invio il link…");
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}${asset("/admin/")}`,
        shouldCreateUser: false,
      },
    });
    setMsg(
      error
        ? `Non riesco a inviare il link: ${error.message}`
        : "Ti ho mandato un link per email: aprilo da questo telefono.",
    );
  }

  if (accesso === "carico") return <p className="mt-8">Controllo l&apos;accesso…</p>;

  if (accesso === "fuori")
    return (
      <form onSubmit={inviaLink} className="mt-8 max-w-md space-y-4">
        <p className="text-bianco/80">
          Inserisci la tua email: ti mando un link per entrare, senza password.
        </p>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="la-tua-email@esempio.it"
          className="min-h-12 w-full rounded-tag border border-white/25 bg-nero px-3 text-base"
        />
        <button type="submit" className={`${btn} w-full bg-oro text-nero`}>
          Mandami il link
        </button>
        <p role="status" aria-live="polite" className="text-sm text-bianco/80">
          {msg}
        </p>
      </form>
    );

  if (accesso === "non-abilitato")
    return (
      <div className="mt-8 max-w-md space-y-4">
        <p className="rounded-tag border border-red-400/60 p-4">
          L&apos;account <strong>{mail}</strong> non è abilitato a entrare. Chiedi di aggiungerlo
          all&apos;elenco.
        </p>
        <button
          type="button"
          className={`${btn} border-2 border-oro text-oro`}
          onClick={() => sb?.auth.signOut()}
        >
          Esci
        </button>
      </div>
    );

  return (
    <div className="mt-6">
      {store.modo === "prova" ? (
        <div className="rounded-tag border-2 border-oro bg-oro/10 p-4 text-sm">
          <p className="font-extrabold uppercase text-oro">Modalità prova</p>
          <p className="mt-1">
            Supabase non è ancora collegato: quello che salvi resta solo in questo browser e{" "}
            <strong>non va sul sito</strong>. Serve per provare come funziona la pagina.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 text-sm text-bianco/70">
          <span>
            Connesso come <strong className="text-bianco">{mail}</strong>
          </span>
          <button type="button" className="underline" onClick={() => sb?.auth.signOut()}>
            Esci
          </button>
        </div>
      )}

      <h2 className="titolo mt-8 text-3xl">Nuovo capo</h2>
      <div className="mt-4">
        <NuovoCapoForm store={store} onSalvato={carica} />
      </div>

      <h2 className="titolo mt-14 text-3xl">I tuoi capi</h2>
      <p className="mt-1 mb-4 text-sm text-bianco/70">
        &quot;Pubblica&quot; segna il capo come in vendita. Il collegamento che li mostra sul sito
        pubblico è il prossimo passo.
      </p>
      {errore && (
        <p role="alert" className="mb-3 text-sm font-semibold text-red-400">
          {errore}
        </p>
      )}
      <ElencoCapi store={store} capi={capi} onCambio={carica} />
    </div>
  );
}
