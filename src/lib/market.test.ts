import { describe, expect, it } from "vitest";
import { marketForDate, nextMarket, statusAt } from "./market";

// Nota: le date sono create con i campi locali (anno, mese, giorno, ore) come fa romeNow().
const d = (y: number, m: number, day: number, h = 0, min = 0) => new Date(y, m - 1, day, h, min);

describe("marketForDate", () => {
  it("lunedì Rutigliano … sabato Castellana Grotte", () => {
    const attesi = ["Rutigliano", "Noci", "Putignano", "Polignano", "Conversano", "Castellana Grotte"];
    attesi.forEach((paese, i) => expect(marketForDate(d(2026, 10, 5 + i))?.town).toBe(paese));
  });
  it("la domenica non c'è un mercato fisso", () => {
    expect(marketForDate(d(2026, 10, 11))).toBeNull();
  });
});

describe("nextMarket", () => {
  it("dalla domenica il prossimo è lunedì", () => {
    expect(nextMarket(d(2026, 10, 11)).town).toBe("Rutigliano");
  });
  it("oggi stesso se c'è mercato", () => {
    expect(nextMarket(d(2026, 10, 7)).town).toBe("Putignano");
  });
});

describe("statusAt (7:00 - 13:00)", () => {
  it("prima delle 7 si apre", () => expect(statusAt(d(2026, 10, 5, 6, 59), "07:00", "13:00")).toBe("prima"));
  it("alle 7:00 è aperto", () => expect(statusAt(d(2026, 10, 5, 7, 0), "07:00", "13:00")).toBe("aperto"));
  it("alle 12:59 è ancora aperto", () => expect(statusAt(d(2026, 10, 5, 12, 59), "07:00", "13:00")).toBe("aperto"));
  it("alle 13:00 è chiuso", () => expect(statusAt(d(2026, 10, 5, 13, 0), "07:00", "13:00")).toBe("chiuso"));
  it("nel pomeriggio è chiuso", () => expect(statusAt(d(2026, 10, 5, 17, 30), "07:00", "13:00")).toBe("chiuso"));
});
