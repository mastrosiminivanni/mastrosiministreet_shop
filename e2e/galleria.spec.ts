import { expect, test } from "@playwright/test";

test("la galleria del capo si scorre e mostra il contatore", async ({ page }) => {
  await page.goto("/shop/");
  const link = page.locator('a[href^="/shop/"]').filter({ hasText: /foto/i }).first();
  test.skip((await link.count()) === 0, "nessun capo con più foto nei dati locali");
  await link.click();
  await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible();
  await page.getByRole("button", { name: "Foto 2", exact: true }).click();
  await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();
});
