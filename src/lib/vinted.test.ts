import { describe, expect, it } from "vitest";
import { destinazioneVinted, normalizzaVinted } from "./vinted";

describe("normalizzaVinted", () => {
  it("vuoto = nessun link", () => {
    expect(normalizzaVinted("")).toBeNull();
    expect(normalizzaVinted("   ")).toBeNull();
    expect(normalizzaVinted(undefined)).toBeNull();
  });
  it("accetta link Vinted https", () => {
    expect(normalizzaVinted(" https://www.vinted.it/items/123-felpa ")).toBe("https://www.vinted.it/items/123-felpa");
    expect(normalizzaVinted("https://www.vinted.com/items/9")).toBe("https://www.vinted.com/items/9");
  });
  it("rifiuta tutto il resto", () => {
    expect(() => normalizzaVinted("vinted.it/items/1")).toThrow();
    expect(() => normalizzaVinted("http://www.vinted.it/items/1")).toThrow();
    expect(() => normalizzaVinted("https://example.com/vinted.it")).toThrow();
    expect(() => normalizzaVinted("https://vinted.it.evil.com/items/1")).toThrow();
  });
});

describe("destinazioneVinted", () => {
  const armadio = "https://www.vinted.it/member/1-armadio";
  it("con il link del capo porta al capo", () => {
    const d = destinazioneVinted({ vintedUrl: "https://www.vinted.it/items/5" }, armadio);
    expect(d).toEqual({ href: "https://www.vinted.it/items/5", diretto: true, etichetta: "Acquista su Vinted" });
  });
  it("senza link porta all'armadio", () => {
    for (const capo of [{}, { vintedUrl: "" }, { vintedUrl: "  " }, { vintedUrl: null }]) {
      const d = destinazioneVinted(capo, armadio);
      expect(d.href).toBe(armadio);
      expect(d.diretto).toBe(false);
    }
  });
});
