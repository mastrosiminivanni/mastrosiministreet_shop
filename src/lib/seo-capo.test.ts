import { describe, expect, it } from "vitest";
import { descrizioneAuto, slugDa } from "./seo-capo";

describe("slugDa", () => {
  it("toglie accenti e simboli", () => {
    expect(slugDa("Felpa zip bordeaux")).toBe("felpa-zip-bordeaux");
    expect(slugDa("  Maglia à righe / nera!! ")).toBe("maglia-a-righe-nera");
  });
  it("non resta mai vuoto", () => expect(slugDa("???")).toBe("capo"));
});

describe("descrizioneAuto", () => {
  it("cita nome, taglie, prezzo e Instagram", () => {
    const d = descrizioneAuto({ title: "Jeans blu sfumato", price: 30, sizes: ["M", "L", "XL"] });
    expect(d).toContain("Jeans blu sfumato");
    expect(d).toContain("taglie M, L e XL");
    expect(d).toContain("30€");
    expect(d).toContain("Instagram");
    expect(d).not.toMatch(/—|–|vintage|usato/i);
  });
});
