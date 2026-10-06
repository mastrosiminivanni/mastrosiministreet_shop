import { describe, expect, it, vi } from "vitest";

vi.mock("@/data/special-stops", () => ({
  SPECIAL_STOPS: [
    {
      date: "2026-10-11",
      town: "Putignano",
      spot: "Via Rosata Romanazzi",
      start: "07:00",
      end: "13:00",
    },
  ],
}));

import {
  cercaCapi,
  comeComprare,
  creaStrumenti,
  giroSettimana,
  oggi,
  type CapoCatalogo,
} from "./agent-tools";

// 5 ottobre 2026 è un lunedì: mercato di Rutigliano
const alle = (ora: string, giorno = "2026-10-05") => new Date(`${giorno}T${ora}:00`);

const capi: CapoCatalogo[] = [
  {
    slug: "a",
    title: "Camicia a quadri",
    category: "camicia",
    price_eur: 25,
    sizes: ["M", "L"],
    available: true,
    pieces_left: 1,
    url: "u/a",
  },
  {
    slug: "b",
    title: "Felpa nera",
    category: "felpa",
    price_eur: 30,
    sizes: ["XL"],
    available: true,
    pieces_left: 2,
    url: "u/b",
  },
  {
    slug: "c",
    title: "Pantaloni",
    category: "pantaloni",
    price_eur: 20,
    sizes: ["46"],
    available: false,
    pieces_left: 0,
    url: "u/c",
  },
];

describe("oggi", () => {
  it("lunedì alle 10: Rutigliano, aperti", () => {
    const r = oggi(alle("10:00"));
    expect(r).toMatchObject({
      type: "weekly_market",
      town: "Rutigliano",
      status: "Aperti ora",
      hours: "dalle 7:00 alle 13:00",
    });
    expect(r.next_market).toMatchObject({ town: "Noci", day: "Martedì" });
  });
  it("prima dell'apertura e dopo la chiusura", () => {
    expect(oggi(alle("05:30")).status).toBe("Apriamo alle 7:00");
    expect(oggi(alle("15:00")).status).toBe("Chiuso per oggi");
  });
  it("domenica senza tappa speciale: nessun paese, rimanda a Instagram, prossimo il lunedì", () => {
    const r = oggi(alle("10:00", "2026-10-04"));
    expect(r).toMatchObject({ type: "sunday", town: null });
    expect(r.next_market).toMatchObject({ town: "Rutigliano" });
  });
  it("domenica con tappa speciale: usa quella", () => {
    expect(oggi(alle("09:00", "2026-10-11"))).toMatchObject({
      type: "special_stop",
      town: "Putignano",
      status: "Aperti ora",
    });
  });
});

describe("giro e come comprare", () => {
  it("sei mercati con link alla mappa", () => {
    const g = giroSettimana();
    expect(g.markets).toHaveLength(6);
    expect(g.markets.every((m) => m.map_url.startsWith("https://www.google.com/maps/"))).toBe(true);
  });
  it("dice chiaramente che non c'è acquisto online", () => {
    const c = comeComprare();
    expect(c.online_checkout).toBe(false);
    expect(c.ways.map((w) => w.type)).toEqual(["in_person", "instagram", "vinted"]);
  });
});

describe("cercaCapi", () => {
  it("di base mostra solo i disponibili", () => {
    expect(cercaCapi(capi, {}).items.map((c) => c.slug)).toEqual(["a", "b"]);
  });
  it("filtra per categoria, taglia (senza badare alle maiuscole) e prezzo", () => {
    expect(cercaCapi(capi, { category: "felpa" }).total).toBe(1);
    expect(cercaCapi(capi, { size: "l" }).items[0].slug).toBe("a");
    expect(cercaCapi(capi, { max_price: 25 }).items.map((c) => c.slug)).toEqual(["a"]);
  });
  it("con only_available false include anche i venduti", () => {
    expect(cercaCapi(capi, { only_available: false }).total).toBe(3);
  });
  it("errori chiari su valori non validi", () => {
    expect(() => cercaCapi(capi, { category: "cappelli" })).toThrow(/category non valida/);
    expect(() => cercaCapi(capi, { max_price: -3 })).toThrow(/max_price/);
  });
});

describe("strumenti registrati", () => {
  const strumenti = creaStrumenti(async () => capi);
  it("nomi unici, schema valido, solo lettura", () => {
    expect(new Set(strumenti.map((s) => s.name)).size).toBe(strumenti.length);
    for (const s of strumenti) {
      expect(s.name).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(s.description.length).toBeGreaterThan(30);
      expect(s.inputSchema).toMatchObject({ type: "object" });
      expect(s.annotations).toEqual({
        readOnlyHint: true,
        consequentialHint: false,
        untrustedContentHint: false,
      });
    }
  });
  it("search_products usa il catalogo e restituisce testo JSON", async () => {
    const t = strumenti.find((s) => s.name === "search_products")!;
    const out = JSON.parse(await t.execute({ category: "camicia" }));
    expect(out.items).toHaveLength(1);
  });
  it("search_products con input sbagliato risponde con un errore leggibile invece di lanciarlo", async () => {
    const t = strumenti.find((s) => s.name === "search_products")!;
    const out = JSON.parse(await t.execute({ category: "cappelli" }));
    expect(out.error).toMatch(/category non valida/);
  });
});
