export type Stato = "draft" | "published" | "sold";

export type AdminProduct = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number;
  sizes: string[];
  /** percorsi delle foto (la foto piccola ha il suffisso "-s" prima dell'estensione) */
  images: string[];
  stock: number;
  status: Stato;
  created_at: string;
};

export type NuovoCapo = {
  price: number;
  sizes: string[];
  stock: number;
  category: string | null;
};

/** Una foto già ridimensionata, pronta da caricare: versione grande e miniatura. */
export type FotoPronta = {
  full: Blob;
  thumb: Blob;
  ext: "webp" | "jpg";
  /** indirizzo locale per l'anteprima */
  preview: string;
};

/** Una foto nel modulo di modifica: già caricata (percorso) oppure nuova da caricare. */
export type VoceFoto = { tipo: "esistente"; percorso: string } | { tipo: "nuova"; foto: FotoPronta };

export type ModificaCapo = {
  title: string;
  description: string | null;
  category: string | null;
  price: number;
  sizes: string[];
  stock: number;
  /** foto nell'ordine finale; la prima è la copertina */
  foto: VoceFoto[];
};
