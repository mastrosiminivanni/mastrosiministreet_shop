import { expect, test } from "@playwright/test";

test("su telefono, toccando un paese la pagina scorre alla mappa e si può tornare ai giorni", async ({ page }) => {
  await page.goto("/dove-siamo/");
  await page.getByRole("button", { name: "Rifiuta" }).first().click().catch(() => {});
  const mappa = page.locator("#mappa");
  const inVista = () =>
    mappa.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.top < window.innerHeight * 0.5;
    });
  expect(await inVista()).toBe(false); // all'inizio la mappa è sotto l'elenco
  await page.getByRole("button", { name: /Noci/ }).click();
  await expect.poll(inVista, { timeout: 5000 }).toBe(true);
  await expect(page.getByText(/Martedì, Noci/).first()).toBeVisible();
  await page.getByRole("button", { name: "↑ Torna ai giorni" }).click();
  await expect.poll(inVista, { timeout: 5000 }).toBe(false);
  await expect(page.getByRole("list", { name: "Calendario settimanale" })).toBeInViewport();
});
