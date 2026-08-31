import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta.
 *
 * Rodam contra o BUILD DE PRODUÇÃO (`next build` + `next start`), não contra
 * o servidor de desenvolvimento: é a versão de produção que vai para o ar, e
 * ela difere do dev em coisas que quebram pedido — cabeçalhos, CSP com nonce
 * e as rotas que se desligam sozinhas sem credencial configurada.
 *
 *   npm run test:e2e            tudo
 *   npm run test:e2e -- --ui    modo interativo
 *
 * O Chromium já vem instalado na imagem, num build que pode não ser o que
 * esta versão do @playwright/test baixaria. Por isso o binário é apontado
 * explicitamente por `CHROMIUM` quando ele existe: assim os testes rodam sem
 * `playwright install` e sem depender de rede. Em máquina onde o caminho não
 * existe, o Playwright usa o navegador que ele mesmo instalou.
 */

import { existsSync } from 'node:fs';

/** Chromium pré-instalado na imagem, quando houver. */
const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const executablePath = existsSync(CHROMIUM) ? CHROMIUM : undefined;

const PORTA = Number(process.env.E2E_PORT ?? 3399);
const BASE = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORTA}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    // O site anima bastante no scroll (o lanche do hero abre conforme rola).
    // Com o movimento ligado, o contexto de execução da página é destruído no
    // meio de um clique e o teste falha por motivo que não é bug do produto.
    // O site respeita `prefers-reduced-motion`, então isto também exercita
    // esse caminho — que é o que quem tem sensibilidade a movimento recebe.
    contextOptions: { reducedMotion: 'reduce' },
  },

  projects: [
    // O celular é a prioridade do projeto, então vem primeiro: se algo só
    // quebra no telefone, quebra no primeiro projeto da lista.
    {
      name: 'celular',
      use: { ...devices['Pixel 7'], locale: 'pt-BR', launchOptions: { executablePath } },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        locale: 'pt-BR',
        launchOptions: { executablePath },
      },
    },
  ],

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${PORTA}`,
        url: BASE,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
