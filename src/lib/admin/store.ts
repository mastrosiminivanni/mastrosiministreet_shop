import { BUCKET_FOTO, getSupabase, supabaseConfigurato } from "@/lib/supabase";
import { aDataUrl } from "./image";
import type { AdminProduct, FotoPronta, NuovoCapo, Stato } from "./types";

/** Cosa sa fare il pannello: salvare, elencare, cambiare stato, cancellare. Due versioni: Supabase vera e "prova" nel browser. */
export interface AdminStore {
  modo: "supabase" | "prova";
  lista(): Promise<AdminProduct[]>;
  crea(
    capo: NuovoCapo,
    foto: FotoPronta[],
    avanzamento?: (fatte: number, totale: number) => void,
  ): Promise<AdminProduct>;
  cambiaStato(id: string, stato: Stato): Promise<void>;
  elimina(capo: AdminProduct): Promise<void>;
  /** indirizzo di una foto (grande o miniatura) */
  urlFoto(percorso: string, piccola?: boolean): string;
}

const NOMI_CATEGORIA: Record<string, string> = {
  camicia: "Camicia",
  felpa: "Felpa",
  pantaloni: "Pantaloni",
  altro: "Capo",
};

/** Titolo provvisorio finché il sistema non scrive quello vero. */
export function titoloProvvisorio(c: NuovoCapo) {
  const nome = (c.category && NOMI_CATEGORIA[c.category]) || "Capo nuovo";
  return c.sizes.length ? `${nome} taglia ${c.sizes.join("/")}` : nome;
}

const codice = () => Math.random().toString(36).slice(2, 7);
const conSuffissoPiccolo = (p: string) => p.replace(/(\.\w+)$/, "-s$1");

// ---------- modalità prova: tutto resta nel browser, niente viene pubblicato ----------
const CHIAVE_PROVA = "ms-admin-prova";
function leggiProva(): AdminProduct[] {
  try {
    return JSON.parse(localStorage.getItem(CHIAVE_PROVA) ?? "[]");
  } catch {
    return [];
  }
}
function scriviProva(l: AdminProduct[]) {
  try {
    localStorage.setItem(CHIAVE_PROVA, JSON.stringify(l));
  } catch {
    throw new Error("Spazio del browser pieno: elimina qualche capo di prova.");
  }
}

const storeProva: AdminStore = {
  modo: "prova",
  async lista() {
    return leggiProva();
  },
  async crea(capo, foto, avanzamento) {
    const images: string[] = [];
    for (let i = 0; i < foto.length; i++) {
      images.push(await aDataUrl(foto[i].thumb)); // in prova bastano le miniature
      avanzamento?.(i + 1, foto.length);
    }
    const id = crypto.randomUUID();
    const nuovo: AdminProduct = {
      id,
      slug: `capo-${codice()}`,
      title: titoloProvvisorio(capo),
      description: null,
      category: capo.category,
      price: capo.price,
      sizes: capo.sizes,
      images,
      stock: capo.stock,
      status: "draft",
      created_at: new Date().toISOString(),
    };
    scriviProva([nuovo, ...leggiProva()]);
    return nuovo;
  },
  async cambiaStato(id, stato) {
    scriviProva(leggiProva().map((p) => (p.id === id ? { ...p, status: stato } : p)));
  },
  async elimina(capo) {
    scriviProva(leggiProva().filter((p) => p.id !== capo.id));
  },
  urlFoto: (percorso) => percorso,
};

// ---------- Supabase vera ----------
function storeSupabase(): AdminStore {
  const sb = getSupabase()!;
  return {
    modo: "supabase",
    async lista() {
      const { data, error } = await sb
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminProduct[];
    },
    async crea(capo, foto, avanzamento) {
      const id = crypto.randomUUID();
      const percorsi: string[] = [];
      for (let i = 0; i < foto.length; i++) {
        const base = `${id}/${i + 1}.${foto[i].ext}`;
        const tipo = foto[i].ext === "webp" ? "image/webp" : "image/jpeg";
        for (const [path, blob] of [
          [base, foto[i].full],
          [conSuffissoPiccolo(base), foto[i].thumb],
        ] as const) {
          const { error } = await sb.storage
            .from(BUCKET_FOTO)
            .upload(path, blob, { contentType: tipo, cacheControl: "31536000" });
          if (error) throw new Error(`Caricamento foto: ${error.message}`);
        }
        percorsi.push(base);
        avanzamento?.(i + 1, foto.length);
      }
      const riga = {
        id,
        slug: `capo-${codice()}`,
        title: titoloProvvisorio(capo),
        category: capo.category,
        price: capo.price,
        sizes: capo.sizes,
        images: percorsi,
        stock: capo.stock,
        initial_stock: capo.stock,
        status: "draft" as const,
      };
      const { data, error } = await sb.from("products").insert(riga).select().single();
      if (error) throw new Error(error.message);
      return data as AdminProduct;
    },
    async cambiaStato(id, stato) {
      const { error } = await sb.from("products").update({ status: stato }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    async elimina(capo) {
      const file = capo.images.flatMap((p) => [p, conSuffissoPiccolo(p)]);
      if (file.length) await sb.storage.from(BUCKET_FOTO).remove(file);
      const { error } = await sb.from("products").delete().eq("id", capo.id);
      if (error) throw new Error(error.message);
    },
    urlFoto: (percorso, piccola) =>
      sb.storage.from(BUCKET_FOTO).getPublicUrl(piccola ? conSuffissoPiccolo(percorso) : percorso)
        .data.publicUrl,
  };
}

/** Lo store giusto: Supabase se è collegato, altrimenti la modalità prova. */
export function creaStore(forzaProva = false): AdminStore {
  return supabaseConfigurato && !forzaProva ? storeSupabase() : storeProva;
}
