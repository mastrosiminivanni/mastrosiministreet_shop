import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

// Foto di prova verticali (3:4), con colori diversi
async function foto(nome: string, colore: string) {
  const buffer = await sharp({
    create: { width: 1200, height: 1600, channels: 3, background: colore },
  })
    .jpeg()
    .toBuffer();
  return { name: nome, mimeType: "image/jpeg", buffer };
}

test.describe("pannello admin (modalità prova)", () => {
  test("aggiungi un capo: foto, taglia, prezzo → bozza → pubblica → venduto → elimina", async ({
    page,
  }) => {
    await page.goto("/admin?prova=1");
    await expect(page.getByText("Modalità prova")).toBeVisible();
    const salva = page.getByRole("button", { name: "Salva come bozza" });
    await expect(salva).toBeDisabled();
    await expect(page.getByText(/Manca: almeno una foto, il nome, la taglia, il prezzo/)).toBeVisible();

    await page
      .locator("#foto")
      .setInputFiles([await foto("a.jpg", "#a33"), await foto("b.jpg", "#3a3")]);
    await expect(page.getByAltText("Foto 2")).toBeVisible();
    await expect(page.getByText("Copertina", { exact: true })).toBeVisible();

    await page.locator("#nome").fill("Camicia a quadri blu");
    await page.getByRole("button", { name: "M", exact: true }).click();
    await page.getByRole("button", { name: "L", exact: true }).click();
    await page.locator("#altra-taglia").fill("46");
    await page.getByRole("button", { name: "Aggiungi", exact: true }).click();
    await expect(page.getByRole("button", { name: "46", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.getByRole("button", { name: "25€" }).click();
    await page.getByRole("button", { name: "Più pezzi" }).click();
    await page.locator("#categoria").selectOption("camicia");

    await expect(salva).toBeEnabled();
    await salva.click();
    await expect(page.getByText("Capo salvato in bozza")).toBeVisible();

    const capo = page.locator("ul li").filter({ hasText: "Camicia a quadri blu" });
    await expect(capo).toContainText("25€");
    await expect(capo).toContainText("2 pezzi");
    await expect(capo).toContainText("2 foto");
    await expect(capo).toContainText("Bozza");

    await capo.getByRole("button", { name: "Pubblica" }).click();
    await expect(capo).toContainText("In vendita");
    await capo.getByRole("button", { name: "Venduto" }).click();
    await expect(capo).toContainText("Venduto");

    // resta dopo il ricaricamento (modalità prova = memoria del browser)
    await page.reload();
    await expect(page.locator("ul li").filter({ hasText: "Camicia a quadri blu" })).toBeVisible();

    page.once("dialog", (d) => d.accept());
    await page
      .locator("ul li")
      .filter({ hasText: "Camicia a quadri blu" })
      .getByRole("button", { name: "Elimina" })
      .click();
    await expect(page.getByText("Nessun capo ancora")).toBeVisible();
  });

  test("il link Vinted si modifica dal pannello", async ({ page }) => {
    await page.goto("/admin?prova=1");
    const campo = page.locator("#vinted");
    await expect(campo).toHaveValue(/vinted\.it\/member\/261904496/);
    await campo.fill("https://example.com/x");
    await page.getByRole("button", { name: "Salva il link" }).click();
    await expect(page.getByText(/inizia con https:\/\/www\.vinted\.it/)).toBeVisible();
    await campo.fill("https://www.vinted.it/member/1-prova");
    await page.getByRole("button", { name: "Salva il link" }).click();
    await expect(page.getByText("Salvato (solo in prova).")).toBeVisible();
  });

  test("la pagina non è indicizzabile e non è nel menu", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.goto("/");
    await expect(page.locator('header a[href*="admin"]')).toHaveCount(0);
    await expect(page.locator('footer a[href*="admin"]')).toHaveCount(0);
  });

  test("accessibilità del pannello", async ({ page }) => {
    await page.goto("/admin?prova=1");
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

  test("modifica un capo già pubblicato: nome, prezzo, taglia, foto", async ({ page }) => {
    await page.goto("/admin?prova=1");
    await page.locator("#foto").setInputFiles([await foto("a.jpg", "#a33"), await foto("b.jpg", "#3a3")]);
    await page.locator("#nome").fill("Capo nuovo di prova");
    await page.getByRole("button", { name: "M", exact: true }).click();
    await page.getByRole("button", { name: "30€" }).click();
    await page.getByRole("button", { name: "Salva come bozza" }).click();
    const capo = page.locator("ul li").filter({ hasText: "Capo nuovo di prova" });
    await capo.getByRole("button", { name: "Pubblica" }).click();
    await expect(capo).toContainText("In vendita");

    await capo.getByRole("button", { name: "Modifica" }).click();
    await capo.getByLabel("Nome").fill("Felpa zip bordeaux");
    await capo.getByLabel("Prezzo (€)").fill("40");
    await capo.getByRole("button", { name: "L", exact: true }).click();
    await capo.getByRole("button", { name: "Togli la foto 2" }).click();
    await capo.locator('input[type="file"]').setInputFiles([await foto("c.jpg", "#33a")]);
    await expect(capo.getByAltText("Foto 2")).toBeVisible();
    await capo.getByRole("button", { name: "Metti la foto 2 in copertina" }).click();
    await capo.getByRole("button", { name: "Salva modifiche" }).click();

    const dopo = page.locator("ul li").filter({ hasText: "Felpa zip bordeaux" });
    await expect(dopo).toContainText("40€");
    await expect(dopo).toContainText("taglia M / L");
    await expect(dopo).toContainText("2 foto");
    await expect(dopo).toContainText("In vendita");
    await page.reload();
    await expect(page.locator("ul li").filter({ hasText: "Felpa zip bordeaux" })).toBeVisible();
  });
});
