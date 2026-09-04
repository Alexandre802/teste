import { expect, test } from '@playwright/test';
import { siteConfig } from '../lib/site-config';

test('a página não rola de lado e não solta erro no console', async ({ page }) => {
  const erros: string[] = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') erros.push(m.text());
  });

  await page.goto('/');
  await page.waitForTimeout(2500);

  for (const id of ['inicio', 'imoveis', 'sobre', 'localizacao']) {
    await page.evaluate((alvo) => document.getElementById(alvo)!.scrollIntoView(), id);
    await page.waitForTimeout(700);

    const { scrollW, clientW } = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(scrollW, `seção #${id} vazou na horizontal`).toBeLessThanOrEqual(clientW + 1);
  }

  expect(erros).toEqual([]);
});

test('as quatro seções e o rodapé aparecem, na ordem combinada', async ({ page }) => {
  await page.goto('/');

  const ordem = await page.evaluate(() =>
    ['inicio', 'imoveis', 'sobre', 'localizacao'].map(
      (id) => document.getElementById(id)!.getBoundingClientRect().top + window.scrollY,
    ),
  );

  expect(ordem).toEqual([...ordem].sort((a, b) => a - b));
  await expect(page.locator('footer')).toBeAttached();
});

test('os contatos saem todos do site-config', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.getElementById('localizacao')!.scrollIntoView());
  await page.waitForTimeout(500);

  await expect(page.getByRole('link', { name: /Falar no WhatsApp/ }).first()).toHaveAttribute(
    'href',
    new RegExp(`^https://wa\\.me/${siteConfig.whatsapp}\\?text=`),
  );
  await expect(page.getByRole('link', { name: siteConfig.phoneExibicao })).toHaveAttribute(
    'href',
    `tel:${siteConfig.phone}`,
  );
  await expect(page.getByRole('link', { name: siteConfig.email })).toHaveAttribute(
    'href',
    `mailto:${siteConfig.email}`,
  );
  await expect(page.getByText(siteConfig.address.linha1).first()).toBeVisible();
});

test('o demonstrativo fica fora dos buscadores', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    'content',
    /noindex/,
  );
});
