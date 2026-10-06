/**
 * Genera le texture della livrea del furgone con Chromium headless (Playwright):
 *   - *-colore.png : nero opaco, pennellate oro, logo, scritta
 *   - *-orm.png    : mappa materiale glTF (R = occlusione, G = ruvidità, B = metallo): oro metallico e lucido, nero opaco
 *
 *   node blender/livery/render-livery.mjs
 *
 * Usa blender/livery/geometry.json (creato da: Blender -b --python blender/build_van.py -- --measure),
 * quindi i disegni stanno sulle misure reali del modello. Coordinate in metri, come nel modello:
 * X = lunghezza (muso a +X), Z = altezza. Il lato destro è disegnato con il muso a destra;
 * il sinistro è lo specchio (visto da fuori il muso è a sinistra).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const logo = "data:image/png;base64," + readFileSync(join(REPO, "public/brand/logo-profilo.png")).toString("base64");
const geo = JSON.parse(readFileSync(join(HERE, "geometry.json"), "utf8"));

const { xmin, xmax, zmin, zmax, ymin, ymax } = geo.body;
const L = xmax - xmin;
const H = zmax - zmin;
const W = ymax - ymin;
const PX_PER_M = 400;
const TEXT = "UN MERCATO DIVERSO OGNI GIORNO";

/** Colori per modalità: "colore" (albedo) oppure "orm" (materiale glTF: R occlusione, G ruvidità, B metallo). */
const PALETTE = {
  colore: { bg: "#121212", gold: "url(#oro)", text: "#d9ad5f" },
  orm: { bg: "rgb(255,140,0)", gold: "rgb(255,70,255)", text: "rgb(255,70,255)" },
  // Tema chiaro: carrozzeria crema con le stesse pennellate oro (si usa con la stessa mappa ORM)
  "colore-chiaro": { bg: "#ddd7c7", gold: "url(#oro)", text: "#7a5410" },
};

const DEFS = `
  <linearGradient id="oro" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#b07a1f"/><stop offset="0.3" stop-color="#ebb64e"/>
    <stop offset="0.55" stop-color="#d49e3a"/><stop offset="0.8" stop-color="#f2c766"/><stop offset="1" stop-color="#a87424"/>
  </linearGradient>
  <filter id="pennello" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="14 3" numOctaves="3" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="0.07" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="30 12" numOctaves="2" seed="2" result="setole"/>
    <feColorMatrix in="setole" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.55" result="maschera"/>
    <feComposite in="d" in2="maschera" operator="in"/>
  </filter>`;

const zy = (z) => zmax - z; // SVG ha y verso il basso

/** Percorso in coordinate (x, z) del mondo -> coordinate SVG. */
const path = (pts) => pts.map(([x, z], i) => `${i ? "L" : "M"} ${x} ${zy(z)}`).join(" ");
const stroke = (p, pts, w) =>
  `<path d="${path(pts)}" fill="none" stroke="${p.gold}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="miter"/>`;

/** Logo tondo (solo nella texture colore: nella mappa materiale resta nero opaco). */
const logoBlock = (mode, id, cx, cz, r) =>
  mode.startsWith("colore")
    ? `<clipPath id="${id}"><circle cx="${cx}" cy="${zy(cz)}" r="${r * 0.985}"/></clipPath>
       <image href="${logo}" x="${cx - r}" y="${zy(cz) - r}" width="${2 * r}" height="${2 * r}" clip-path="url(#${id})"/>`
    : "";

const tagline = (p, cx, z, size, half) =>
  `<line x1="${cx - half - 0.22}" x2="${cx - half}" y1="${zy(z) - size * 0.4}" y2="${zy(z) - size * 0.4}" stroke="${p.text}" stroke-width="${size * 0.2}"/>
   <line x1="${cx + half}" x2="${cx + half + 0.22}" y1="${zy(z) - size * 0.4}" y2="${zy(z) - size * 0.4}" stroke="${p.text}" stroke-width="${size * 0.2}"/>
   <text x="${cx}" y="${zy(z)}" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="${size}" letter-spacing="${size * 0.14}" fill="${p.text}">${TEXT}</text>`;

/** Fiancata destra (muso a destra); la sinistra è lo specchio. */
function side(mode, mirrored) {
  const p = PALETTE[mode];
  const strokes = [
    // sopra il passaruota posteriore e verso il tetto
    stroke(p, [[-3.25, 2.05], [-2.25, 1.15], [-1.4, 1.62]], 0.26),
    stroke(p, [[-3.0, 2.55], [-2.1, 1.6], [-1.25, 2.0]], 0.17),
    stroke(p, [[-2.1, 2.95], [-1.45, 2.4]], 0.15),
    // in basso, dietro e tra i passaruota
    stroke(p, [[-3.3, 0.5], [-2.55, 1.05]], 0.17),
    stroke(p, [[-3.0, 0.3], [-2.4, 0.78]], 0.11),
    stroke(p, [[-1.05, 0.35], [-0.05, 1.05]], 0.2),
    stroke(p, [[-0.65, 0.3], [0.1, 0.85]], 0.11),
    // zigzag "corona" sotto il finestrino della cabina
    stroke(p, [[0.72, 1.3], [0.9, 0.62], [1.08, 1.18], [1.26, 0.62], [1.44, 1.18], [1.62, 0.64], [1.78, 1.12]], 0.14),
    // sul parafango anteriore
    stroke(p, [[2.6, 1.5], [3.35, 0.95]], 0.17),
  ].join("");
  const cx = -0.9;
  return `
  <defs>${DEFS}</defs>
  <rect x="${xmin - 1}" y="-1" width="${L + 2}" height="${H + 2}" fill="${p.bg}"/>
  <g ${mirrored ? `transform="translate(${xmin + xmax},0) scale(-1,1)"` : ""}>
    <g filter="url(#pennello)">${strokes}</g>
    ${logoBlock(mode, "tondoLato", cx, 1.78, 0.55)}
    ${tagline(p, cx, 1.02, 0.082, 0.95)}
  </g>`;
}

/** Retro (visto da dietro, il lato destro del furgone è a destra): logo sull'anta sinistra, scritta sotto. */
function rear(mode) {
  const p = PALETTE[mode];
  const strokes = [
    stroke(p, [[-0.15, 1.5], [0.55, 2.2], [1.3, 1.6], [2.2, 2.35]], 0.16),
    stroke(p, [[1.1, 1.25], [2.2, 1.9]], 0.13),
    stroke(p, [[1.4, 0.65], [2.2, 1.1]], 0.12),
  ].join("");
  return `
  <defs>${DEFS}</defs>
  <rect x="-1" y="-1" width="${W + 2}" height="${H + 2}" fill="${p.bg}"/>
  <g filter="url(#pennello)">${strokes}</g>
  ${logoBlock(mode, "tondoRetro", 0.58, 1.95, 0.42)}
  ${tagline(p, 0.58, 1.38, 0.05, 0.46)}`;
}

const jobs = [];
// "node render-livery.mjs chiaro" rifà solo le texture del tema chiaro
const soloChiaro = process.argv[2] === "chiaro";
for (const mode of soloChiaro ? ["colore-chiaro"] : ["colore", "orm", "colore-chiaro"]) {
  jobs.push([`lato-destro-${mode}.png`, { vb: [xmin, 0, L, H], svg: side(mode, false) }]);
  jobs.push([`lato-sinistro-${mode}.png`, { vb: [xmin, 0, L, H], svg: side(mode, true) }]);
  jobs.push([`retro-${mode}.png`, { vb: [0, 0, W, H], svg: rear(mode) }]);
}

const browser = await chromium.launch();
for (const [file, { vb, svg }] of jobs) {
  const pxW = Math.round(vb[2] * PX_PER_M);
  const pxH = Math.round(vb[3] * PX_PER_M);
  const page = await browser.newPage({ viewport: { width: pxW, height: pxH } });
  await page.setContent(`<!doctype html><html><head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=block" rel="stylesheet">
    <style>html,body{margin:0;background:#000}svg{display:block}</style></head><body>
    <svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="${vb.join(" ")}">${svg}</svg>
    </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(HERE, file), type: "png" });
  await page.close();
  console.log("ok", file, pxW, "x", pxH);
}
await browser.close();
