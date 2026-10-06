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
});
