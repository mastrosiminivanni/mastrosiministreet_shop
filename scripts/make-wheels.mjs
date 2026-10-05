/**
 * Prepara le ruote "che girano" a partire dalla foto vera del furgone (reference/immagini/furgone-ritaglio.png).
 * Per ogni cerchio: ritaglia l'ellisse, la raddrizza in un disco (così si può ruotare), copre il logo del
 * costruttore al centro con un coprimozzo liscio. Il sito poi rischiaccia il disco con la prospettiva della foto.
 *
 *   node scripts/make-wheels.mjs
 *
 * Le misure delle ellissi (pixel della foto 1448x1086) sono anche in src/data/van-photo.ts.
 */
import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(REPO, "reference/immagini/furgone-ritaglio.png");
const OUT = join(REPO, "public/brand");
const SIZE = 256;

// cx, cy, rx, ry = ellisse del cerchio; hx, hy = centro del mozzo (spostato per la prospettiva)
const WHEELS = {
  "ruota-posteriore": { cx: 776, cy: 898, rx: 54, ry: 86, hx: 775, hy: 887.5 },
  "ruota-anteriore": { cx: 1340.5, cy: 813, rx: 30, ry: 55, hx: 1340, hy: 807 },
};

/** Colore medio del metallo del cerchio (pixel chiari e grigi dentro l'ellisse). */
async function rimColor(w) {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let n = 0, r = 0, g = 0, b = 0;
  for (let y = Math.floor(w.cy - w.ry); y < w.cy + w.ry; y++)
    for (let x = Math.floor(w.cx - w.rx); x < w.cx + w.rx; x++) {
      if (((x - w.cx) / w.rx) ** 2 + ((y - w.cy) / w.ry) ** 2 > 1) continue;
      const i = (y * info.width + x) * 4;
      const [R, G, B] = [data[i], data[i + 1], data[i + 2]];
      if ((R + G + B) / 3 > 120 && Math.abs(R - G) < 18 && Math.abs(G - B) < 18) {
        n++; r += R; g += G; b += B;
      }
    }
  return [r / n, g / n, b / n].map(Math.round);
}

for (const [name, w] of Object.entries(WHEELS)) {
  const [r, g, b] = await rimColor(w);
  const left = Math.round(w.cx - w.rx), top = Math.round(w.cy - w.ry);
  const width = Math.round(2 * w.rx), height = Math.round(2 * w.ry);
  // Centro del disco liscio e simmetrico (copre logo e bulloni): girando non si nota.
  // Sopra il sito appoggia il coprimozzo fermo (mozzo.webp) nella posizione prospettica giusta.
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
    <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE * 0.23}" fill="rgb(${r},${g},${b})"/>
  </svg>`;
  // Gira solo la parte interna (fori): il bordo esterno resta quello fermo della foto.
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
    <defs><radialGradient id="m"><stop offset="0.8" stop-color="#fff"/><stop offset="0.86" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="url(#m)"/></svg>`;
  await sharp(SRC)
    .extract({ left, top, width, height })
    .resize(SIZE, SIZE, { fit: "fill", kernel: "lanczos3" })
    .composite([
      { input: Buffer.from(overlay) },
      { input: Buffer.from(mask), blend: "dest-in" },
    ])
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(join(OUT, `${name}.webp`));
  console.log("ok", name, { rim: [r, g, b] });
}

// Coprimozzo fermo (uguale per le due ruote), colore del cerchio della ruota posteriore.
{
  const [r, g, b] = await rimColor(WHEELS["ruota-posteriore"]);
  const dark = `rgb(${r - 50},${g - 50},${b - 50})`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <defs><radialGradient id="c" cx="0.4" cy="0.35" r="0.75">
      <stop offset="0" stop-color="rgb(${r + 30},${g + 30},${b + 30})"/><stop offset="1" stop-color="${dark}"/>
    </radialGradient></defs>
    <circle cx="64" cy="64" r="61" fill="url(#c)" stroke="${dark}" stroke-width="5"/>
    <circle cx="64" cy="64" r="16" fill="${dark}"/>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 90, alphaQuality: 100 }).toFile(join(OUT, "mozzo.webp"));
  console.log("ok mozzo");
}
