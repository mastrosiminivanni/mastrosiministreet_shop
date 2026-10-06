import { expect, test } from "@playwright/test";

test.describe("furgone in home: immagine subito, 3D dopo", () => {
  test("subito c'è l'immagine del furgone nuovo, non la vecchia foto", async ({ page }) => {
    const richieste: string[] = [];
    page.on("request", (r) => richieste.push(r.url()));
    await page.goto("/");
    const poster = page.getByRole("img", { name: /Il furgone di Mastrosimini/ });
    await expect(poster).toBeVisible();
    expect(await poster.getAttribute("src")).toMatch(/poster-mobile\.webp/);
    await expect
      .poll(() => richieste.some((u) => /poster-(desktop|mobile)\.webp/.test(u)))
      .toBe(true);
    expect(richieste.some((u) => /furgone\.png/.test(u))).toBe(false);
  });

  test("il 3D non parte subito: prima del ritardo non si scarica il modello", async ({ page }) => {
    const richieste: string[] = [];
    page.on("request", (r) => richieste.push(r.url()));
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    expect(richieste.some((u) => /van\.glb/.test(u))).toBe(false);
  });

  test("dopo qualche secondo il 3D arriva e l'immagine sfuma", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("canvas").first()).toBeAttached({ timeout: 60000 });
    await expect(page.locator("picture").first()).toHaveCSS("opacity", "0", { timeout: 90000 });
  });

  test("con 'riduci movimento' resta l'immagine e non parte nessun 3D", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(5000);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByRole("img", { name: /Il furgone di Mastrosimini/ })).toBeVisible();
  });

  test("la scena del giro non parte finché non ci si avvicina", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 60000 }); // solo quello della prima schermata
    await page.waitForTimeout(1500);
    await expect(page.locator("canvas")).toHaveCount(1);
    await page.getByRole("heading", { name: "Il giro della settimana" }).scrollIntoViewIfNeeded();
    await expect(page.locator("canvas")).toHaveCount(2, { timeout: 60000 });
  });
});
