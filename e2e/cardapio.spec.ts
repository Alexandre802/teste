import { test, expect } from '@playwright/test';
import { adicionarPeloCardapio, bloquearExternos } from './apoio';

test.beforeEach(async ({ page }) => {
  await bloquearExternos(page);
});

/**
 * O cardápio e o caminho real até a sacola.
 *
 * Este arquivo cobre o que os testes de checkout deixam de fora ao semear a
 * sacola direto no armazenamento: que o botão "Adicionar" do cardápio de fato
 * põe o item lá.
 */

test('a página abre com o cardápio e as categorias', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Michel Food House/);
  await expect(page.getByRole('heading', { name: /Michel/i }).first()).toBeVisible();

  // as abas de categoria do cardápio
  for (const categoria of ['Tradicionais', 'Beirutes', 'Bebidas']) {
    await expect(page.getByRole('tab', { name: categoria, exact: true }).first()).toBeVisible();
  }
});

test('clicar em Adicionar põe o item na sacola', async ({ page }) => {
  await page.goto('/');
  // sem item, o botão flutuante não existe
  await expect(page.getByRole('button', { name: /Sua sacola/ })).toHaveCount(0);

  const sacola = await adicionarPeloCardapio(page);
  await expect(sacola).toContainText('1 item');
});

test('trocar de categoria troca os produtos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Bebidas', exact: true }).first().click();
  await expect(page.getByText(/Coca-Cola/i).first()).toBeVisible();
});

test('produto indisponível não pode ser adicionado', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Bebidas', exact: true }).first().click();
  const indisponivel = page.getByRole('button', { name: 'Indisponível' }).first();
  // o catálogo tem sucos marcados como indisponíveis
  await expect(indisponivel).toBeDisabled();
});
