/**
 * Immagine di anteprima per i social (1200x630): public/og.jpg
 *   node scripts/make-og.mjs
 * Usa il render del furgone (blender/render/furgone-render.png) e Chromium headless per scrivere con Poppins.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const van = "data:image/png;base64," + readFileSync(join(REPO, "blender/render/furgone-render.png")).toString("base64");
const logo = "data:image/png;base64," + readFileSync(join(REPO, "public/brand/logo-profilo.png")).toString("base64");

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;800&display=block" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:630px;background:#0c0c0c;font-family:Poppins,sans-serif;color:#fff;position:relative;overflow:hidden}
  .glow{position:absolute;right:-60px;top:40px;width:760px;height:560px;background:radial-gradient(closest-side,rgba(212,168,92,.35),transparent)}
  .bar{position:absolute;left:0;right:0;top:0;height:14px;background:#d4a85c}
  .road{position:absolute;left:0;right:0;bottom:70px;height:12px;background:repeating-linear-gradient(90deg,#d4a85c 0 46px,transparent 46px 90px);opacity:.9}
  img.van{position:absolute;right:-40px;bottom:30px;width:830px}
  .txt{position:absolute;left:64px;top:70px;width:640px}
  .tag{display:inline-block;background:#f0ebe1;color:#0c0c0c;font-weight:800;font-size:19px;letter-spacing:.2em;text-transform:uppercase;padding:8px 16px;border-radius:4px;box-shadow:0 0 0 3px #d4a85c}
  h1{margin-top:28px;font-weight:800;text-transform:uppercase;letter-spacing:-.03em;line-height:.95;font-size:80px;white-space:nowrap}
  h1 span{display:block;color:#d4a85c}
  p{margin-top:26px;font-weight:600;font-size:26px;color:#fff;white-space:nowrap}
  .ig{position:absolute;left:64px;bottom:34px;display:flex;align-items:center;gap:14px;font-weight:600;font-size:24px;color:#d4a85c}
  .ig img{width:46px;height:46px;border-radius:50%}
</style></head><body>
<div class="glow"></div><div class="bar"></div><div class="road"></div>
<img class="van" src="${van}">
<div class="txt"><span class="tag">Un mercato diverso ogni giorno</span>
<h1>Mastrosimini<span>Street Shop</span></h1>
<p>Camicie 25€ · Felpe 30€ · Pantaloni 20€</p></div>
<div class="ig"><img src="${logo}">@mastrosiministreet_shop</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: join(REPO, "public/og.jpg"), type: "jpeg", quality: 86 });
await browser.close();
console.log("ok public/og.jpg");
