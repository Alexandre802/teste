import { expect, test } from '@playwright/test';

const cartoes = (page: import('@playwright/test').Page) => page.locator('#imoveis article');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.getElementById('imoveis')!.scrollIntoView());
  await page.waitForTimeout(700);
});

test('as categorias filtram de verdade', async ({ page }) => {
  await expect(cartoes(page)).toHaveCount(6);

  await page.getByRole('button', { name: 'Alto padrão' }).click();
  await expect(cartoes(page)).toHaveCount(4);

  await page.getByRole('button', { name: 'Piscina', exact: true }).click();
  await expect(cartoes(page)).toHaveCount(6);

  await page.getByRole('button', { name: 'Casas' }).click();
  await expect(cartoes(page)).toHaveCount(6);
});

test('a categoria sem acervo diz a verdade em vez de fingir', async ({ page }) => {
  await page.getByRole('button', { name: 'Apartamentos' }).click();

  await expect(cartoes(page)).toHaveCount(0);
  await expect(page.getByText('apenas casas', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'Ver todos os imóveis' }).click();
  await expect(cartoes(page)).toHaveCount(6);
});

test('a busca acha por nome, cidade e estado, com ou sem acento', async ({ page }) => {
  const campo = page.locator('#busca-imoveis');

  await campo.fill('mirante');
  await expect(cartoes(page)).toHaveCount(1);

  await campo.fill('sao sebastiao');
  await expect(cartoes(page)).toHaveCount(2);

  await campo.fill('RJ');
  await expect(cartoes(page)).toHaveCount(2);

  await campo.fill('não existe');
  await expect(cartoes(page)).toHaveCount(0);

  await campo.fill('');
  await expect(cartoes(page)).toHaveCount(6);
});

test('o painel de filtros ordena e recorta a lista', async ({ page }) => {
  const filtrar = page.getByRole('button', { name: 'Filtrar imóveis' });
  await expect(filtrar).toHaveAttribute('aria-expanded', 'false');

  await filtrar.click();
  await expect(filtrar).toHaveAttribute('aria-expanded', 'true');

  await page.getByRole('button', { name: '5 ou mais' }).click();
  await expect(cartoes(page)).toHaveCount(1);

  await page.getByRole('button', { name: 'Qualquer', exact: true }).click();
  await page.getByRole('button', { name: 'Até R$ 6 milhões' }).click();
  await expect(cartoes(page)).toHaveCount(1);

  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(cartoes(page)).toHaveCount(6);

  await page.getByRole('button', { name: 'Maior preço' }).click();
  await expect(cartoes(page).first().locator('h3')).toHaveText('Casa do Mirante');

  await page.getByRole('button', { name: 'Menor preço' }).click();
  await expect(cartoes(page).first().locator('h3')).toHaveText('Refúgio da Serra');
});

test('favoritar muda o estado do coração', async ({ page }) => {
  const salvar = page.getByRole('button', { name: /Salvar Casa da Mata/ });
  await expect(salvar).toHaveAttribute('aria-pressed', 'false');

  await salvar.click();

  const remover = page.getByRole('button', { name: /Remover Casa da Mata/ });
  await expect(remover).toHaveAttribute('aria-pressed', 'true');
});

test('cada imóvel tem foto própria, nenhuma repetida', async ({ page }) => {
  const fontes = await cartoes(page)
    .locator('img')
    .evaluateAll((imagens) =>
      imagens.map((img) => new URL((img as HTMLImageElement).src).searchParams.get('url')),
    );

  expect(fontes).toHaveLength(6);
  expect(new Set(fontes).size).toBe(6);
});
