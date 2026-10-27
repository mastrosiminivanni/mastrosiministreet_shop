// Agente Vinted -> shop. Legge l'armadio Vinted con un browser vero (Edge), e per ogni annuncio nuovo:
//   - se è lo stesso articolo di un capo già nello shop (altra taglia) aggiunge la taglia,
//   - altrimenti crea e PUBBLICA il capo con le foto,
//   - se non è sicuro, lo crea come BOZZA e lo scrive nel rapporto.
// Gli annunci spariti da Vinted vengono segnati venduti.
//
//   node agente-vinted/sync.mjs            esegue davvero
//   node agente-vinted/sync.mjs --prova    legge e mostra cosa farebbe, senza scrivere niente
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const QUI = path.dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(path.join(QUI, ".env"));
} catch {
  // nessun .env: va bene in modalità --prova
}

const PROVA = process.argv.includes("--prova");
const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://jultjlqudfzbrahrzpvv.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const MODELLO = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";
const PROFILO = process.env.VINTED_PROFILE ?? "https://www.vinted.it/member/261904496-mastrosiminishop";
const ID_UTENTE = PROFILO.match(/member\/(\d+)/)?.[1];
const BUCKET = "capi";
const MAX_FOTO = 8;

const rapporto = [];
const dì = (riga) => {
  console.log(riga);
  rapporto.push(riga);
};

if (!PROVA && !SERVICE_KEY) {
  console.error("Manca SUPABASE_SERVICE_ROLE_KEY in agente-vinted/.env (oppure lancia con --prova).");
  process.exit(1);
}
const sb = SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } }) : null;

// ---------- utilità di testo ----------
const normalizza = (t) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\btaglia\s+\w+\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const parole = (t) => new Set(normalizza(t).split(" ").filter((p) => p.length > 2));
const somiglianza = (a, b) => {
  const A = parole(a);
  const B = parole(b);
  const comuni = [...A].filter((x) => B.has(x)).length;
  return comuni / Math.max(1, A.size + B.size - comuni);
};
const slugDa = (t) =>
  normalizza(t).replace(/ /g, "-").slice(0, 60).replace(/-+$/g, "") || "capo";
const codice = () => Math.random().toString(36).slice(2, 7);

const COLORI = [
  "nero", "nera", "bianco", "bianca", "grigio", "grigia", "antracite", "blu", "azzurro", "azzurra", "celeste", "navy", "verde", "rosso", "rossa",
  "bordeaux", "marrone", "beige", "panna", "tortora", "giallo", "arancione", "rosa", "viola", "senape", "kaki", "crema", "oro", "argento",
];
/** I colori nominati nel titolo, uniformando maschile e femminile (nero/nera). */
function coloriDi(titolo) {
  const t = new Set(normalizza(titolo).split(" "));
  return new Set(COLORI.filter((c) => t.has(c)).map((c) => c.replace(/a$/, "o").replace(/rosso$/, "rosso")));
}

function categoria(titolo) {
  const t = normalizza(titolo);
  if (/\bcardigan\b/.test(t)) return "cardigan";
  if (/\bcamici/.test(t)) return "camicia";
  if (/\bjeans?\b/.test(t)) return "jeans";
  if (/\b(pantalon|bermuda|jogger|cargo|chino)/.test(t)) return "pantaloni";
  if (/\b(felpa|hoodie|maglione|pullover|giubbotto|giacca)/.test(t)) return "felpa";
  if (/\b(maglia|maglietta|t shirt|tshirt|polo)\b/.test(t)) return "maglia";
  return "altro";
}

// ---------- 1. lettura dell'armadio ----------
async function apriBrowser() {
  for (const channel of ["msedge", "chrome"]) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch {
      // prova il prossimo
    }
  }
  throw new Error("Non trovo né Edge né Chrome sul PC.");
}

function leggiAnnuncio(i) {
  return {
    id: i.id,
    titolo: String(i.title ?? "").trim(),
    prezzo: Number(i.price?.amount ?? 0),
    // Vinted scrive "M / IT 42 / EU 38": nello shop basta la prima parte
    taglia: i.size ? String(i.size).split("/")[0].trim() || null : null,
    marca: i.brand ?? null,
    url: `https://www.vinted.it/items/${i.id}`,
    aperto: !(i.is_closed || i.is_hidden || i.is_draft),
    foto: (i.photos ?? []).map((f) => f.full_size_url || f.url).filter(Boolean),
  };
}

async function leggiArmadio() {
  const browser = await apriBrowser();
  try {
    const pagina = await (await browser.newContext({ locale: "it-IT" })).newPage();
    // il sito carica la prima pagina subito e le altre man mano che si scorre: le raccolgo tutte
    const pagine = new Map();
    let totale = 1;
    pagina.on("response", async (r) => {
      const n = r.url().match(/wardrobe\/\d+\/items\?(?:.*&)?page=(\d+)/)?.[1];
      if (!n || !r.ok()) return;
      try {
        const dati = await r.json();
        pagine.set(Number(n), dati.items ?? []);
        totale = dati.pagination?.total_pages ?? totale;
      } catch {
        // risposta non leggibile: si riprova scorrendo
      }
    });
    await pagina.goto(PROFILO, { waitUntil: "domcontentloaded", timeout: 60000 });
    await pagina.waitForTimeout(5000); // il sito deve finire di caricarsi prima che lo scorrimento serva a qualcosa
    for (let giro = 0; giro < 30 && !(pagine.has(1) && pagine.size >= totale); giro++) {
      await pagina.mouse.wheel(0, -3000);
      await pagina.waitForTimeout(500);
      await pagina.mouse.wheel(0, 6000);
      await pagina.waitForTimeout(1500);
    }
    if (!pagine.has(1) || pagine.size < totale)
      throw new Error(`Letta solo ${pagine.size} pagine dell'armadio su ${totale}: non tocco lo shop.`);
    const items = [...pagine.keys()].sort((x, y) => x - y).flatMap((n) => pagine.get(n));
    return items.map(leggiAnnuncio);
  } finally {
    await browser.close();
  }
}

// ---------- 2. stato attuale dello shop ----------
async function leggiShop() {
  if (!sb) return { prodotti: [], legami: [] };
  const [p, l] = await Promise.all([
    sb.from("products").select("id,slug,title,price,sizes,stock,initial_stock,images,status,vinted_url"),
    sb.from("vinted_items").select("*"),
  ]);
  if (p.error) throw new Error(`Lettura capi: ${p.error.message}`);
  if (l.error) throw new Error(`Lettura annunci (hai eseguito supabase/vinted-sync.sql?): ${l.error.message}`);
  return { prodotti: p.data, legami: l.data };
}

// ---------- 3. riconoscimento: stesso articolo? ----------
async function scarica(url) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`Foto non scaricabile (${r.status}): ${url.slice(0, 80)}`);
  return Buffer.from(await r.arrayBuffer());
}
const piccolaBase64 = async (buf) =>
  (await sharp(buf).rotate().resize({ width: 640, height: 640, fit: "inside" }).jpeg({ quality: 70 }).toBuffer()).toString("base64");
const piccola = (p) => p.replace(/(\.\w+)$/, "-s$1");
const urlFoto = (p) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${p}`;

/** Chiede a Claude se l'annuncio è lo stesso articolo di uno dei candidati. Ritorna { id | "nuovo" | "incerto", motivo }. */
async function chiediAClaude(annuncio, candidati) {
  const contenuto = [];
  contenuto.push({ type: "text", text: `NUOVO ANNUNCIO — titolo: "${annuncio.titolo}", taglia ${annuncio.taglia ?? "?"}, prezzo ${annuncio.prezzo}€. Foto:` });
  const buf = await scarica(annuncio.foto[0]);
  contenuto.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: await piccolaBase64(buf) } });
  for (const c of candidati) {
    contenuto.push({ type: "text", text: `CANDIDATO id=${c.id} — titolo: "${c.title}", taglie ${c.sizes.join("/") || "?"}, prezzo ${c.price}€. Foto:` });
    if (c.images[0]) {
      const b = await scarica(urlFoto(piccola(c.images[0])));
      contenuto.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: await piccolaBase64(b) } });
    }
  }
  contenuto.push({
    type: "text",
    text:
      "Vendo abiti usati da uomo, spesso lo stesso identico capo in più annunci con taglie diverse. " +
      "Il nuovo annuncio è lo STESSO ARTICOLO (stesso modello, stesso colore e fantasia) di uno dei candidati? " +
      "Una taglia diversa NON rende l'articolo diverso; un colore, una fantasia o un modello diversi sì. " +
      'Rispondi SOLO con JSON: {"risposta":"<id del candidato>"|"nuovo"|"incerto","motivo":"una frase"}. ' +
      'Usa "incerto" se non puoi decidere con sicurezza.',
  });
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODELLO, max_tokens: 300, messages: [{ role: "user", content: contenuto }] }),
  });
  if (!r.ok) throw new Error(`Claude non risponde (${r.status}): ${(await r.text()).slice(0, 200)}`);
  const testo = (await r.json()).content?.find((c) => c.type === "text")?.text ?? "";
  const json = testo.match(/\{[\s\S]*\}/)?.[0];
  if (!json) return { risposta: "incerto", motivo: "risposta non leggibile" };
  const out = JSON.parse(json);
  const valido = out.risposta === "nuovo" || out.risposta === "incerto" || candidati.some((c) => c.id === out.risposta);
  return valido ? out : { risposta: "incerto", motivo: "risposta fuori elenco" };
}

/** Decide cosa fare di un annuncio: { tipo: "aggiungi", prodotto } | { tipo: "nuovo" } | { tipo: "bozza", motivo }. */
async function decidi(annuncio, prodotti) {
  const stesso = prodotti.find((p) => p.vinted_url === annuncio.url);
  if (stesso) return { tipo: "aggiungi", prodotto: stesso, perché: "stesso link" };

  const nome = normalizza(annuncio.titolo);
  const identico = prodotti.find((p) => normalizza(p.title) === nome && Math.abs(p.price - annuncio.prezzo) < 0.5);
  if (identico) return { tipo: "aggiungi", prodotto: identico, perché: "titolo e prezzo identici" };

  // Colori diversi nel titolo = articolo diverso, senza bisogno di guardare le foto.
  const miei = coloriDi(annuncio.titolo);
  const stessiColori = (p) => {
    const suoi = coloriDi(p.title);
    return miei.size === suoi.size && [...miei].every((c) => suoi.has(c));
  };
  const simili = prodotti
    .map((p) => ({ p, s: somiglianza(p.title, annuncio.titolo) }))
    .filter((x) => x.s >= 0.4)
    .filter((x) => !(miei.size && coloriDi(x.p.title).size && !stessiColori(x.p)))
    .sort((a, b) => b.s - a.s);
  const candidati = simili.slice(0, 3).map((x) => x.p);
  if (!candidati.length) return { tipo: "nuovo" };
  if (!ANTHROPIC_KEY) {
    // senza confronto delle foto: solo se titolo molto simile E stessi colori è la stessa cosa, altrimenti bozza
    if (simili[0].s >= 0.7 && miei.size && stessiColori(simili[0].p))
      return { tipo: "aggiungi", prodotto: simili[0].p, perché: "titolo quasi identico e stessi colori" };
    return { tipo: "bozza", motivo: `simile a "${candidati[0].title}", ma senza confronto foto non sono sicuro` };
  }

  try {
    const { risposta, motivo } = await chiediAClaude(annuncio, candidati);
    if (risposta === "nuovo") return { tipo: "nuovo" };
    if (risposta === "incerto") return { tipo: "bozza", motivo: motivo || "incerto" };
    return { tipo: "aggiungi", prodotto: candidati.find((c) => c.id === risposta), perché: motivo };
  } catch (e) {
    return { tipo: "bozza", motivo: `confronto non riuscito: ${e.message}` };
  }
}

// ---------- 4. scrittura ----------
async function caricaFoto(id, urls) {
  const percorsi = [];
  for (const [i, url] of urls.slice(0, MAX_FOTO).entries()) {
    try {
      const buf = await scarica(url);
      const grande = await sharp(buf).rotate().resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      const mini = await sharp(buf).rotate().resize({ width: 560, height: 560, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
      const base = `${id}/${i + 1}.webp`;
      for (const [p, b] of [[base, grande], [piccola(base), mini]]) {
        // Blob da una copia: passare il Buffer di sharp direttamente fa lamentare Node ("SharedArrayBuffer is not allowed")
        const { error } = await sb.storage.from(BUCKET).upload(p, new Blob([new Uint8Array(b)], { type: "image/webp" }), { contentType: "image/webp", cacheControl: "31536000", upsert: true });
        if (error) throw new Error(error.message);
      }
      percorsi.push(base);
    } catch (e) {
      dì(`   ! foto ${i + 1} saltata: ${e.message}`);
    }
  }
  return percorsi;
}

const legame = (a, productId) => ({ item_id: a.id, product_id: productId, size: a.taglia, url: a.url, price: a.prezzo, open: true });

async function creaCapo(a, stato) {
  const id = randomUUID();
  const riga = {
    id,
    slug: `${slugDa(a.titolo)}-${codice()}`,
    title: a.titolo,
    category: categoria(a.titolo),
    price: Math.round(a.prezzo),
    sizes: a.taglia ? [a.taglia] : [],
    images: [],
    stock: 1,
    initial_stock: 1,
    status: stato,
    vinted_url: a.url,
  };
  if (PROVA) return { ...riga, _prova: true };
  riga.images = await caricaFoto(id, a.foto);
  if (!riga.images.length) throw new Error("nessuna foto scaricabile");
  const { error } = await sb.from("products").insert(riga);
  if (error) throw new Error(error.message);
  const l = await sb.from("vinted_items").insert(legame(a, id));
  if (l.error) throw new Error(l.error.message);
  return riga;
}

/** Ricalcola taglie e pezzi di un capo da tutti i suoi annunci (aperti = ancora su Vinted). */
async function aggiornaCapo(prodotto, legami) {
  const suoi = legami.filter((l) => l.product_id === prodotto.id);
  const aperti = suoi.filter((l) => l.open);
  const taglie = [...new Set(aperti.map((l) => l.size).filter(Boolean))];
  const cambi = {
    stock: aperti.length,
    initial_stock: Math.max(suoi.length, prodotto.initial_stock ?? 0),
    ...(aperti.length ? { sizes: taglie } : {}),
    ...(prodotto.status !== "draft" ? { status: aperti.length ? "published" : "sold" } : {}),
  };
  Object.assign(prodotto, cambi);
  if (PROVA) return;
  const { error } = await sb.from("products").update(cambi).eq("id", prodotto.id);
  if (error) throw new Error(error.message);
}

// ---------- programma ----------
async function main() {
  dì(`Agente Vinted — ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}${PROVA ? " (PROVA: non scrivo niente)" : ""}`);
  const annunci = await leggiArmadio();
  const aperti = annunci.filter((a) => a.aperto);
  dì(`Armadio: ${annunci.length} annunci letti, ${aperti.length} in vendita.`);
  if (!aperti.length) throw new Error("Zero annunci in vendita: sembra una lettura sbagliata, mi fermo senza toccare lo shop.");

  const shop = await leggiShop();
  const { legami } = shop;
  // l'agente gestisce solo i capi nati da Vinted: quelli caricati a mano dal pannello non sono mai doppioni
  const prodotti = shop.prodotti.filter((p) => p.vinted_url || legami.some((l) => l.product_id === p.id));
  const noti = new Map(legami.map((l) => [l.item_id, l]));
  const apertiIds = new Set(aperti.map((a) => a.id));

  // salvaguardia: se spariscono più della metà degli annunci che conosco, la lettura è sospetta
  const apertiNoti = legami.filter((l) => l.open);
  const spariti = apertiNoti.filter((l) => !apertiIds.has(l.item_id));
  if (apertiNoti.length >= 6 && spariti.length > apertiNoti.length / 2)
    throw new Error(`Sono spariti ${spariti.length} annunci su ${apertiNoti.length}: non li segno venduti, controlla a mano.`);

  const toccati = new Set();
  let creati = 0, aggiunti = 0, bozze = 0, venduti = 0;

  // annunci nuovi, dal più vecchio al più recente
  for (const a of aperti.filter((x) => !noti.has(x.id)).sort((x, y) => x.id - y.id)) {
    if (!a.foto.length) {
      dì(`- ${a.titolo}: senza foto, salto.`);
      continue;
    }
    try {
      const scelta = await decidi(a, prodotti);
      if (scelta.tipo === "aggiungi") {
        const p = scelta.prodotto;
        dì(`+ taglia ${a.taglia ?? "?"} aggiunta a "${p.title}" (${scelta.perché})`);
        const l = legame(a, p.id);
        if (!PROVA) {
          const { error } = await sb.from("vinted_items").insert(l);
          if (error) throw new Error(error.message);
        }
        legami.push(l);
        noti.set(a.id, l);
        toccati.add(p.id);
        aggiunti++;
      } else {
        const stato = scelta.tipo === "bozza" ? "draft" : "published";
        const nuovo = await creaCapo(a, stato);
        const l = legame(a, nuovo.id);
        legami.push(l);
        noti.set(a.id, l);
        prodotti.push(nuovo);
        if (stato === "draft") {
          bozze++;
          dì(`? BOZZA da controllare: "${a.titolo}" — ${scelta.motivo}`);
        } else {
          creati++;
          dì(`* nuovo capo pubblicato: "${a.titolo}" (${a.taglia ?? "?"}, ${a.prezzo}€)`);
        }
      }
    } catch (e) {
      dì(`! ERRORE su "${a.titolo}" (${a.url}): ${e.message}`);
    }
  }

  // annunci spariti da Vinted = venduti
  for (const l of legami.filter((x) => x.open && !apertiIds.has(x.item_id))) {
    l.open = false;
    if (!PROVA) await sb.from("vinted_items").update({ open: false }).eq("item_id", l.item_id);
    toccati.add(l.product_id);
    venduti++;
    dì(`- venduto/tolto da Vinted: annuncio ${l.item_id} (taglia ${l.size ?? "?"})`);
  }

  for (const id of toccati) {
    const p = prodotti.find((x) => x.id === id);
    if (!p) continue;
    try {
      await aggiornaCapo(p, legami);
      if (p.stock === 0) dì(`  "${p.title}" è tutto venduto.`);
    } catch (e) {
      dì(`! ERRORE aggiornando "${p.title}": ${e.message}`);
    }
  }

  dì(`Fatto: ${creati} nuovi, ${aggiunti} taglie aggiunte, ${bozze} bozze da controllare, ${venduti} venduti.`);
}

let uscita = 0;
try {
  await main();
} catch (e) {
  dì(`ERRORE: ${e.message}`);
  uscita = 1;
}
const cartella = path.join(QUI, "log");
fs.mkdirSync(cartella, { recursive: true });
const data = new Date().toISOString().slice(0, 10);
fs.appendFileSync(path.join(cartella, `${data}${PROVA ? "-prova" : ""}.txt`), rapporto.join("\n") + "\n\n");
process.exit(uscita);
