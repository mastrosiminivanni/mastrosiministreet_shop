import type { NextConfig } from "next";

// Su GitHub Pages il sito dev'essere statico. Con il dominio proprio (mastrosiminishop.it) vive alla radice: nessun percorso davanti.
// BASE_PATH serve solo per tornare temporaneamente all'indirizzo github.io (es. BASE_PATH=/mastrosiministreet_shop).
const isPages = process.env.GITHUB_PAGES === "1";
const basePath = isPages ? (process.env.BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  ...(isPages ? { output: "export" as const, trailingSlash: true, basePath } : {}),
  images: isPages
    ? { unoptimized: true }
    : { remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }] },
  // disponibile anche nel browser: serve per i file letti da codice (texture 3D, modello, decodificatore)
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
