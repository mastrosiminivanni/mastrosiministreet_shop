/**
 * Prepara la foto del furgone per il sito da reference/immagini/furgone-ritaglio.png:
 * copre i marchi del costruttore sul retro (il brief vieta loghi di terzi) e salva
 * public/brand/furgone.webp (scena 3D) e public/brand/furgone.png (immagine di riserva).
 *
 *   node scripts/prepare-van-photo.mjs
 */
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(REPO, "reference/immagini/furgone-ritaglio.png");
const OUT = join(REPO, "public/brand");

// Zone da coprire (px della foto 1448x1086): ellissi con centro e raggi.
const PATCHES = [
  { name: "stella", cx: 268, cy: 557, rx: 23, ry: 23 },
  { name: "scritta marca", cx: 180, cy: 668, rx: 46, ry: 12 },
  { name: "scritta modello", cx: 383, cy: 681, rx: 44, ry: 12 },
  // stelle sui mozzi: coprimozzo liscio color acciaio (nella scena 3D c'è già quello sopra le ruote che girano)
  { name: "mozzo posteriore", cx: 775, cy: 887.5, rx: 15, ry: 24, color: [180, 181, 185] },
  { name: "mozzo anteriore", cx: 1340, cy: 807, rx: 8.5, ry: 15, color: [181, 182, 186] },
];

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

/** Colore medio dell'anello attorno alla zona, ignorando i pixel chiari (scritte) e quelli oro. */
function surround(p) {
  let n = 0, r = 0, g = 0, b = 0;
  for (let y = Math.floor(p.cy - p.ry * 1.8); y < p.cy + p.ry * 1.8; y++)
    for (let x = Math.floor(p.cx - p.rx * 1.4); x < p.cx + p.rx * 1.4; x++) {
      const d = ((x - p.cx) / p.rx) ** 2 + ((y - p.cy) / p.ry) ** 2;
      if (d < 1.2 || d > 3) continue;
      const i = (y * info.width + x) * 4;
      const [R, G, B] = [data[i], data[i + 1], data[i + 2]];
      if ((R + G + B) / 3 > 70 || R - B > 25) continue;
      n++; r += R; g += G; b += B;
    }
  return [r / n, g / n, b / n].map(Math.round);
}

const shapes = PATCHES.map((p) => {
  const [r, g, b] = p.color ?? surround(p);
  return `<ellipse cx="${p.cx}" cy="${p.cy}" rx="${p.rx}" ry="${p.ry}" fill="rgb(${r},${g},${b})" filter="url(#sfuma)"/>`;
}).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${info.width}" height="${info.height}">
  <defs><filter id="sfuma" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>${shapes}</svg>`;

const clean = await sharp(SRC).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
await sharp(clean).resize(1200).webp({ quality: 82, alphaQuality: 90 }).toFile(join(OUT, "furgone.webp"));
await sharp(clean).resize(1200).png({ palette: true, quality: 85 }).toFile(join(OUT, "furgone.png"));
console.log("ok furgone.webp, furgone.png");
