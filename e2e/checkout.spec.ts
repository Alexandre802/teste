import { test, expect } from '@playwright/test';
import {
  abrirSacola,
  adicionarPeloCardapio,
  avancarAte,
  bloquearExternos,
  capturarAberturas,
  preencherEndereco,
  semearSacola,
} from './apoio';

/**
 * O caminho que o cliente percorre, no navegador de verdade:
 *
 *   produto → sacola → entrega/retirada → identificação → endereço
 *           → pagamento → revisão → confirmação
 *
 * O que estes testes protegem, em uma frase: que ninguém consiga fechar uma
 * ENTREGA sem endereço, e que o que foi escolhido chegue inteiro no fim.
 */

test.describe('sacola', () => {
  test('adiciona, aumenta, diminui e esvazia', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    const dialogo = page.getByRole('dialog');

    // quantidade começa em 1
    await expect(dialogo.getByText('1', { exact: true }).first()).toBeVisible();

    await dialogo.getByRole('button', { name: /^Aumentar/ }).first().click();
    await expect(dialogo.getByText('2', { exact: true }).first()).toBeVisible();

    await dialogo.getByRole('button', { name: /^Diminuir/ }).first().click();
    await expect(dialogo.getByText('1', { exact: true }).first()).toBeVisible();

    // diminuir de 1 remove a linha — quantidade nunca fica negativa
    await dialogo.getByRole('button', { name: /^Diminuir/ }).first().click();
    await expect(dialogo.getByText('Sua sacola está vazia')).toBeVisible();
  });

  test('observação do item persiste ao reabrir a sacola', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    const dialogo = page.getByRole('dialog');

    await dialogo.getByRole('textbox', { name: /^Observação para/ }).first().fill('sem cebola');
    await page.getByRole('button', { name: 'Fechar' }).click();
    await abrirSacola(page);

    await expect(dialogo.getByRole('textbox', { name: /^Observação para/ }).first()).toHaveValue(
      'sem cebola',
    );
  });

  test('a sacola sobrevive ao recarregar a página', async ({ page }) => {
    // aqui o item entra pelo cardápio, não pela semente: a semente é
    // reescrita a cada navegação e o teste passaria sem provar nada
    await bloquearExternos(page);
    await page.goto('/');
    await adicionarPeloCardapio(page);
    await expect(page.getByRole('button', { name: /1 item/ })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: /1 item/ })).toBeVisible();
  });

  test('esvaziar limpa tudo', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await page.getByRole('dialog').getByRole('button', { name: 'Esvaziar sacola' }).click();
    await expect(page.getByText('Sua sacola está vazia')).toBeVisible();
  });
});

test.describe('entrega exige endereço', () => {
  test('não deixa passar sem rua, número e bairro', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'entrega');

    const dialogo = page.getByRole('dialog');
    await expect(dialogo.getByRole('heading', { name: 'Endereço de entrega' })).toBeVisible();

    // tenta seguir com tudo em branco
    await dialogo.getByRole('button', { name: 'Continuar para o pagamento' }).click();

    // continua na mesma tela, com erro em cada campo obrigatório
    await expect(dialogo.getByRole('heading', { name: 'Endereço de entrega' })).toBeVisible();
    await expect(dialogo.getByText('Informe a rua ou avenida.')).toBeVisible();
    await expect(dialogo.getByText(/Informe o número/)).toBeVisible();
    await expect(dialogo.getByText('Informe o bairro.')).toBeVisible();
  });

  test('com os três campos preenchidos, segue para o pagamento', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'entrega');

    const dialogo = page.getByRole('dialog');
    await preencherEndereco(page);
    await dialogo.getByRole('button', { name: 'Continuar para o pagamento' }).click();

    await expect(dialogo.getByRole('heading', { name: 'Pagamento' })).toBeVisible();
  });

  test('CEP incompleto barra, em branco passa', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'entrega');

    const dialogo = page.getByRole('dialog');
    await preencherEndereco(page, { cep: '123' });
    await dialogo.getByRole('button', { name: 'Continuar para o pagamento' }).click();
    await expect(dialogo.getByText(/O CEP tem 8 dígitos/)).toBeVisible();

    // formata sozinho quando completo
    await dialogo.getByLabel('CEP').fill('12325100');
    await expect(dialogo.getByLabel('CEP')).toHaveValue('12325-100');
    await dialogo.getByRole('button', { name: 'Continuar para o pagamento' }).click();
    await expect(dialogo.getByRole('heading', { name: 'Pagamento' })).toBeVisible();
  });

  test('o endereço fica salvo para o próximo pedido', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'entrega');

    const dialogo = page.getByRole('dialog');
    await dialogo.getByLabel('Rua ou avenida').fill('Rua Guardada');
    await dialogo.getByLabel('Número', { exact: true }).fill('77');
    await dialogo.getByLabel('Bairro').fill('Centro');

    await page.reload();
    await abrirSacola(page);
    await avancarAte(page, 'entrega');
    await expect(dialogo.getByLabel('Rua ou avenida')).toHaveValue('Rua Guardada');
  });
});

test.describe('retirada não pede endereço', () => {
  test('pula a tela de endereço inteira', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'retirada');

    const dialogo = page.getByRole('dialog');
    // vai direto ao pagamento; a tela de endereço não aparece em momento algum
    await expect(dialogo.getByRole('heading', { name: 'Pagamento' })).toBeVisible();
    await expect(dialogo.getByRole('heading', { name: 'Endereço de entrega' })).toHaveCount(0);
    await expect(dialogo.getByLabel('Rua ou avenida')).toHaveCount(0);
  });

  test('avisa que é retirada no local', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    const dialogo = page.getByRole('dialog');
    await dialogo.getByRole('button', { name: 'Continuar', exact: true }).click();
    await dialogo.getByRole('button', { name: /retirada/i }).click();
    await expect(dialogo.getByText('Retirada no local.')).toBeVisible();
  });
});

test.describe('formas de pagamento', () => {
  test('dinheiro pede troco e recusa valor menor que o total', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'retirada');

    const dialogo = page.getByRole('dialog');
    await dialogo.getByRole('button', { name: /^Dinheiro/ }).click();
    await expect(dialogo.getByText('Precisa de troco?')).toBeVisible();

    await dialogo.getByRole('button', { name: 'Sim', exact: true }).click();
    await dialogo.getByLabel('Troco para quanto?').fill('1');
    await dialogo.getByRole('button', { name: 'Revisar o pedido' }).click();

    // continua no pagamento, com o erro à vista
    await expect(dialogo.getByText(/precisa ser maior que o total/)).toBeVisible();
  });

  test('troco válido mostra quanto o entregador leva e segue para a revisão', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'retirada');

    const dialogo = page.getByRole('dialog');
    await dialogo.getByRole('button', { name: /^Dinheiro/ }).click();
    await dialogo.getByRole('button', { name: 'Sim', exact: true }).click();
    await dialogo.getByLabel('Troco para quanto?').fill('200');
    await expect(dialogo.getByText(/O entregador leva/)).toBeVisible();

    await dialogo.getByRole('button', { name: 'Revisar o pedido' }).click();
    await expect(dialogo.getByRole('heading', { name: 'Revise o pedido' })).toBeVisible();
    await expect(dialogo.getByText(/Troco para/)).toBeVisible();
  });

  test('Pix e cartão não mostram campo de troco', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'retirada');

    const dialogo = page.getByRole('dialog');
    for (const forma of ['Pix', 'Cartão']) {
      await dialogo.getByRole('button', { name: new RegExp(`^${forma}`) }).click();
      await expect(dialogo.getByText('Precisa de troco?')).toHaveCount(0);
    }
  });

  test('sem gateway configurado, não existe botão de pagar agora', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'retirada');

    const dialogo = page.getByRole('dialog');
    await dialogo.getByRole('button', { name: /^Pix/ }).click();

    // o ambiente de teste não tem MP_ACCESS_TOKEN: a opção some e o site
    // explica, em vez de oferecer um pagamento que não cobra
    await expect(dialogo.getByRole('button', { name: 'Pagar agora' })).toHaveCount(0);
    await expect(dialogo.getByText(/pagamento online ainda não está disponível/i)).toBeVisible();
    // e em lugar nenhum aparece "modo demonstração" para o cliente
    await expect(dialogo.getByText(/demonstração/i)).toHaveCount(0);
  });
});

test.describe('revisão', () => {
  test('mostra endereço, pagamento e cliente antes de enviar', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'entrega');

    const dialogo = page.getByRole('dialog');
    await preencherEndereco(page, { complemento: 'Casa 2' });
    await dialogo.getByRole('button', { name: 'Continuar para o pagamento' }).click();
    await dialogo.getByRole('button', { name: /^Dinheiro/ }).click();
    await dialogo.getByRole('button', { name: 'Revisar o pedido' }).click();

    await expect(dialogo.getByText('Endereço: Rua das Palmeiras, 245')).toBeVisible();
    await expect(dialogo.getByText('Complemento: Casa 2')).toBeVisible();
    await expect(dialogo.getByText('Bairro: Jardim Califórnia')).toBeVisible();
    await expect(dialogo.getByText('Ana Teste')).toBeVisible();
    await expect(dialogo.getByText('Dinheiro', { exact: true })).toBeVisible();
    await expect(dialogo.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ })).toBeVisible();
  });

  test('a retirada mostra "sem endereço" na revisão', async ({ page }) => {
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'retirada');

    const dialogo = page.getByRole('dialog');
    await dialogo.getByRole('button', { name: 'Revisar o pedido' }).click();
    await expect(dialogo.getByText(/nenhum endereço de entrega é necessário/i)).toBeVisible();
  });
});

test.describe('envio e confirmação', () => {
  test('abre o WhatsApp com o pedido completo e confirma na tela', async ({ page }) => {
    const aberturas = await capturarAberturas(page);
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'entrega');

    const dialogo = page.getByRole('dialog');
    await preencherEndereco(page);
    await dialogo.getByRole('button', { name: 'Continuar para o pagamento' }).click();
    await dialogo.getByRole('button', { name: /^Dinheiro/ }).click();
    await dialogo.getByRole('button', { name: 'Sim', exact: true }).click();
    await dialogo.getByLabel('Troco para quanto?').fill('200');
    await dialogo.getByRole('button', { name: 'Revisar o pedido' }).click();
    await dialogo.getByRole('textbox', { name: /observação para a casa/i }).fill('campainha');

    await dialogo.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ }).click();

    const [aberta] = await aberturas();
    const destino = decodeURIComponent(aberta);
    expect(destino).toContain('wa.me/5512988447711');
    expect(destino).toContain('Endereço: Rua das Palmeiras, 245');
    expect(destino).toContain('Bairro: Jardim Califórnia');
    expect(destino).toContain('Pagamento: Dinheiro');
    expect(destino).toContain('Troco para:');
    expect(destino).toContain('Cliente: Ana Teste');
    expect(destino).toContain('campainha');

    // tela de confirmação, com número do pedido
    await expect(dialogo.getByRole('heading', { name: 'Deu tudo certo' })).toBeVisible();
    await expect(dialogo.getByText(/Pedido nº/)).toBeVisible();
    await expect(dialogo.getByRole('link', { name: /Abrir a conversa de novo/ })).toBeVisible();
  });

  test('a retirada não manda endereço no link do WhatsApp', async ({ page }) => {
    const aberturas = await capturarAberturas(page);
    await semearSacola(page);
    await abrirSacola(page);
    await avancarAte(page, 'retirada');

    const dialogo = page.getByRole('dialog');
    await dialogo.getByRole('button', { name: /^Pix/ }).click();
    await dialogo.getByRole('button', { name: 'Revisar o pedido' }).click();

    await dialogo.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ }).click();

    const [aberta] = await aberturas();
    const destino = decodeURIComponent(aberta);
    expect(destino).toContain('Tipo: Retirada');
    expect(destino).toContain('Retirada no local');
    expect(destino).toContain('Pagamento: Pix');
    expect(destino).not.toContain('Bairro:');
    expect(destino).not.toContain('CEP:');
  });
});
