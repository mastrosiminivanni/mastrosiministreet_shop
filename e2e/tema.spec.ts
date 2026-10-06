import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("tema chiaro e scuro", () => {
  test("parte scuro, il selettore cambia tema e lo ricorda", async ({ page }) => {
    await page.goto("/shop");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.getByRole("button", { name: "Passa al tema chiaro" }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(page.getByRole("button", { name: "Passa al tema scuro" })).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(244, 244, 242)");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "light");

    await page.getByRole("button", { name: "Passa al tema scuro" }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(12, 12, 12)");
  });

  for (const path of ["/shop", "/dove-siamo", "/contatti", "/chi-siamo", "/legal/privacy"]) {
    test(`contrasto nel tema chiaro: ${path}`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("ms-theme", "light"));
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      await page.waitForTimeout(1200);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const gravi = r.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
      expect(
        gravi.map(
          (v) =>
            `${v.id}: ${v.nodes
              .slice(0, 2)
              .map((n) => n.target.join(" "))
              .join(" | ")}`,
        ),
      ).toEqual([]);
    });
  }

  test("tema chiaro: immagine di partenza chiara e furgone chiaro (texture chiare solo qui)", async ({
    page,
  }) => {
    const richieste: string[] = [];
    page.on("request", (r) => richieste.push(r.url()));
    await page.addInitScript(() => localStorage.setItem("ms-theme", "light"));
    await page.goto("/");
    await expect(page.locator("picture.solo-chiaro")).toBeVisible();
    await expect(page.locator("picture.solo-scuro")).toBeHidden();
    expect(await page.locator("picture.solo-chiaro img").getAttribute("src")).toMatch(
      /poster-mobile-chiaro\.webp/,
    );
    await expect
      .poll(() => richieste.filter((u) => /livrea-chiara/.test(u)).length, { timeout: 90000 })
      .toBe(3);
  });

  test("tema scuro: nessuna texture chiara scaricata", async ({ page }) => {
    const richieste: string[] = [];
    page.on("request", (r) => richieste.push(r.url()));
    await page.goto("/");
    await expect(page.locator("picture.solo-scuro")).toHaveCSS("opacity", "0", { timeout: 90000 }); // il 3D è arrivato
    await page.waitForTimeout(1500);
    expect(richieste.filter((u) => /livrea-chiara/.test(u))).toEqual([]);
  });

  test("passando al chiaro a pagina aperta il furgone prende le texture chiare", async ({
    page,
  }) => {
    const richieste: string[] = [];
    page.on("request", (r) => richieste.push(r.url()));
    await page.goto("/");
    await expect(page.locator("picture.solo-scuro")).toHaveCSS("opacity", "0", { timeout: 90000 });
    expect(richieste.filter((u) => /livrea-chiara/.test(u))).toEqual([]);
    await page.getByRole("button", { name: "Passa al tema chiaro" }).click();
    await expect
      .poll(() => richieste.filter((u) => /livrea-chiara/.test(u)).length, { timeout: 30000 })
      .toBe(3);
  });

  test.describe("segue il telefono", () => {
    test.describe("telefono in modalità chiara", () => {
      test.use({ colorScheme: "light" });
      test("senza nessuna scelta il sito parte chiaro", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
        await expect(page.locator("body")).toHaveCSS("background-color", "rgb(244, 244, 242)");
        await expect(page.locator("picture.solo-chiaro")).toBeVisible();
      });
      test("la scelta fatta a mano vince sul telefono", async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem("ms-theme", "dark"));
        await page.goto("/");
        await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      });
    });

    test.describe("telefono in modalità scura", () => {
      test.use({ colorScheme: "dark" });
      test("senza nessuna scelta il sito parte scuro", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      });
      test("la scelta fatta a mano vince sul telefono", async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem("ms-theme", "light"));
        await page.goto("/");
        await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
      });
    });

    test("se il telefono cambia mentre il sito è aperto, il sito lo segue (finché non hai scelto)", async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/shop");
      const html = page.locator("html");
      await expect(html).toHaveAttribute("data-theme", "dark");
      await expect(page.getByRole("button", { name: "Passa al tema chiaro" })).toBeVisible();
      await page.waitForTimeout(1500); // il sito ha attivato l'ascolto del telefono
      await page.emulateMedia({ colorScheme: "light" });
      await expect(html).toHaveAttribute("data-theme", "light");
      await page.emulateMedia({ colorScheme: "dark" });
      await expect(html).toHaveAttribute("data-theme", "dark");

      // dopo una scelta a mano il telefono non decide più
      await page.getByRole("button", { name: "Passa al tema chiaro" }).click();
      await expect(html).toHaveAttribute("data-theme", "light");
      await page.emulateMedia({ colorScheme: "dark" });
      await page.waitForTimeout(500);
      await expect(html).toHaveAttribute("data-theme", "light");
    });
  });
});
