import { expect, test } from "@playwright/test";

test.describe("Google Analytics", () => {
  test("non si carica prima del consenso, si carica dopo Accetta", async ({ page }) => {
    const richieste: string[] = [];
    page.on("request", (r) => richieste.push(r.url()));
    await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.fulfill({ status: 200, body: "" }));
    await page.goto("/");
    await page.waitForTimeout(1000);
    expect(richieste.some((u) => u.includes("googletagmanager.com"))).toBe(false);
    await page.getByRole("button", { name: "Accetta" }).click();
    await expect.poll(() => richieste.some((u) => u.includes("googletagmanager.com/gtag/js?id=G-Q1LE66RZB6"))).toBe(true);
  });

  test("con Rifiuta non si carica; in /admin non si carica mai", async ({ page }) => {
    const richieste: string[] = [];
    page.on("request", (r) => richieste.push(r.url()));
    await page.goto("/");
    await page.getByRole("button", { name: "Rifiuta" }).click();
    await page.waitForTimeout(800);
    expect(richieste.some((u) => u.includes("googletagmanager.com"))).toBe(false);
    await page.evaluate(() => localStorage.setItem("ms-consent", "granted"));
    await page.goto("/admin/");
    await page.waitForTimeout(1200);
    expect(richieste.some((u) => u.includes("googletagmanager.com"))).toBe(false);
  });
});
