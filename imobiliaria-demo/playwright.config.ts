import { defineConfig } from '@playwright/test';

const PORTA = 3210;

/**
 * Escape hatch para ambientes (CI, contêiner) que já trazem um Chromium
 * instalado fora do diretório do Playwright. Vazio na máquina do dia a dia,
 * onde vale o `npx playwright install chromium`.
 */
const chromiumDoAmbiente = process.env.PLAYWRIGHT_CHROMIUM_PATH;

/**
 * Os cinco tamanhos exigidos no briefing. O hero depende da altura da
 * viewport (é ela que divide o scroll em quadros), então cada tamanho roda
 * a suíte inteira.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${PORTA}`,
    trace: 'retain-on-failure',
    browserName: 'chromium',
    ...(chromiumDoAmbiente ? { launchOptions: { executablePath: chromiumDoAmbiente } } : {}),
  },
  projects: [
    { name: 'iphone-390', use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 'iphone-430', use: { viewport: { width: 430, height: 932 }, hasTouch: true } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'notebook-1440', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'monitor-1920', use: { viewport: { width: 1920, height: 1080 } } },
  ],
  webServer: {
    command: `npx next start -p ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
