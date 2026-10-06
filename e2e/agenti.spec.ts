import { expect, test } from "@playwright/test";

type Strumento = {
  name: string;
  description: string;
  inputSchema: { type: string };
  annotations: { readOnlyHint: boolean };
  execute: (a: object) => Promise<string> | string;
};

test.describe("navigazione per agenti", () => {
  test("llms.txt è Markdown con un H1 e i link giusti", async ({ request }) => {
    const r = await request.get("/llms.txt");
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("text/plain");
    const testo = await r.text();
    expect(testo.split("\n")[0]).toBe("# Mastrosimini Street Shop");
    expect((testo.match(/^# /gm) ?? []).length).toBe(1);
    for (const parte of [
      "/shop/",
      "/dove-siamo/",
      "/catalogo.json",
      "/calendario.ics",
      "ig.me/m/mastrosiministreet_shop",
      "vinted.it/member/",
    ])
      expect(testo).toContain(parte);
    expect(testo).not.toMatch(/—|–/);
  });

  test("catalogo.json: JSON valido con i dati dei capi", async ({ request }) => {
    const r = await request.get("/catalogo.json");
    expect(r.status()).toBe(200);
    const j = await r.json();
    expect(j).toMatchObject({ currency: "EUR", online_checkout: false });
    expect(j.items.length).toBeGreaterThan(0);
    for (const c of j.items)
      expect(c).toMatchObject({
        slug: expect.any(String),
        price_eur: expect.any(Number),
        sizes: expect.any(Array),
        available: expect.any(Boolean),
      });
  });

  test("se il browser supporta WebMCP, registra 4 strumenti di sola lettura che funzionano", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __tools: unknown[] };
      w.__tools = [];
      // come da specifica: lo strumento sparisce quando scatta il segnale di annullamento passato alla registrazione
      (document as unknown as { modelContext: unknown }).modelContext = {
        registerTool: (t: unknown, o?: { signal?: AbortSignal }) => {
          w.__tools.push(t);
          o?.signal?.addEventListener(
            "abort",
            () => (w.__tools = w.__tools.filter((x) => x !== t)),
          );
        },
      };
    });
    await page.goto("/");
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __tools: unknown[] }).__tools.length))
      .toBe(4);
    const info = await page.evaluate(() =>
      (window as unknown as { __tools: Strumento[] }).__tools.map((t) => ({
        n: t.name,
        ro: t.annotations.readOnlyHint,
        tipo: t.inputSchema.type,
      })),
    );
    expect(info.map((t) => t.n).sort()).toEqual([
      "get_how_to_buy",
      "get_todays_market",
      "get_weekly_markets",
      "search_products",
    ]);
    expect(info.every((t) => t.ro && t.tipo === "object")).toBe(true);

    const giro = await page.evaluate(async () => {
      const t = (window as unknown as { __tools: Strumento[] }).__tools.find(
        (x) => x.name === "get_weekly_markets",
      )!;
      return JSON.parse(await t.execute({}));
    });
    expect(giro.markets).toHaveLength(6);

    const ricerca = await page.evaluate(async () => {
      const t = (window as unknown as { __tools: Strumento[] }).__tools.find(
        (x) => x.name === "search_products",
      )!;
      return JSON.parse(await t.execute({ only_available: false }));
    });
    expect(ricerca.total).toBeGreaterThan(0);

    const errore = await page.evaluate(async () => {
      const t = (window as unknown as { __tools: Strumento[] }).__tools.find(
        (x) => x.name === "search_products",
      )!;
      return JSON.parse(await t.execute({ category: "cappelli" })).error as string;
    });
    expect(errore).toContain("category non valida");
  });

  test("senza WebMCP la pagina funziona e non dà errori", async ({ page }) => {
    const errori: string[] = [];
    page.on("pageerror", (e) => errori.push(e.message));
    await page.goto("/");
    await page.waitForTimeout(1500);
    expect(errori).toEqual([]);
  });
});
