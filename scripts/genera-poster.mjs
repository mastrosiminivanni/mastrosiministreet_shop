// Genera le immagini di partenza del furgone (public/brand/poster-*.webp) fotografando la scena 3D vera su sfondo trasparente.
// Genera le versioni per il tema scuro e per il tema chiaro (suffisso -chiaro).
// Uso: avvia il sito (npm run dev -- -p 3400), poi: node scripts/genera-poster.mjs http://localhost:3400
import { chromium } from "playwright";
import sharp from "sharp";

const base = process.argv[2] ?? "http://localhost:3400";
const formati = [
  { nome: "poster-mobile", viewport: { width: 390, height: 844 }, scala: 2 },
  { nome: "poster-desktop", viewport: { width: 1280, height: 800 }, scala: 1.5 },
];
const temi = [
  { tema: "dark", suffisso: "" },
  { tema: "light", suffisso: "-chiaro" },
];

const browser = await chromium.launch();
for (const { tema, suffisso } of temi)
  for (const f of formati) {
    const ctx = await browser.newContext({
      viewport: f.viewport,
      deviceScaleFactor: f.scala,
      hasTouch: f.viewport.width < 768,
    });
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem("ms-consent", "denied");
        localStorage.setItem("ms-theme", t);
      } catch {}
      window.addEventListener("ms-van-ready", () => (window.__pronto = true));
    }, tema);
    const page = await ctx.newPage();
    await page.goto(`${base}/?poster`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.addStyleTag({
      content:
        "html,body,section{background:transparent!important} picture,header,footer,#main section:not(:first-child){display:none!important} body :is(h1,p,a,button,span,svg,time){visibility:hidden!important}",
    });
    await page.waitForFunction(() => window.__pronto === true, null, { timeout: 120000 });
    await page.waitForTimeout(9000); // il furgone entra e si ferma
    const png = await page.locator("canvas").first().screenshot({ omitBackground: true });
    await sharp(png)
      .webp({ quality: 80, alphaQuality: 85, effort: 6 })
      .toFile(`public/brand/${f.nome}${suffisso}.webp`);
    console.log(f.nome + suffisso, "ok");
    await ctx.close();
  }
await browser.close();
