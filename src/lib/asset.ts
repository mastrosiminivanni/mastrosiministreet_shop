/** Percorso di un file di /public: aggiunge il prefisso del sito quando vive in una sottocartella (GitHub Pages). */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
