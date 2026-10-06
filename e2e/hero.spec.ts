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
    await page.waitForTimeout(1500);
    expect(richieste.some((u) => /logo-profilo\.png/.test(u))).toBe(false); // in testata c'è il logo leggero
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

  test("a riposo la scena smette di ridisegnarsi e riparte al primo gesto", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __disegni: number };
      w.__disegni = 0;
      const proto = WebGL2RenderingContext.prototype as unknown as Record<
        string,
        (...a: unknown[]) => unknown
      >;
      for (const nome of [
        "drawElements",
        "drawArrays",
        "drawElementsInstanced",
        "drawArraysInstanced",
      ]) {
        const originale = proto[nome];
        proto[nome] = function (this: unknown, ...a: unknown[]) {
          w.__disegni++;
          return originale.apply(this, a);
        };
      }
    });
    const disegni = () =>
      page.evaluate(() => (window as unknown as { __disegni: number }).__disegni);
    await page.goto("/");
    await expect(page.locator("picture.solo-scuro")).toHaveCSS("opacity", "0", { timeout: 90000 }); // il 3D è arrivato
    await page.waitForTimeout(5000); // 2,5 s di riposo + margine
    const fermo = await disegni();
    expect(fermo).toBeGreaterThan(0);
    await page.waitForTimeout(1500);
    expect(await disegni()).toBe(fermo); // nessun disegno mentre è a riposo
    await page.mouse.move(120, 140);
    await page.mouse.move(200, 220);
    await page.waitForTimeout(600);
    expect(await disegni()).toBeGreaterThan(fermo); // il gesto l'ha svegliata
  });
});
