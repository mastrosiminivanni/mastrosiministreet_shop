import { expect, test } from "@playwright/test";

async function contaClarity(context: import("@playwright/test").BrowserContext) {
  const richieste: string[] = [];
  await context.route(/clarity\.ms/, (r) => {
    richieste.push(r.request().url());
    return r.abort();
  });
  return richieste;
}

test.describe("Clarity e area riservata", () => {
  test("con consenso concesso non parte su /admin", async ({ page, context }) => {
    const richieste = await contaClarity(context);
    await page.addInitScript(() => localStorage.setItem("ms-consent", "granted"));
    await page.goto("/admin");
    await page.waitForTimeout(2000);
    expect(richieste).toEqual([]);
  });

  test("con consenso concesso parte sulle altre pagine", async ({ page, context }) => {
    const richieste = await contaClarity(context);
    await page.addInitScript(() => localStorage.setItem("ms-consent", "granted"));
    await page.goto("/contatti");
    await expect.poll(() => richieste.length).toBeGreaterThan(0);
    expect(richieste[0]).toContain("ysybuodtqv");
  });

  test("con consenso rifiutato non parte da nessuna parte", async ({ page, context }) => {
    const richieste = await contaClarity(context);
    await page.addInitScript(() => localStorage.setItem("ms-consent", "denied"));
    for (const path of ["/", "/contatti", "/admin"]) {
      await page.goto(path);
      await page.waitForTimeout(1200);
    }
    expect(richieste).toEqual([]);
  });

  test("se era già attivo, si ferma quando si va su /admin", async ({ page, context }) => {
    await contaClarity(context);
    await page.addInitScript(() => localStorage.setItem("ms-consent", "granted"));
    await page.goto("/contatti");
    await page.waitForFunction(() => typeof window.clarity === "function");
    // navigazione dentro il sito, senza ricaricare la pagina
    await page.evaluate(() =>
      (window as unknown as { next: { router: { push: (p: string) => void } } }).next.router.push(
        "/admin",
      ),
    );
    await expect(page).toHaveURL(/\/admin/);
    await expect
      .poll(() =>
        page.evaluate(() =>
          JSON.stringify((window.clarity as unknown as { q?: unknown[] }).q ?? []),
        ),
      )
      .toContain('"stop"');
  });
});
