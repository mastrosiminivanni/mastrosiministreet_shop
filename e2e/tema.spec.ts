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
});
