import { expect, test } from "@playwright/test";

// Il negozio è statico: lo stato venduto/in vendita si legge dall'archivio a ogni visita.
// Qui si prende la risposta vera dell'archivio e si segna come venduto il primo capo.
async function segnaPrimoComeVenduto(page: import("@playwright/test").Page, tutti = false) {
  await page.route(/\/rest\/v1\/products\?select=id,status,stock/, async (route) => {
    const risposta = await route.fetch();
    const righe = (await risposta.json()) as { id: string; status: string; stock: number }[];
    for (const r of tutti ? righe : righe.slice(0, 1)) r.status = "sold";
    await route.fulfill({ response: risposta, json: righe });
  });
}

test("un capo venduto nel pannello compare «Venduto» nel negozio senza ripubblicare", async ({ page }) => {
  await segnaPrimoComeVenduto(page);
  await page.goto("/shop/");
  await expect(page.getByText("Venduto", { exact: true }).first()).toBeVisible({ timeout: 15000 });
});

test("se l'archivio non risponde il negozio resta com'era", async ({ page }) => {
  await page.route(/\/rest\/v1\/products\?select=id,status,stock/, (r) => r.abort());
  const html = await (await page.request.get("/shop/")).text();
  const giaVenduti = (html.match(/>Venduto</g) ?? []).length;
  await page.goto("/shop/");
  await expect(page.locator('a[href^="/shop/"]').first()).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(page.getByText("Venduto", { exact: true })).toHaveCount(giaVenduti);
});

test("la pagina del capo venduto non offre più i pulsanti per scrivere", async ({ page }) => {
  await segnaPrimoComeVenduto(page, true);
  // il primo capo dell'elenco è il più recente non venduto: cerchiamo la sua pagina dal catalogo
  const cat = await (await page.request.get("/catalogo.json")).json();
  const primo = cat.items[0];
  await page.goto(`/shop/${primo.url.split("/shop/")[1]}`);
  await expect(page.getByText(/Venduto\. Quando è andato/)).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("link", { name: "Scrivici su Instagram" })).toHaveCount(1); // solo quello fisso in basso
});
