import type { NextConfig } from "next";

// Su GitHub Pages il sito vive sotto /<nome-repo>/ e dev'essere un sito statico (vedi scripts/deploy-pages.sh).
// In locale e su Vercel non cambia nulla.
const isPages = process.env.GITHUB_PAGES === "1";
const basePath = isPages ? "/mastrosiministreet_shop" : "";

const nextConfig: NextConfig = {
  ...(isPages ? { output: "export" as const, trailingSlash: true, basePath } : {}),
  images: isPages
    ? { unoptimized: true }
    : { remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }] },
  // disponibile anche nel browser: serve per i file letti da codice (texture 3D, modello, decodificatore)
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
