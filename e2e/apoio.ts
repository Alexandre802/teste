import { expect, type Page } from '@playwright/test';

/**
 * Apoio comum dos testes.
 *
 * Duas coisas moram aqui porque valem para todo teste de navegador:
 *
 *  1. Bloquear requisição para fora. A seção de contato embute o mapa do
 *     Google; em ambiente de teste esse pedido pode ficar pendurado e a
 *     página nunca termina de carregar, fazendo o teste falhar por rede e não
 *     por bug. Cortar o que é externo deixa o teste rápido e determinístico.
 *
 *  2. Semear a sacola pelo armazenamento local, para os testes de checkout
 *     começarem já com item, sem repetir o caminho do cardápio a cada vez.
 */

export interface ItemSemeado {
  productId: string;
  qty: number;
  note: string;
}

/**
 * Corta tudo que não for do próprio site: mapa, fontes, qualquer terceiro.
 *
 * Responde vazio em vez de abortar. Abortar o pedido do iframe do mapa
 * desanexa o frame no meio da navegação, e um `page.reload()` seguinte morre
 * com ERR_ABORTED — falha do teste que não tem nada a ver com o produto.
 */
export async function bloquearExternos(page: Page) {
  await page.route('**/*', (rota) => {
    const url = new URL(rota.request().url());
    const local = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
    return local ? rota.continue() : rota.fulfill({ status: 204, body: '' });
  });
}

/**
 * Registra os `window.open` da página em vez de deixar o navegador abri-los.
 *
 * O deeplink do pedido aponta para wa.me. Deixar a aba abrir de verdade faz o
 * teste depender de acessar o WhatsApp pela rede — que numa máquina de CI
 * costuma estar bloqueada, e aí a aba vira uma página de erro e o teste falha
 * sem que nada no site esteja errado. Guardando a URL, dá para conferir o
 * conteúdo exato da mensagem sem sair do lugar.
 *
 * Precisa ser chamado ANTES de `page.goto`.
 */
export async function capturarAberturas(page: Page) {
  await page.addInitScript(() => {
    const registro: string[] = [];
    Object.defineProperty(window, '__aberturas', { value: registro, writable: false });
    window.open = (url?: string | URL) => {
      registro.push(String(url ?? ''));
      return null;
    };
  });
  return () =>
    page.evaluate(() => (window as unknown as { __aberturas: string[] }).__aberturas ?? []);
}

/**
 * Põe itens na sacola antes de a página abrir.
 *
 * A chave e o formato são os do zustand/persist de lib/store.ts — se aquele
 * `name` ou a `version` mudarem, isto muda junto.
 */
export async function semearSacola(
  page: Page,
  itens: ItemSemeado[] = [{ productId: 'x-bacon', qty: 1, note: '' }],
) {
  await bloquearExternos(page);
  await page.addInitScript(
    ([chave, estado]) => {
      // só semeia se ainda não houver nada: assim um `page.reload()` no meio
      // do teste não apaga o que o cliente digitou, e a persistência de
      // verdade fica testável
      if (!window.localStorage.getItem(chave as string)) {
        window.localStorage.setItem(chave as string, estado as string);
      }
    },
    [
      'mfh-shop-v1',
      JSON.stringify({
        state: {
          lines: itens,
          customer: null,
          history: [],
          address: { rua: '', numero: '', bairro: '', complemento: '', referencia: '', cep: '' },
        },
        version: 2,
      }),
    ],
  );
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Sua sacola/ })).toBeVisible();
}

/**
 * Clica em "Adicionar" no cardápio até o item realmente entrar na sacola.
 *
 * A repetição não é gambiarra, é o que o teste precisa dizer: o botão só
 * funciona depois que o React assume a página. Um clique disparado antes da
 * hidratação não vira nada — some sem erro nenhum. Numa máquina carregada
 * essa janela chega a alguns segundos, e sem esperar por ela o teste falha
 * por lentidão do ambiente, não por defeito do site.
 */
export async function adicionarPeloCardapio(page: Page) {
  const botao = page.getByRole('button', { name: 'Adicionar' }).first();
  const sacola = page.getByRole('button', { name: /Sua sacola/ });

  await expect(async () => {
    await botao.click();
    await expect(sacola).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });

  return sacola;
}

export async function abrirSacola(page: Page) {
  await page.getByRole('button', { name: /Sua sacola/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

/**
 * Da sacola até a tela seguinte à identificação, entrando como convidado.
 *
 * Cliente já identificado pula o passo de login — é o comportamento do site
 * para quem volta. O helper detecta isso em vez de insistir num botão que
 * não vai aparecer.
 */
export async function avancarAte(page: Page, modo: 'entrega' | 'retirada') {
  const dialogo = page.getByRole('dialog');
  await dialogo.getByRole('button', { name: 'Continuar', exact: true }).click();

  await dialogo.getByRole('button', { name: new RegExp(modo, 'i') }).click();
  await dialogo.getByRole('button', { name: 'Continuar', exact: true }).click();

  const convidado = dialogo.getByRole('button', { name: 'Continuar como convidado' }).first();
  if (await convidado.isVisible().catch(() => false)) {
    await convidado.click();
    await dialogo.getByRole('textbox', { name: 'Seu nome' }).fill('Ana Teste');
    await dialogo.getByRole('textbox', { name: /Telefone/ }).fill('12991234567');
    await dialogo.getByRole('button', { name: 'Continuar como convidado' }).click();
  }
}

/** Preenche o endereço mínimo válido e segue. */
export async function preencherEndereco(
  page: Page,
  extra: { complemento?: string; referencia?: string; cep?: string } = {},
) {
  const dialogo = page.getByRole('dialog');
  await dialogo.getByLabel('Rua ou avenida').fill('Rua das Palmeiras');
  await dialogo.getByLabel('Número', { exact: true }).fill('245');
  await dialogo.getByLabel('Bairro').fill('Jardim Califórnia');
  if (extra.complemento) await dialogo.getByLabel('Complemento').fill(extra.complemento);
  if (extra.referencia) await dialogo.getByLabel('Ponto de referência').fill(extra.referencia);
  if (extra.cep) await dialogo.getByLabel('CEP').fill(extra.cep);
}
