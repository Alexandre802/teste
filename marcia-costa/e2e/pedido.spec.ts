import { expect, test } from "@playwright/test";

import { categoriasComProduto, produtosDisponiveis } from "../data/menu";
import { formatarPreco } from "../lib/format";

/**
 * O cardápio oficial tem duas formas de item, e os testes precisam das duas:
 *  - marmitex, com grupo de tamanho OBRIGATÓRIO: o "+" abre a folha;
 *  - bebida, sem opção nenhuma: o "+" soma direto.
 */
const semOpcaoObrigatoria = produtosDisponiveis().filter(
  (produto) => !(produto.options ?? []).some((grupo) => grupo.required),
);
const comOpcaoObrigatoria = produtosDisponiveis().filter((produto) =>
  (produto.options ?? []).some((grupo) => grupo.required),
);

const primeiro = semOpcaoObrigatoria[0];
const segundo = semOpcaoObrigatoria[1];
const comOpcoes = comOpcaoObrigatoria[0];

/** Card do produto no cardapio, pelo nome. */
function cartao(pagina: import("@playwright/test").Page, nome: string) {
  return pagina.getByRole("listitem").filter({ hasText: nome }).first();
}

/** O cardapio abre na primeira categoria; isto leva ate a do produto. */
async function irParaCategoriaDe(
  pagina: import("@playwright/test").Page,
  nomeDoProduto: string,
) {
  const produto = produtosDisponiveis().find((item) => item.name === nomeDoProduto);
  if (!produto) throw new Error(`Produto nao encontrado: ${nomeDoProduto}`);
  const categoria = categoriasComProduto().find((c) => c.id === produto.category);
  if (!categoria) throw new Error(`Categoria nao encontrada: ${produto.category}`);
  await pagina.getByRole("tab", { name: categoria.name }).click();
}

test.describe("home", () => {
  test("abre na landing page, nao no cardapio", async ({ page }) => {
    await page.goto("/");

    // O hero vem antes de qualquer produto.
    await expect(
      page.getByRole("heading", { level: 1, name: /Sabor de comida/i }),
    ).toBeVisible();
    await expect(page.getByText("Fresco • Caseiro • Feito com carinho")).toBeVisible();

    // A etapa 1 do pedido nao existe na home.
    await expect(page.getByRole("navigation", { name: "Etapas do pedido" })).toHaveCount(0);
  });

  test("Pedir agora leva ao cardapio", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Pedir agora" }).first().click();
    await expect(page).toHaveURL(/\/cardapio$/);
    await expect(page.getByRole("navigation", { name: "Etapas do pedido" })).toBeVisible();
  });

  test("o menu lateral abre e fecha", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir menu" }).click();
    const menu = page.getByRole("navigation", { name: "Menu principal" });
    await expect(menu).toBeVisible();
    await page.getByRole("button", { name: "Fechar menu" }).first().click();
    await expect(menu).toHaveCount(0);
  });

  test("nao mostra dado que a casa nao confirmou", async ({ page }) => {
    await page.goto("/#informacoes");
    // Horario e endereco ainda nao foram cadastrados: o site diz isso.
    await expect(page.getByText("Informação a cadastrar").first()).toBeVisible();
  });
});

test.describe("cardapio e carrinho", () => {
  test("adiciona, soma, diminui e o carrinho sobrevive ao reload", async ({ page }) => {
    await page.goto("/cardapio");

    await irParaCategoriaDe(page, primeiro.name);

    await cartao(page, primeiro.name)
      .getByRole("button", { name: `Adicionar ${primeiro.name} ao pedido` })
      .click();

    const barra = page.getByRole("link", { name: /Continuar pedido/ });
    await expect(barra).toBeVisible();
    await expect(page.getByText("1 item · subtotal")).toBeVisible();
    await expect(page.getByText(formatarPreco(primeiro.price)).first()).toBeVisible();

    // Soma uma unidade pelo proprio card.
    await cartao(page, primeiro.name)
      .getByRole("button", { name: `Adicionar uma unidade de ${primeiro.name}` })
      .click();
    await expect(page.getByText("2 itens · subtotal")).toBeVisible();

    // O carrinho continua depois de recarregar. A aba, não: o cardápio volta
    // para a primeira categoria, então navegamos de novo até o produto.
    await page.reload();
    await expect(page.getByText("2 itens · subtotal")).toBeVisible();
    await irParaCategoriaDe(page, primeiro.name);

    // Diminui de volta para 1.
    await cartao(page, primeiro.name)
      .getByRole("button", { name: `Remover uma unidade de ${primeiro.name}` })
      .click();
    await expect(page.getByText("1 item · subtotal")).toBeVisible();
  });

  test("quantidade nunca fica negativa: some do carrinho no zero", async ({ page }) => {
    await page.goto("/cardapio");
    await irParaCategoriaDe(page, primeiro.name);
    await cartao(page, primeiro.name)
      .getByRole("button", { name: `Adicionar ${primeiro.name} ao pedido` })
      .click();
    await cartao(page, primeiro.name)
      .getByRole("button", { name: `Remover uma unidade de ${primeiro.name}` })
      .click();

    await expect(page.getByRole("link", { name: /Continuar pedido/ })).toHaveCount(0);
    await expect(
      cartao(page, primeiro.name).getByRole("button", {
        name: `Adicionar ${primeiro.name} ao pedido`,
      }),
    ).toBeVisible();
  });

  test("a folha do produto fecha pelo X, por fora e pelo Esc", async ({ page }) => {
    await page.goto("/cardapio");
    await irParaCategoriaDe(page, primeiro.name);

    const abrir = () =>
      cartao(page, primeiro.name)
        .getByRole("button", { name: `Ver detalhes de ${primeiro.name}` })
        .click();
    const folha = page.getByRole("dialog");

    await abrir();
    await expect(folha).toBeVisible();
    await folha.getByRole("button", { name: "Fechar" }).click();
    await expect(folha).toHaveCount(0);

    await abrir();
    await expect(folha).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(folha).toHaveCount(0);

    await abrir();
    await expect(folha).toBeVisible();
    // Toque fora da folha. No desktop o painel fica centrado e cobre o meio do
    // fundo, então miramos um canto — que é onde alguém realmente clicaria.
    await page
      .getByRole("button", { name: "Fechar tocando fora" })
      .click({ position: { x: 8, y: 8 } });
    await expect(folha).toHaveCount(0);
  });

  test("a folha soma a quantidade escolhida", async ({ page }) => {
    await page.goto("/cardapio");
    await irParaCategoriaDe(page, primeiro.name);
    await cartao(page, primeiro.name)
      .getByRole("button", { name: `Ver detalhes de ${primeiro.name}` })
      .click();

    await page.getByRole("button", { name: "Aumentar quantidade" }).click();
    await page.getByRole("button", { name: /Adicionar ao pedido/ }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText("2 itens · subtotal")).toBeVisible();
  });

  test("produto com tamanho obrigatorio nao entra sem a escolha", async ({
    page,
  }) => {
    test.skip(!comOpcoes, "nenhum produto do cardápio tem opção obrigatória");
    await page.goto("/cardapio");
    await irParaCategoriaDe(page, comOpcoes.name);

    // O "+" desse item abre a folha em vez de somar direto.
    await cartao(page, comOpcoes.name)
      .getByRole("button", { name: `Escolher opções de ${comOpcoes.name}` })
      .click();

    const folha = page.getByRole("dialog");
    await expect(folha).toBeVisible();

    // Tentar adicionar sem escolher o tamanho tem de ser recusado.
    await folha.getByRole("button", { name: /Adicionar ao pedido/ }).click();
    await expect(folha.getByRole("alert")).toContainText(/Escolha uma opção/);
    await expect(page.getByRole("link", { name: /Continuar pedido/ })).toHaveCount(0);

    // Com o tamanho escolhido, entra.
    await folha.getByRole("radio").first().check();
    await folha.getByRole("button", { name: /Adicionar ao pedido/ }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText("1 item · subtotal")).toBeVisible();
  });

  test("preço \"a partir de\" aparece marcado como tal", async ({ page }) => {
    test.skip(!comOpcoes, "nenhum produto do cardápio usa preço a partir de");
    await page.goto("/cardapio");
    await irParaCategoriaDe(page, comOpcoes.name);

    const linha = cartao(page, comOpcoes.name);
    if (comOpcoes.priceFrom) {
      // Mostrar só "R$ 21,00" faria o cliente ler como preço final.
      await expect(linha.getByText("a partir de")).toBeVisible();
    }
  });

  test("so aparece categoria que tem produto", async ({ page }) => {
    await page.goto("/cardapio");
    const abas = page.getByRole("tab");
    const total = await abas.count();
    expect(total).toBeGreaterThan(0);

    for (let i = 0; i < total; i += 1) {
      await abas.nth(i).click();
      await expect(page.getByText("Nada nesta categoria por enquanto")).toHaveCount(0);
    }
  });
});

test.describe("pedido e pagamento", () => {
  async function montarPedido(page: import("@playwright/test").Page) {
    await page.goto("/cardapio");
    await irParaCategoriaDe(page, primeiro.name);
    await cartao(page, primeiro.name)
      .getByRole("button", { name: `Adicionar ${primeiro.name} ao pedido` })
      .click();
    await cartao(page, segundo.name)
      .getByRole("button", { name: `Adicionar ${segundo.name} ao pedido` })
      .click();
    await page.getByRole("link", { name: /Continuar pedido/ }).click();
    await expect(page).toHaveURL(/\/pedido$/);
  }

  test("o resumo soma o subtotal certo", async ({ page }) => {
    await montarPedido(page);
    const subtotal = primeiro.price + segundo.price;
    await expect(page.getByText(formatarPreco(subtotal)).first()).toBeVisible();
  });

  test("remover item pede confirmacao", async ({ page }) => {
    await montarPedido(page);
    await page
      .getByRole("button", { name: `Remover ${primeiro.name} do pedido` })
      .click();

    const dialogo = page.getByRole("dialog");
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole("button", { name: "Manter" }).click();
    await expect(page.getByText(primeiro.name).first()).toBeVisible();

    await page
      .getByRole("button", { name: `Remover ${primeiro.name} do pedido` })
      .click();
    await page.getByRole("button", { name: "Remover", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("entrega exige endereco e retirada nao pede", async ({ page }) => {
    await montarPedido(page);

    await page.getByRole("radio", { name: "Retirada" }).click({ force: true });
    await page.getByRole("link", { name: /Ir para o pagamento/ }).click();
    await expect(page).toHaveURL(/\/pagamento$/);

    // Retirada: nenhum campo de endereco.
    await expect(page.getByRole("group", { name: /Endereço de entrega/ })).toHaveCount(0);
    await expect(page.getByText(/Retirada no balcão: não pedimos endereço/)).toBeVisible();

    // Trocando para entrega o formulario aparece.
    await page.getByRole("radio", { name: "Entrega" }).click({ force: true });
    await expect(page.getByLabel("Rua")).toBeVisible();
    await expect(page.getByLabel("Número")).toBeVisible();
    await expect(page.getByLabel("Bairro")).toBeVisible();
  });

  test("avisa o que falta antes de enviar", async ({ page }) => {
    await montarPedido(page);
    await page.getByRole("radio", { name: "Entrega" }).click({ force: true });
    await page.getByRole("link", { name: /Ir para o pagamento/ }).click();

    await page
      .getByRole("button", { name: /Copiar mensagem do pedido|Enviar pedido no WhatsApp/ })
      .click();

    // O que tem campo proprio aparece colado no campo, uma vez so.
    await expect(page.getByText("Informe seu nome.")).toBeVisible();
    await expect(page.getByText("Preencha rua.")).toBeVisible();
    await expect(page.getByText("Preencha número.")).toBeVisible();
    await expect(page.getByText("Preencha bairro.")).toBeVisible();
    // O que nao tem campo proprio aparece na lista do rodape.
    await expect(page.getByText("Escolha a forma de pagamento.")).toBeVisible();
  });

  test("troco so aparece no dinheiro e exige valor maior que o total", async ({ page }) => {
    await montarPedido(page);
    await page.getByRole("radio", { name: "Retirada" }).click({ force: true });
    await page.getByRole("link", { name: /Ir para o pagamento/ }).click();

    await page.getByRole("radio", { name: "Pix" }).click({ force: true });
    await expect(page.getByText("Precisa de troco?")).toHaveCount(0);

    await page.getByRole("radio", { name: "Dinheiro" }).click({ force: true });
    await expect(page.getByText("Precisa de troco?")).toBeVisible();

    await page.getByRole("radio", { name: "Sim" }).click({ force: true });
    await page.getByLabel("Troco para quanto?").fill("100");
    await expect(page.getByLabel("Troco para quanto?")).toHaveValue(/R\$\s?1,00/);

    await page.getByLabel("Nome").fill("Cliente de teste");
    await page
      .getByRole("button", { name: /Copiar mensagem do pedido|Enviar pedido no WhatsApp/ })
      .click();
    await expect(
      page.getByText("O valor do troco precisa ser maior que o total do pedido."),
    ).toBeVisible();
  });

  test("todas as formas de pagamento podem ser escolhidas", async ({ page }) => {
    await montarPedido(page);
    await page.getByRole("radio", { name: "Retirada" }).click({ force: true });
    await page.getByRole("link", { name: /Ir para o pagamento/ }).click();

    for (const forma of ["Pix", "Dinheiro", "Débito", "Crédito"]) {
      await page.getByRole("radio", { name: forma, exact: true }).click({ force: true });
      await expect(page.getByRole("radio", { name: forma, exact: true })).toBeChecked();
    }
  });
});

test.describe("mensagem do WhatsApp", () => {
  test("monta o texto exato do pedido na entrega", async ({ page }) => {
    await page.goto("/cardapio");
    await irParaCategoriaDe(page, primeiro.name);
    await cartao(page, primeiro.name)
      .getByRole("button", { name: `Adicionar ${primeiro.name} ao pedido` })
      .click();
    await page.getByRole("link", { name: /Continuar pedido/ }).click();
    await page.getByRole("radio", { name: "Entrega" }).click({ force: true });
    await page.getByRole("link", { name: /Ir para o pagamento/ }).click();

    await page.getByLabel("Nome").fill("Ana Souza");
    await page.getByLabel("Rua").fill("Rua das Flores");
    await page.getByLabel("Número").fill("123");
    await page.getByLabel("Bairro").fill("Centro");
    await page.getByLabel("Cidade").selectOption("Jacareí - SP");
    await page.getByRole("radio", { name: "Pix" }).click({ force: true });
    await page.getByLabel("Observações do pedido").fill("Sem pimenta.");

    await page.getByText("Ver a mensagem que será enviada").click();
    const mensagem = page.locator("details pre");

    await expect(mensagem).toContainText(
      "Olá! Gostaria de fazer um pedido na Comida Caseira da Márcia Costa",
    );
    await expect(mensagem).toContainText(`1x ${primeiro.name}`);
    await expect(mensagem).toContainText(`Subtotal: ${formatarPreco(primeiro.price)}`);
    // A taxa nao foi confirmada pela casa: a mensagem diz isso, nao inventa valor.
    await expect(mensagem).toContainText("Entrega: a combinar");
    await expect(mensagem).toContainText(`*TOTAL: ${formatarPreco(primeiro.price)}*`);
    await expect(mensagem).toContainText("Ana Souza");
    await expect(mensagem).toContainText("Rua das Flores, 123");
    await expect(mensagem).toContainText("Jacareí - SP");
    await expect(mensagem).toContainText("Pix");
    await expect(mensagem).toContainText("Sem pimenta.");
  });

  test("na retirada nao vai endereco nenhum na mensagem", async ({ page }) => {
    await page.goto("/cardapio");
    await irParaCategoriaDe(page, primeiro.name);
    await cartao(page, primeiro.name)
      .getByRole("button", { name: `Adicionar ${primeiro.name} ao pedido` })
      .click();
    await page.getByRole("link", { name: /Continuar pedido/ }).click();
    await page.getByRole("radio", { name: "Retirada" }).click({ force: true });
    await page.getByRole("link", { name: /Ir para o pagamento/ }).click();

    await page.getByLabel("Nome").fill("Ana Souza");
    await page.getByRole("radio", { name: "Dinheiro" }).click({ force: true });
    await page.getByRole("radio", { name: "Não" }).click({ force: true });

    await page.getByText("Ver a mensagem que será enviada").click();
    const mensagem = page.locator("details pre");

    await expect(mensagem).toContainText("Retirada no balcão");
    await expect(mensagem).toContainText("Não precisa de troco");
    await expect(mensagem).not.toContainText("*Endereço:*");
    await expect(mensagem).not.toContainText("Entrega:");
  });

  test("com o número da casa cadastrado, o envio pelo WhatsApp aparece", async ({
    page,
  }) => {
    await page.goto("/cardapio");
    await irParaCategoriaDe(page, primeiro.name);
    await cartao(page, primeiro.name)
      .getByRole("button", { name: `Adicionar ${primeiro.name} ao pedido` })
      .click();
    await page.getByRole("link", { name: /Continuar pedido/ }).click();
    await page.getByRole("radio", { name: "Retirada" }).click({ force: true });
    await page.getByRole("link", { name: /Ir para o pagamento/ }).click();

    // Com número cadastrado o site oferece o envio, e não o fallback de copiar.
    await expect(
      page.getByRole("button", { name: "Enviar pedido no WhatsApp" }),
    ).toBeVisible();
    await expect(
      page.getByText(/O número de WhatsApp da casa ainda não foi cadastrado/),
    ).toHaveCount(0);

    // E não envia pedido incompleto: falta nome e forma de pagamento.
    await page.getByRole("button", { name: "Enviar pedido no WhatsApp" }).click();
    await expect(page.getByText("Informe seu nome.")).toBeVisible();
    await expect(page.getByText("Escolha a forma de pagamento.")).toBeVisible();
  });
});

test.describe("PWA e responsividade", () => {
  test("o manifesto esta publicado", async ({ request }) => {
    const resposta = await request.get("/manifest.webmanifest");
    expect(resposta.ok()).toBeTruthy();
    const manifesto = await resposta.json();
    expect(manifesto.name).toBe("Comida Caseira da Márcia Costa");
    expect(manifesto.display).toBe("standalone");
    expect(manifesto.theme_color).toBe("#e75c16");
    expect(manifesto.icons.length).toBeGreaterThanOrEqual(3);
  });

  test("nao rola de lado de 360 a 1920", async ({ page }) => {
    // Carrega uma vez e so redimensiona: o estouro horizontal e questao de
    // layout, entao nao precisa de uma navegacao nova por largura.
    await page.goto("/", { waitUntil: "domcontentloaded" });

    for (const largura of [360, 390, 430, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.waitForTimeout(150);
      const excesso = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(excesso, `largura ${largura}px`).toBeLessThanOrEqual(1);
    }
  });

  test("o cardapio tambem nao rola de lado", async ({ page }) => {
    await page.goto("/cardapio", { waitUntil: "domcontentloaded" });

    for (const largura of [360, 390, 430, 768, 1440]) {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.waitForTimeout(150);
      const excesso = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(excesso, `largura ${largura}px`).toBeLessThanOrEqual(1);
    }
  });

  test("os botoes principais tem area de toque confortavel", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/cardapio");

    const botoes = page.getByRole("button", { name: /Adicionar .* ao pedido/ });
    const total = Math.min(await botoes.count(), 4);
    for (let i = 0; i < total; i += 1) {
      const caixa = await botoes.nth(i).boundingBox();
      expect(caixa!.height).toBeGreaterThanOrEqual(44);
      expect(caixa!.width).toBeGreaterThanOrEqual(44);
    }
  });
});
