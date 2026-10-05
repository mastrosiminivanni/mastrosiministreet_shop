import { defineConfig } from "@playwright/test";

// Test del percorso principale su telefono. Avvia da solo il sito in locale (porta 3100).
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3100",
    viewport: { width: 390, height: 844 },
    // Chromium senza scheda grafica: si usa il rendering software, sufficiente per verificare che la scena parta
    launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  webServer: { command: "npm run dev -- -p 3100", url: "http://localhost:3100", reuseExistingServer: true, timeout: 120_000 },
});
