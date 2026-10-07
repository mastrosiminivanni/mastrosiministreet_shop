import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { SITE_URL } from "@/data/site";

export const dynamic = "force-static";

// Su GitHub Pages gli indirizzi finiscono con "/", altrove no.
const fine = process.env.GITHUB_PAGES === "1" ? "/" : "";
const url = (p: string) => `${SITE_URL}${p}${fine}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const pagine = ["", "/shop", "/dove-siamo", "/chi-siamo", "/contatti", "/legal/privacy", "/legal/cookie", "/legal/note-legali"];
  return [
    ...pagine.map((p) => ({ url: url(p), changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...products.map((x) => ({
      url: url(`/shop/${x.slug}`),
      lastModified: x.updatedAt ?? x.createdAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
