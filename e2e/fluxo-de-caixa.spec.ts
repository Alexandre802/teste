import { expect, test } from '@playwright/test';
import { buildOrderMessage } from '../lib/whatsapp';
import {
  abrirSacola,
  avancarAte,
  capturarAberturas,
  preencherEndereco,
  semearSacola,
} from './apoio';

/**
 * O que estes testes protegem.
 *
 * O pedido do site precisa ser REGISTRADO no fluxo de caixa antes de o
 * WhatsApp abrir. A parte perigosa não é o caminho feliz — é o que acontece
 * quando o banco recusa: ali o site não pode abrir o WhatsApp como se tivesse
 * dado tudo certo, porque o cliente sairia achando que o pedido existe em
 * algum lugar quando não existe.
 *
 * O ambiente de teste não tem Supabase configurado. Em vez de exigir um banco,
 * os testes interceptam `/api/pedido/registrar` e simulam as três respostas
 * possíveis: sem fluxo de caixa, gravado, e falha.
 */

/**
 * Faz o site acreditar que existe fluxo de caixa e controla o que ele responde.
 *
 * Recarrega no fim de propósito: a gaveta pergunta ao servidor, ao montar, se
 * existe fluxo de caixa. Essa pergunta já saiu quando a página abriu — antes
 * de esta simulação estar de pé. Sem o recarregamento, o site continuaria com
 * a resposta verdadeira ("não há caixa") e o teste mediria a coisa errada.
 *
 * A sacola sobrevive: ela mora no armazenamento local.
 */
async function simularCaixa(
  page: import('@playwright/test').Page,
  aoRegistrar: (rota: import('@playwright/test').Route) => Promise<void> | void,
) {
  await page.route('**/api/pedido/registrar', async (rota) => {
    if (rota.request().method() === 'GET') {
      await rota.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ configurado: true }),
      });
      return;
    }
    await aoRegistrar(rota);
  });

  await page.reload();
  await expect(page.getByRole('button', { name: /Sua sacola/ })).toBeVisible();
}

/** Da sacola até o botão de enviar, na entrega, pagando em dinheiro. */
async function irAteOEnvio(page: import('@playwright/test').Page) {
  await abrirSacola(page);
  await avancarAte(page, 'entrega');
  const dialogo = page.getByRole('dialog');
  await preencherEndereco(page);
  await dialogo.getByRole('button', { name: 'Continuar para o pagamento' }).click();
  await dialogo.getByRole('button', { name: /^Dinheiro/ }).click();
  await dialogo.getByRole('button', { name: 'Revisar o pedido' }).click();
  return dialogo;
}

test.describe('registro do pedido no fluxo de caixa', () => {
  test('o pedido é gravado ANTES de o WhatsApp abrir, e o número vai na mensagem', async ({
    page,
  }) => {
    const aberturas = await capturarAberturas(page);

    const enviados: unknown[] = [];
    await semearSacola(page);
    await simularCaixa(page, async (rota) => {
      enviados.push(rota.request().postDataJSON());
      await rota.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          configurado: true,
          orderId: 'id-de-teste',
          orderNumber: 3287,
          subtotalCents: 5000,
          deliveryFeeCents: 500,
          totalCents: 5500,
          duplicado: false,
        }),
      });
    });

    const dialogo = await irAteOEnvio(page);
    await dialogo.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ }).click();

    // gravou primeiro
    expect(enviados).toHaveLength(1);
    const corpo = enviados[0] as { checkoutToken: string; lines: unknown[]; mode: string };
    expect(corpo.checkoutToken).toBeTruthy();
    expect(corpo.mode).toBe('entrega');
    expect(corpo.lines).toHaveLength(1);

    // e só então abriu o WhatsApp, com o número do pedido em cima
    const [aberta] = await aberturas();
    expect(decodeURIComponent(aberta)).toContain('*PEDIDO #3287*');

    await expect(dialogo.getByText('PEDIDO #3287')).toBeVisible();
  });

  test('banco fora do ar NÃO abre o WhatsApp, e diz o que aconteceu', async ({ page }) => {
    const aberturas = await capturarAberturas(page);

    await semearSacola(page);
    await simularCaixa(page, (rota) =>
      rota.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ erro: 'Não foi possível registrar seu pedido. Tente novamente.' }),
      }),
    );

    const dialogo = await irAteOEnvio(page);
    await dialogo.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ }).click();

    await expect(dialogo.getByText(/Não foi possível registrar seu pedido/)).toBeVisible();

    // o pedido não pode sair como se estivesse tudo certo
    expect(await aberturas()).toHaveLength(0);
    await expect(dialogo.getByRole('heading', { name: 'Deu tudo certo' })).toBeHidden();

    // e a sacola continua intacta, para tentar de novo
    await expect(dialogo.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ })).toBeEnabled();
  });

  test('sem fluxo de caixa configurado, o site segue pelo WhatsApp como sempre', async ({
    page,
  }) => {
    const aberturas = await capturarAberturas(page);

    let houvePost = false;
    await semearSacola(page);
    await page.route('**/api/pedido/registrar', async (rota) => {
      if (rota.request().method() === 'POST') houvePost = true;
      await rota.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ configurado: false }),
      });
    });
    await page.reload();
    await expect(page.getByRole('button', { name: /Sua sacola/ })).toBeVisible();

    const dialogo = await irAteOEnvio(page);
    await dialogo.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ }).click();

    const [aberta] = await aberturas();
    expect(decodeURIComponent(aberta)).toContain('Total:');
    // nada de "#undefined" na conversa quando não há número
    expect(decodeURIComponent(aberta)).not.toContain('PEDIDO #');
    expect(houvePost).toBe(false);

    await expect(dialogo.getByRole('heading', { name: 'Deu tudo certo' })).toBeVisible();
  });

  test('dois toques em enviar usam o mesmo token — um pedido, não dois', async ({ page }) => {
    await capturarAberturas(page);

    const tokens: string[] = [];
    await semearSacola(page);
    await simularCaixa(page, async (rota) => {
      const corpo = rota.request().postDataJSON() as { checkoutToken: string };
      tokens.push(corpo.checkoutToken);
      // demora de propósito: é a janela em que o segundo toque acontece
      await new Promise((r) => setTimeout(r, 600));
      await rota.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ configurado: true, orderNumber: 1, duplicado: tokens.length > 1 }),
      });
    });

    const dialogo = await irAteOEnvio(page);
    await dialogo.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ }).click();

    // enquanto envia, o botão vira "Enviando…" e fica desabilitado — o
    // segundo toque não chega a virar um segundo pedido
    const enviando = dialogo.getByRole('button', { name: 'Enviando…' });
    await expect(enviando).toBeVisible();
    await expect(enviando).toBeDisabled();
    await enviando.click({ force: true }).catch(() => {
      /* botão desabilitado não dispara clique: é exatamente o que se espera */
    });

    await expect(dialogo.getByRole('heading', { name: 'Deu tudo certo' })).toBeVisible();
    expect(tokens).toHaveLength(1);
  });

  test('tentar de novo depois de uma falha reaproveita o mesmo token', async ({ page }) => {
    await capturarAberturas(page);

    const tokens: string[] = [];
    let falharAgora = true;

    await semearSacola(page);
    await simularCaixa(page, async (rota) => {
      tokens.push((rota.request().postDataJSON() as { checkoutToken: string }).checkoutToken);

      if (falharAgora) {
        falharAgora = false;
        await rota.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ erro: 'Não foi possível registrar seu pedido. Tente novamente.' }),
        });
        return;
      }

      await rota.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ configurado: true, orderNumber: 7, duplicado: true }),
      });
    });

    const dialogo = await irAteOEnvio(page);
    const enviar = dialogo.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ });

    await enviar.click();
    await expect(dialogo.getByText(/Não foi possível registrar seu pedido/)).toBeVisible();

    await enviar.click();
    await expect(dialogo.getByRole('heading', { name: 'Deu tudo certo' })).toBeVisible();

    // Mesmo conteúdo de sacola, mesmo token: se a primeira tentativa tiver
    // gravado no banco antes de a resposta se perder, a segunda recebe aquele
    // pedido de volta em vez de criar um novo.
    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toBe(tokens[1]);
  });

  test('mexer na sacola troca o token — pedido diferente, não o antigo', async ({ page }) => {
    await capturarAberturas(page);

    const tokens: string[] = [];
    await semearSacola(page);
    await simularCaixa(page, async (rota) => {
      tokens.push((rota.request().postDataJSON() as { checkoutToken: string }).checkoutToken);
      await rota.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ erro: 'Não foi possível registrar seu pedido. Tente novamente.' }),
      });
    });

    const dialogo = await irAteOEnvio(page);
    const enviar = dialogo.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ });

    await enviar.click();
    await expect(dialogo.getByText(/Não foi possível registrar seu pedido/)).toBeVisible();

    // volta e escreve uma observação: o pedido não é mais o mesmo
    await dialogo.getByRole('textbox', { name: /observação para a casa/i }).fill('sem cebola');
    await enviar.click();
    await expect(dialogo.getByText(/Não foi possível registrar seu pedido/)).toBeVisible();

    expect(tokens).toHaveLength(2);
    expect(tokens[0]).not.toBe(tokens[1]);
  });
});

test.describe('mensagem com número do pedido', () => {
  const ITENS = [{ productId: 'x-bacon', qty: 2, note: '' }];

  test('o número entra em negrito, na primeira linha', () => {
    const msg = buildOrderMessage({ lines: ITENS, mode: 'retirada', orderNumber: 42 });
    expect(msg.split('\n')[0]).toBe('*PEDIDO #42*');
  });

  test('sem número, a mensagem sai exatamente como antes', () => {
    const msg = buildOrderMessage({ lines: ITENS, mode: 'retirada' });
    expect(msg).not.toContain('PEDIDO #');
    expect(msg.split('\n')[0]).toContain('Gostaria de fazer um pedido');
  });
});
