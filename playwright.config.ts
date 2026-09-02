import { defineConfig, devices } from "@playwright/test";

/**
 * Testes de ponta a ponta em celular e desktop.
 * `pretest:e2e` constroi o site antes; aqui rodamos o servidor de producao.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [["list"]],
  outputDir: "./test-results",
  timeout: 45_000,
  use: {
    baseURL: "http://127.0.0.1:3100",
    // Em ambientes que ja tem o Chromium instalado fora do Playwright, aponte
    // PLAYWRIGHT_CHROMIUM_PATH para o executavel. Vazio = comportamento padrao.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
    trace: "on-first-retry",
    locale: "pt-BR",
  },
  projects: [
    // Chromium em viewport de celular: e o navegador disponivel no ambiente.
    { name: "celular", use: { ...devices["Pixel 7"] } },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: "npx next start -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_WHATSAPP: process.env.NEXT_PUBLIC_WHATSAPP ?? "",
    },
  },
});
