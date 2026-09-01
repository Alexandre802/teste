import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

/**
 * Suíte do MD_agenda.
 *
 * Roda contra o build de produção com o banco local ligado — o mesmo código
 * de servidor que atende o Supabase, com outro armazenamento por trás. Um
 * worker só, porque os cenários compartilham o estado do servidor.
 */
const PORT = Number(process.env.PORT ?? 3210)
const BASE_URL = `http://127.0.0.1:${PORT}`

/** Chromium do próprio ambiente, quando existe. */
const CHROMIUM_PATH = existsSync('/opt/pw-browsers/chromium')
  ? '/opt/pw-browsers/chromium'
  : undefined

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    // O ambiente de CI já traz o Chromium; sem apontar o executável, o
    // Playwright procura um build que ele mesmo baixaria.
    launchOptions: CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : undefined,
    trace: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },

  projects: [
    {
      name: 'celular',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],

  webServer: {
    command: `npx next start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      MD_AGENDA_LOCAL_STORE: '1',
      MD_AGENDA_LOCAL_STORE_TOKEN: 'suite-md-agenda',
      MD_AGENDA_LOCAL_ADMIN_EMAIL: 'maicon@exemplo.test',
      MD_AGENDA_LOCAL_ADMIN_PASSWORD: 'senha-de-teste-md',
      MD_AGENDA_LOCAL_ADMIN_SECRET: 'segredo-apenas-da-suite',
      NEXT_PUBLIC_SITE_URL: BASE_URL,
      MAICON_WHATSAPP_NUMBER: '5512999999999',
    },
  },
})
