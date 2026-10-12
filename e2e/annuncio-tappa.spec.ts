import { expect, test, type Page } from "@playwright/test";

// Tappa speciale in src/data/special-stops.ts: domenica 18 ottobre 2026, Putignano, 7-13, Via Rosata Romanazzi
async function apriIl(page: Page, quando: string, indirizzo = "/") {
  // il browser di test si dichiara "automatico" e l'annuncio non si apre: qui lo facciamo passare per una persona
  await page.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  await page.clock.install({ time: new Date(quando) });
  await page.goto(indirizzo);
  await page.clock.resume();
}
const finestra = (page: Page) => page.getByRole("dialog", { name: /Putignano/i });

test.describe("finestra di annuncio della tappa speciale", () => {
  test("si apre da sola con conto alla rovescia, luogo e orario", async ({ page }) => {
    await apriIl(page, "2026-10-14T10:00:00+02:00");
    await expect(finestra(page)).toBeVisible();
    await expect(finestra(page)).toContainText("Mancano 4 giorni");
    await expect(finestra(page)).toContainText(/domenica 18 ottobre:\s*siamo a Putignano/i);
    await expect(finestra(page)).toContainText("Via Rosata Romanazzi, dalle 7 alle 13");
    await expect(finestra(page).getByRole("link", { name: "Tutte le tappe" })).toHaveAttribute("href", /^\/dove-siamo\/?$/);
    await expect(finestra(page).getByRole("link", { name: "Scrivici su Instagram" })).toBeVisible();
  });

  test("alla vigilia dice «Domani»", async ({ page }) => {
    await apriIl(page, "2026-10-17T18:00:00+02:00");
    await expect(finestra(page)).toContainText("Domani");
  });

  test("domenica mattina dice «Oggi siamo a Putignano»", async ({ page }) => {
    await apriIl(page, "2026-10-18T09:00:00+02:00");
    await expect(page.getByRole("dialog", { name: "Oggi siamo a Putignano" })).toBeVisible();
  });

  test("domenica dopo le 13 e nei giorni seguenti sparisce da sola", async ({ page }) => {
    await apriIl(page, "2026-10-18T14:00:00+02:00");
    await page.waitForTimeout(2500);
    await expect(page.locator('[aria-labelledby="annuncio-tappa"]')).toHaveCount(0);
    await apriIl(page, "2026-10-19T09:00:00+02:00");
    await page.waitForTimeout(2500);
    await expect(page.locator('[aria-labelledby="annuncio-tappa"]')).toHaveCount(0);
  });

  test("si chiude con la X, con Esc, e non torna lo stesso giorno", async ({ page }) => {
    await apriIl(page, "2026-10-14T10:00:00+02:00");
    await expect(finestra(page)).toBeVisible();
    await finestra(page).getByRole("button", { name: "Chiudi annuncio" }).click();
    await expect(finestra(page)).toHaveCount(0);
    await page.reload();
    await page.waitForTimeout(2500);
    await expect(page.getByRole("dialog", { name: /Putignano/i })).toHaveCount(0);

    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(finestra(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(finestra(page)).toHaveCount(0);
  });

  test("mentre è aperta il banner dei cookie aspetta, poi compare", async ({ page }) => {
    await apriIl(page, "2026-10-14T10:00:00+02:00");
    await expect(finestra(page)).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Cookie" })).toBeHidden();
    await finestra(page).getByRole("button", { name: "Chiudi annuncio" }).click();
    await expect(page.getByRole("dialog", { name: "Cookie" })).toBeVisible();
  });

  test("nei browser automatici e per i robot non si apre", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-10-14T10:00:00+02:00") });
    await page.goto("/");
    await page.clock.resume();
    await page.waitForTimeout(2500);
    await expect(page.getByRole("dialog", { name: /Putignano/i })).toHaveCount(0);
  });

  test("la tappa è anche in Dove siamo e nel calendario", async ({ page, request }) => {
    await page.clock.install({ time: new Date("2026-10-14T10:00:00+02:00") });
    await page.goto("/dove-siamo/");
    await page.clock.resume();
    await expect(page.getByText(/Tappa speciale 2026-10-18: Putignano/)).toBeVisible();
    const ics = await (await request.get("/calendario.ics")).text();
    expect(ics).toContain("Putignano");
    expect(ics).toContain("20261018");
  });
});
