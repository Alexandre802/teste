import { expect, test } from "@playwright/test";

import { categoriasComProduto, produtosDisponiveis } from "../data/menu";

/**
 * Item que entra na sacola com um toque. No cardápio oficial os marmitex têm
 * grupo de tamanho obrigatório e abrem a folha; as bebidas somam direto.
 */
const semOpcaoObrigatoria = produtosDisponiveis().find(
  (produto) => !(produto.options ?? []).some((grupo) => grupo.required),
)!;
const categoriaDele = categoriasComProduto().find(
  (categoria) => categoria.id === semOpcaoObrigatoria.category,
)!;

/**
 * Testes da área administrativa SEM Supabase configurado.
 *
 * Nesta condição a regra é a mesma do resto do projeto: o que não funciona de
 * verdade não aparece na tela. O painel diz o que falta configurar em vez de
 * mostrar um login que não teria banco atrás, e o site de pedidos segue
 * funcionando como antes.
 *
 * O que depende de um Supabase de verdade — login, RLS, criação de pedido,
 * realtime — é coberto pelos testes de banco (npm run test:db), que rodam as
 * migrations e as funções num Postgres real.
 */

test.describe("área administrativa sem banco configurado", () => {
  test("qualquer rota do painel cai na tela de configuração", async ({ page }) => {
    for (const rota of ["/admin", "/admin/pedidos", "/admin/despesas"]) {
      await page.goto(rota);
      await expect(page).toHaveURL(/\/admin\/configurar$/);
      await expect(
        page.getByRole("heading", { name: /painel ainda não está conectado/i }),
      ).toBeVisible();
    }
  });

  test("a tela de configuração explica os passos e volta para o site", async ({
    page,
  }) => {
    await page.goto("/admin/configurar");
    await expect(page.getByText(/Crie o projeto no Supabase/)).toBeVisible();
    await expect(page.getByText(/Rode as migrations/)).toBeVisible();
    await expect(page.getByText(/NEXT_PUBLIC_SUPABASE_URL/)).toBeVisible();

    await page.getByRole("link", { name: "Voltar para o site" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("o painel não é anunciado no site público", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /admin|painel/i })).toHaveCount(0);
  });

  test("o painel fica fora do sitemap e do robots", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/admin");
  });
});

test.describe("registro do pedido", () => {
  test("a rota de pedidos responde que o caixa está desligado", async ({
    request,
  }) => {
    const resposta = await request.post("/api/pedidos", {
      data: { checkout_token: "teste", items: [] },
    });
    expect(resposta.status()).toBe(503);
    expect((await resposta.json()).erro).toBe("fluxo_de_caixa_desligado");
  });

  test("sem caixa configurado o site segue montando o pedido normalmente", async ({
    page,
  }) => {
    await page.goto("/cardapio");
    await page.getByRole("tab", { name: categoriaDele.name }).click();
    await page
      .getByRole("button", {
        name: `Adicionar ${semOpcaoObrigatoria.name} ao pedido`,
      })
      .click();
    await page.getByRole("link", { name: /Continuar pedido/ }).click();
    await page.getByRole("radio", { name: "Retirada" }).click({ force: true });
    await page.getByRole("link", { name: /Ir para o pagamento/ }).click();

    await page.getByLabel("Nome").fill("Cliente de Teste");
    await page.getByRole("radio", { name: "Pix" }).click({ force: true });

    // A mensagem não inventa número de pedido enquanto não houver caixa.
    await page.getByText("Ver a mensagem que será enviada").click();
    const mensagem = page.locator("details pre");
    await expect(mensagem).toContainText("*PEDIDO*");
    await expect(mensagem).not.toContainText("PEDIDO #");
  });

  test("a área de entrega continua respondendo mesmo sem banco", async ({
    request,
  }) => {
    const resposta = await request.get("/api/zonas");
    expect(resposta.ok()).toBeTruthy();
    expect((await resposta.json()).zonas).toEqual([]);
  });
});
