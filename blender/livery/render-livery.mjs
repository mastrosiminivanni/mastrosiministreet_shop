/**
 * Genera le texture della livrea del furgone con Chromium headless (Playwright):
 *   - *-colore.png  : nero opaco, pennellate oro, logo, scritta, vetro cabina
 *   - *-orm.png     : mappa materiale glTF (R = occlusione, G = ruvidità, B = metallo):
 *                     oro metallico e lucido, vetro liscio, nero opaco
 *
 *   node blender/livery/render-livery.mjs
 *
 * Coordinate in metri, uguali a blender/build_van.py (L = 5.92 m, tetto 2.70 m, fondo 0.38 m).
 * La texture viene proiettata in piano sulla fiancata: u = x / L, v = (z - fondo) / altezza.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const logo = "data:image/png;base64," + readFileSync(join(REPO, "public/brand/logo-profilo.png")).toString("base64");

const L = 5.92;
const TOP = 2.7;
const BOTTOM = 0.38;
const H = TOP - BOTTOM;
const PX_PER_M = 520;

// Finestrino cabina (x, z): la fiancata della cabina è dipinta con un vetro scuro e lucido.
const CAB_WINDOW = [[3.98, 1.5], [4.92, 1.5], [4.36, 2.2], [3.98, 2.2]];

const y = (z) => TOP - z; // SVG ha y verso il basso

/** Colori per modalità: "colore" (albedo) oppure "orm" (materiale glTF: R occlusione, G ruvidità, B metallo). */
const PALETTE = {
  colore: { bg: "#121212", gold: "url(#oro)", text: "#d9ad5f", seam: "#050505", ring: "#fff", glass: "url(#vetro)", frame: "#050505" },
  orm: { bg: "rgb(255,140,0)", gold: "rgb(255,70,255)", text: "rgb(255,70,255)", seam: "rgb(255,140,0)", ring: "rgb(255,140,0)", glass: "rgb(255,15,0)", frame: "rgb(255,140,0)" },
};

const DEFS = `
  <linearGradient id="oro" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#b07a1f"/><stop offset="0.3" stop-color="#ebb64e"/>
    <stop offset="0.55" stop-color="#d49e3a"/><stop offset="0.8" stop-color="#f2c766"/><stop offset="1" stop-color="#a87424"/>
  </linearGradient>
  <linearGradient id="vetro" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#1f2730"/><stop offset="0.5" stop-color="#0b0e12"/><stop offset="1" stop-color="#161b21"/>
  </linearGradient>
  <filter id="pennello" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="14 3" numOctaves="3" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="0.07" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="30 12" numOctaves="2" seed="2" result="setole"/>
    <feColorMatrix in="setole" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.55" result="maschera"/>
    <feComposite in="d" in2="maschera" operator="in"/>
  </filter>`;

const stroke = (p, d, w) =>
  `<path d="${d}" fill="none" stroke="${p.gold}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="miter"/>`;

/** Logo tondo (solo nella texture colore: nella mappa materiale resta nero opaco). */
const logoBlock = (mode, cx, cz, r) =>
  mode === "colore"
    ? `<clipPath id="tondo"><circle cx="${cx}" cy="${y(cz)}" r="${r * 0.985}"/></clipPath>
       <image href="${logo}" x="${cx - r}" y="${y(cz) - r}" width="${2 * r}" height="${2 * r}" clip-path="url(#tondo)"/>
       <circle cx="${cx}" cy="${y(cz)}" r="${r - 0.01}" fill="none" stroke="#fff" stroke-width="${r * 0.065}"/>`
    : "";

/** Fiancata. frontRight=true: muso a destra (lato passeggero, -Y); false: lato guida (+Y), specchiato. */
function side(mode, frontRight) {
  const p = PALETTE[mode];
  const W = L;
  const mx = (x) => (frontRight ? x : W - x);
  const flip = frontRight ? "" : `transform="translate(${W},0) scale(-1,1)"`;
  const win = CAB_WINDOW.map(([x, z]) => `${x},${y(z)}`).join(" ");
  const strokes = [
    stroke(p, "M -0.15 1.95 L 0.9 1.05 L 1.95 1.55", 0.26),
    stroke(p, "M 0.2 2.35 L 1.0 1.5 L 2.3 2.05", 0.17),
    stroke(p, "M 1.95 1.55 L 2.45 2.3", 0.2),
    stroke(p, "M 0.05 0.12 L 0.75 0.6", 0.17),
    stroke(p, "M 0.38 0.02 L 1.05 0.48", 0.11),
    stroke(p, "M 3.45 0.02 L 4.05 0.55", 0.2),
    stroke(p, "M 3.75 -0.02 L 4.25 0.4", 0.11),
    stroke(p, "M 3.85 2.15 L 4.08 1.32 L 4.32 1.95 L 4.56 1.32 L 4.8 1.95 L 5.04 1.34 L 5.3 1.9", 0.15),
    stroke(p, "M 4.85 2.35 L 6.0 1.6", 0.2),
  ].join("");
  const cx = mx(2.95);
  const ty = y(1.15);
  return {
    w: W,
    svg: `
  <defs>${DEFS}</defs>
  <rect x="-1" y="-1" width="${W + 2}" height="${H + 2}" fill="${p.bg}"/>
  <g ${flip}>
    <path d="M 3.98 ${y(0.45)} V ${y(2.25)} M 4.98 ${y(0.45)} V ${y(1.4)} M 2.75 ${y(0.45)} V ${y(2.3)}" stroke="${p.seam}" stroke-width="0.012"/>
    <g filter="url(#pennello)">${strokes}</g>
    <polygon points="${win}" fill="${p.glass}" stroke="${p.frame}" stroke-width="0.03" stroke-linejoin="round"/>
  </g>
  ${logoBlock(mode, cx, 1.85, 0.52)}
  <line x1="${cx - 1.18}" x2="${cx - 0.98}" y1="${ty - 0.035}" y2="${ty - 0.035}" stroke="${p.text}" stroke-width="0.016"/>
  <line x1="${cx + 0.98}" x2="${cx + 1.18}" y1="${ty - 0.035}" y2="${ty - 0.035}" stroke="${p.text}" stroke-width="0.016"/>
  <text x="${cx}" y="${ty}" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="0.085" letter-spacing="0.012" fill="${p.text}">UN MERCATO DIVERSO OGNI GIORNO</text>`,
  };
}

/** Retro: porte posteriori, logo sull'anta sinistra, scritta sotto. */
function rear(mode) {
  const p = PALETTE[mode];
  const W = 2.0;
  const strokes = [
    stroke(p, "M -0.15 1.45 L 0.55 2.05 L 1.3 1.5 L 2.15 2.25", 0.16),
    stroke(p, "M 1.15 1.2 L 2.15 1.8", 0.13),
    stroke(p, "M 1.45 -0.05 L 2.1 0.45", 0.12),
  ].join("");
  return {
    w: W,
    svg: `
  <defs>${DEFS}</defs>
  <rect x="-1" y="-1" width="${W + 2}" height="${H + 2}" fill="${p.bg}"/>
  <path d="M 1.0 0 V ${H}" stroke="${p.seam}" stroke-width="0.012"/>
  <g filter="url(#pennello)">${strokes}</g>
  ${logoBlock(mode, 0.55, 1.95, 0.38)}
  <text x="0.55" y="${y(1.4)}" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="0.042" letter-spacing="0.005" fill="${p.text}">UN MERCATO DIVERSO OGNI GIORNO</text>`,
  };
}

const jobs = [];
for (const mode of ["colore", "orm"]) {
  jobs.push([`lato-destro-${mode}.png`, side(mode, true)]);
  jobs.push([`lato-sinistro-${mode}.png`, side(mode, false)]);
  jobs.push([`retro-${mode}.png`, rear(mode)]);
}

const browser = await chromium.launch();
for (const [file, { w, svg }] of jobs) {
  const pxW = Math.round(w * PX_PER_M);
  const pxH = Math.round(H * PX_PER_M);
  const page = await browser.newPage({ viewport: { width: pxW, height: pxH } });
  await page.setContent(`<!doctype html><html><head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=block" rel="stylesheet">
    <style>html,body{margin:0;background:#000}svg{display:block}</style></head><body>
    <svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="0 0 ${w} ${H}">${svg}</svg>
    </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(HERE, file), type: "png" });
  await page.close();
  console.log("ok", file, pxW, "x", pxH);
}
await browser.close();
