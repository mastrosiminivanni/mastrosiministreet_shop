import {
  INSTAGRAM_DM_URL,
  INSTAGRAM_URL,
  MARKET_HOURS,
  MARKETS,
  SUNDAY_NOTE,
  VINTED_URL,
  mapsUrl,
  type Market,
} from "@/data/markets";
import { SPECIAL_STOPS } from "@/data/special-stops";
import { marketForDate, nextMarket, romeNow, statusAt } from "@/lib/market";

/**
 * Strumenti per gli agenti (WebMCP): funzioni di sola lettura sui dati pubblici del sito.
 * Nomi e risultati sono in inglese/strutturati, i valori restano in italiano come il sito.
 */
export type AgentTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: true; consequentialHint: false; untrustedContentHint: false };
  execute: (args: Record<string, unknown>) => Promise<string> | string;
};

const SOLA_LETTURA = {
  readOnlyHint: true,
  consequentialHint: false,
  untrustedContentHint: false,
} as const;
const ORARIO = `dalle ${MARKET_HOURS.from} alle ${MARKET_HOURS.to}`;

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const mercato = (m: Market) => ({
  day: m.dayName,
  town: m.town,
  spot: m.spot,
  hours: ORARIO,
  map_url: mapsUrl(m),
  note: "Posizione indicativa: il punto esatto è nelle storie Instagram.",
});

/** Dove siamo oggi, se siamo aperti e dove saremo il prossimo giorno. */
export function oggi(now: Date = romeNow()) {
  const speciale = SPECIAL_STOPS.find((s) => s.date === iso(now));
  const mercatoOggi = marketForDate(now);
  const domani = new Date(now);
  domani.setDate(domani.getDate() + 1);
  const prossimo = marketForDate(domani) ?? nextMarket(domani);
  const orari = speciale
    ? speciale.start && speciale.end
      ? { start: speciale.start, end: speciale.end }
      : null
    : mercatoOggi
      ? MARKET_HOURS
      : null;
  const stato = orari ? statusAt(now, orari.start, orari.end) : null;
  const statoTesto =
    stato === "aperto"
      ? "Aperti ora"
      : stato === "chiuso"
        ? "Chiuso per oggi"
        : stato === "prima"
          ? `Apriamo alle ${orari?.start.replace(/^0/, "")}`
          : null;

  if (speciale) {
    return {
      date: iso(now),
      type: "special_stop",
      town: speciale.town,
      spot: speciale.spot ?? null,
      status: statoTesto,
      note: speciale.note ?? null,
      next_market: mercato(prossimo),
    };
  }
  if (!mercatoOggi) {
    return {
      date: iso(now),
      type: "sunday",
      town: null,
      status: null,
      note: SUNDAY_NOTE,
      instagram: INSTAGRAM_URL,
      next_market: mercato(prossimo),
    };
  }
  return {
    date: iso(now),
    type: "weekly_market",
    ...mercato(mercatoOggi),
    status: statoTesto,
    next_market: mercato(prossimo),
  };
}

export const giroSettimana = () => ({
  hours: ORARIO,
  markets: MARKETS.map(mercato),
  sunday: SUNDAY_NOTE,
});

export const comeComprare = () => ({
  online_checkout: false,
  summary:
    "Dal sito non si acquista: si compra al furgone, scrivendo su Instagram o dal profilo Vinted.",
  ways: [
    {
      type: "in_person",
      where: "Al furgone, nel mercato del giorno",
      hours: ORARIO,
      tool: "get_todays_market",
    },
    { type: "instagram", url: INSTAGRAM_DM_URL, note: "Scrivere in chat con il nome del capo" },
    {
      type: "vinted",
      url: VINTED_URL,
      note: "Se manca la taglia cercata, la carichiamo su Vinted su richiesta via Instagram",
    },
  ],
});

export type CapoCatalogo = {
  slug: string;
  title: string;
  category: string;
  price_eur: number;
  sizes: string[];
  available: boolean;
  pieces_left: number;
  url: string;
};

const CATEGORIE = ["camicia", "felpa", "pantaloni", "altro"] as const;

/** Filtra i capi del catalogo (già letto da /catalogo.json). Errori chiari: l'agente può correggere e riprovare. */
export function cercaCapi(capi: CapoCatalogo[], args: Record<string, unknown>) {
  const { category, size, max_price, only_available } = args;
  if (category !== undefined && !(CATEGORIE as readonly unknown[]).includes(category))
    throw new Error(`category non valida: usa una tra ${CATEGORIE.join(", ")}.`);
  if (max_price !== undefined && !(typeof max_price === "number" && max_price > 0))
    throw new Error("max_price deve essere un numero in euro maggiore di 0.");
  const soloDisponibili = only_available !== false;
  const taglia = typeof size === "string" ? size.trim().toUpperCase() : "";
  const trovati = capi.filter(
    (c) =>
      (category === undefined || c.category === category) &&
      (!taglia || c.sizes.some((s) => s.toUpperCase() === taglia)) &&
      (max_price === undefined || c.price_eur <= (max_price as number)) &&
      (!soloDisponibili || c.available),
  );
  return { total: trovati.length, items: trovati };
}

export function creaStrumenti(leggiCatalogo: () => Promise<CapoCatalogo[]>): AgentTool[] {
  return [
    {
      name: "get_todays_market",
      description:
        "Tells where the Mastrosimini street-clothing van is today (town, exact spot, opening hours, whether it is open right now) and where it will be next.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: SOLA_LETTURA,
      execute: () => JSON.stringify(oggi()),
    },
    {
      name: "get_weekly_markets",
      description:
        "Lists the weekly route of the van: one market per day from Monday to Saturday with town, spot, hours and map link, plus the Sunday note.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: SOLA_LETTURA,
      execute: () => JSON.stringify(giroSettimana()),
    },
    {
      name: "search_products",
      description:
        "Searches the clothes sold at the van (shirts, sweatshirts, trousers) by category, size and maximum price in euro. Returns title, price, sizes, availability and page URL.",
      inputSchema: {
        type: "object",
        properties: {
          category: { type: "string", enum: [...CATEGORIE], description: "Type of garment." },
          size: {
            type: "string",
            description: "Size as written by the customer, for example M, XL or 46.",
          },
          max_price: { type: "number", description: "Maximum price in euro." },
          only_available: {
            type: "boolean",
            description: "Only items still in stock. Defaults to true.",
          },
        },
        additionalProperties: false,
      },
      annotations: SOLA_LETTURA,
      // L'errore viene restituito come risposta (non lanciato): il browser nasconde i messaggi delle eccezioni, e così l'agente può correggersi.
      execute: async (args) => {
        try {
          return JSON.stringify(cercaCapi(await leggiCatalogo(), args ?? {}));
        } catch (e) {
          return JSON.stringify({
            error: e instanceof Error ? e.message : "Ricerca non riuscita, riprova.",
          });
        }
      },
    },
    {
      name: "get_how_to_buy",
      description:
        "Explains how to buy: the site has no online checkout, items are bought at the van, by chatting on Instagram, or from the Vinted profile.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: SOLA_LETTURA,
      execute: () => JSON.stringify(comeComprare()),
    },
  ];
}
