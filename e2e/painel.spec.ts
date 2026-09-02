import { expect, test } from '@playwright/test';
import { bloquearExternos } from './apoio';

/**
 * O painel administrativo, do lado de fora.
 *
 * O ambiente de teste não tem Supabase configurado — e é justamente esse o
 * estado que estes testes cobrem: sem banco, o painel precisa dizer o que
 * falta em português claro, em vez de mostrar uma tela de números zerados que
 * é indistinguível de "hoje não vendi nada".
 *
 * O acesso com sessão real depende de um projeto Supabase e de um usuário
 * ligado à casa; a garantia de que o cliente não lê nada do caixa está testada
 * no banco, em supabase/tests/01_fluxo.sql.
 */

test.describe('painel sem banco configurado', () => {
  test('a tela diz o que falta, em vez de fingir que está funcionando', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/admin');

    await expect(
      page.getByRole('heading', { name: /Fluxo de caixa não configurado/ }),
    ).toBeVisible();
    await expect(page.getByText(/NEXT_PUBLIC_SUPABASE_URL/)).toBeVisible();
    // e avisa que o site de pedidos continua de pé
    await expect(page.getByText(/site de pedidos continua funcionando/)).toBeVisible();
  });

  test('o login existe, mostra o aviso e não deixa tentar entrar', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/admin/login');

    await expect(page.getByRole('heading', { name: 'COMIDA CASEIRA' })).toBeVisible();
    await expect(page.getByText('Painel administrativo')).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();

    // sem banco, entrar não é uma função de verdade — então fica desligada
    await expect(page.getByRole('button', { name: 'ENTRAR' })).toBeDisabled();
  });

  test('o botão de mostrar senha funciona', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/admin/login');

    const senha = page.getByLabel('Senha', { exact: true });
    await senha.fill('minha-senha');
    await expect(senha).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: 'Mostrar senha' }).click();
    await expect(senha).toHaveAttribute('type', 'text');

    await page.getByRole('button', { name: 'Ocultar senha' }).click();
    await expect(senha).toHaveAttribute('type', 'password');
  });

  test('não há criação pública de conta administrativa', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/admin/login');

    // nenhum caminho para criar conta, nem "entrar com" que não verifica nada
    await expect(page.getByRole('button', { name: /criar conta|cadastr/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Google|Facebook/i })).toHaveCount(0);
    await expect(page.getByText(/Não há cadastro público/)).toBeVisible();
  });
});

test.describe('o painel fica fora dos buscadores', () => {
  test('robots.txt bloqueia /admin', async ({ request }) => {
    const resposta = await request.get('/robots.txt');
    expect(resposta.ok()).toBe(true);
    expect(await resposta.text()).toContain('Disallow: /admin');
  });

  test('a própria página manda noindex', async ({ page }) => {
    await bloquearExternos(page);
    await page.goto('/admin/login');
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /noindex/);
  });
});

test.describe('rota de registro do pedido', () => {
  test('sem banco, responde que não está configurada — e não finge ter gravado', async ({
    request,
  }) => {
    const get = await request.get('/api/pedido/registrar');
    expect(get.ok()).toBe(true);
    expect(await get.json()).toEqual({ configurado: false });

    const post = await request.post('/api/pedido/registrar', {
      data: { checkoutToken: 'tok', lines: [{ productId: 'x-bacon', qty: 1 }], mode: 'retirada' },
    });
    expect(post.ok()).toBe(true);
    const corpo = await post.json();
    expect(corpo.configurado).toBe(false);
    // nada de número de pedido inventado
    expect(corpo.orderNumber).toBeUndefined();
  });
});
