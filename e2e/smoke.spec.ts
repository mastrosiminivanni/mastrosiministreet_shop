import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const LUNEDI = (ora: string) => new Date(`2026-10-05T${ora}:00+02:00`);

test("home: titolo, mercato di oggi e furgone (3D o foto)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("MASTROSIMINI", { ignoreCase: true });
  await expect(page.getByRole("link", { name: /Oggi:/i }).first()).toBeVisible();
  // il furgone c'è come scena 3D oppure come foto di riserva
  await expect.poll(async () => (await page.locator("canvas").count()) + (await page.locator('img[alt^="Il furgone"]').count())).toBeGreaterThan(0);
});

test("aperti alle 10, chiusi dopo le 13 ma il paese resta", async ({ page }) => {
  await page.clock.setFixedTime(LUNEDI("10:00"));
  await page.goto("/");
  const banner = page.locator("section[aria-labelledby=oggi-titolo]");
  await expect(banner).toContainText("Aperti ora");
  await expect(banner).toContainText("Oggi siamo a");
  await expect(banner).toContainText("Rutigliano");

  await page.clock.setFixedTime(LUNEDI("14:00"));
  await page.goto("/");
  await expect(banner).toContainText("Chiuso");
  await expect(banner).toContainText("Oggi eravamo a");
  await expect(banner).toContainText("Rutigliano");
});

test("domenica: tappa speciale, nessun aperti/chiusi", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-11T10:00:00+02:00"));
  await page.goto("/");
  const banner = page.locator("section[aria-labelledby=oggi-titolo]");
  await expect(banner).toContainText("tappa speciale", { ignoreCase: true });
  await expect(banner).not.toContainText("Aperti ora");
});

test("shop → scheda prodotto: si contatta solo su Instagram", async ({ page }) => {
  await page.goto("/shop");
  await page.locator("main ul li a").first().click();
  await expect(page).toHaveURL(/\/shop\/.+/);
  const ig = page.getByRole("link", { name: /Contattaci su Instagram/i });
  await expect(ig).toHaveAttribute("href", /ig\.me\/m\/mastrosiministreet_shop/);
  await expect(page.getByText(/compra ora|carrello/i)).toHaveCount(0);
});

test("dove siamo: mappa e calendario scaricabile", async ({ page, request }) => {
  await page.goto("/dove-siamo");
  await expect(page.getByRole("link", { name: /Aggiungi al calendario/i })).toBeVisible();
  const ics = await request.get("/calendario.ics");
  expect(ics.status()).toBe(200);
  expect(ics.headers()["content-type"]).toContain("text/calendar");
  expect(await ics.text()).toContain("DTSTART;TZID=Europe/Rome");
});

test("pagine di contatto e informative si aprono", async ({ page }) => {
  for (const [path, testo] of [
    ["/contatti", "Scrivici"],
    ["/legal/privacy", "Informativa sulla privacy"],
    ["/legal/cookie", "Cookie"],
    ["/legal/note-legali", "Note legali"],
    ["/chi-siamo", "Tre generazioni"],
  ] as const) {
    await page.goto(path);
    await expect(page.locator("h1")).toContainText(testo, { ignoreCase: true });
  }
  await page.goto("/contatti");
  await expect(page.getByRole("heading", { name: "Domande frequenti" })).toBeVisible();
  await page.getByText("Come compro?").click();
  await expect(page.getByText(/Dal sito non si acquista/)).toBeVisible();
  await expect(page.getByRole("link", { name: "profilo Vinted", exact: true })).toHaveAttribute("href", /vinted\.it\/member\//);
});

test("la sezione Look non esiste più e non compare 'vintage'", async ({ page }) => {
  const r = await page.goto("/look");
  expect(r?.status()).toBe(404);
  for (const path of ["/", "/shop", "/chi-siamo", "/contatti"]) {
    await page.goto(path);
    expect((await page.content()).toLowerCase()).not.toContain("vintage");
  }
  await page.goto("/");
  await expect(page.getByRole("link", { name: /^Look$/ })).toHaveCount(0);
});

test.describe("accessibilità (nessuna violazione grave)", () => {
  for (const path of ["/", "/shop", "/dove-siamo", "/chi-siamo", "/contatti", "/legal/privacy", "/legal/cookie", "/legal/note-legali"]) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(1500);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const gravi = r.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
      expect(gravi.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
    });
  }
});

test("cookie: Clarity parte solo dopo aver accettato", async ({ page, context }) => {
  const richieste: string[] = [];
  await context.route(/clarity\.ms/, (r) => {
    richieste.push(r.request().url());
    return r.abort();
  });
  await page.goto("/");
  const banner = page.getByRole("dialog", { name: "Cookie" });
  await expect(banner).toBeVisible();
  await page.waitForTimeout(1500);
  expect(richieste).toEqual([]); // niente prima del consenso

  await banner.getByRole("button", { name: "Rifiuta" }).click();
  await expect(banner).toBeHidden();
  await page.reload();
  await page.waitForTimeout(1500);
  expect(richieste).toEqual([]); // rifiutato: resta tutto spento, e il banner non torna

  await page.goto("/legal/cookie");
  await page.getByRole("button", { name: "Accetta" }).click();
  await expect.poll(() => richieste.length).toBeGreaterThan(0);
  expect(richieste[0]).toContain("ysybuodtqv");
});
