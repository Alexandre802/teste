import { expect, test } from "@playwright/test";

import { gruposDePalavras, palavrasChave } from "../data/palavras-chave";
import { avaliacoes } from "../data/avaliacoes";

test.describe("palavras-chave", () => {
  test("são exatamente 100 e não se repetem", () => {
    expect(palavrasChave).toHaveLength(100);
    const unicas = new Set(palavrasChave.map((t) => t.toLocaleLowerCase("pt-BR")));
    expect(unicas.size).toBe(100);
  });

  test("aparecem em conteúdo visível, não escondidas", async ({ page }) => {
    await page.goto("/");
    const secao = page.locator("#o-que-entregamos");
    await secao.scrollIntoViewIfNeeded();
    await expect(secao).toBeVisible();

    // Nenhum grupo pode estar escondido do cliente: texto oculto para
    // buscador é cloaking, e isso arrisca o domínio.
    for (const grupo of gruposDePalavras) {
      await expect(
        secao.getByRole("heading", { name: grupo.titulo, exact: true }),
      ).toBeVisible();
    }

    // Amostra de termos, um de cada ponta da lista.
    for (const termo of [
      palavrasChave[0],
      palavrasChave[50],
      palavrasChave[99],
    ]) {
      await expect(secao.getByText(termo, { exact: true }).first()).toBeVisible();
    }
  });

  test("nenhum termo fica invisível na página", async ({ page }) => {
    await page.goto("/");
    await page.locator("#o-que-entregamos").scrollIntoViewIfNeeded();

    const escondidos = await page.evaluate(() => {
      const secao = document.getElementById("o-que-entregamos");
      if (!secao) return ["seção não encontrada"];
      return [...secao.querySelectorAll("li")]
        .filter((item) => {
          const estilo = getComputedStyle(item);
          return (
            estilo.display === "none" ||
            estilo.visibility === "hidden" ||
            Number(estilo.opacity) === 0 ||
            item.getBoundingClientRect().height === 0
          );
        })
        .map((item) => item.textContent ?? "");
    });

    expect(escondidos).toEqual([]);
  });

  test("a meta keywords carrega as 100", async ({ page }) => {
    await page.goto("/");
    const conteudo = await page
      .locator('meta[name="keywords"]')
      .getAttribute("content");
    expect(conteudo?.split(",").length).toBe(100);
  });
});

test.describe("mapa", () => {
  test("mostra o endereço e o caminho para o Google Maps, sem iframe quebrado", async ({
    page,
  }) => {
    await page.goto("/");
    const secao = page.locator("#onde-estamos");
    await secao.scrollIntoViewIfNeeded();
    await expect(secao).toBeVisible();

    // O endereço da casa está cadastrado, mas a chave do Maps não. Nessa
    // situação o site mostra o endereço e um botão que abre o aplicativo —
    // iframe sem chave carrega uma vez e depois passa a devolver erro.
    await expect(secao.getByRole("link", { name: /Abrir no Google Maps/ })).toBeVisible();
    await expect(secao.locator("iframe")).toHaveCount(0);
    await expect(secao.getByText("Informação a cadastrar")).toHaveCount(0);
  });
});

test.describe("avaliações", () => {
  test("a seção existe e não inventa depoimento", async ({ page }) => {
    await page.goto("/");
    const secao = page.locator("#avaliacoes");
    await secao.scrollIntoViewIfNeeded();
    await expect(
      secao.getByRole("heading", { name: "Avaliações" }),
    ).toBeVisible();

    if (avaliacoes.length === 0) {
      await expect(
        secao.getByText(/Nenhum depoimento é inventado neste site/),
      ).toBeVisible();
    }
  });

  test("a animação do Remotion carrega", async ({ page }) => {
    await page.goto("/");
    const secao = page.locator("#avaliacoes");
    await secao.scrollIntoViewIfNeeded();
    // O Player entra por import dinâmico, então esperamos ele aparecer.
    await expect(secao.locator("canvas, video, div").first()).toBeVisible();
    await expect(secao.getByText("Comida caseira de verdade")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("o schema não anuncia nota que não existe", async ({ page }) => {
    await page.goto("/");
    const bruto = await page.locator('script[type="application/ld+json"]').textContent();
    const schema = JSON.parse(bruto ?? "{}");
    if (avaliacoes.length === 0) {
      expect(schema.aggregateRating).toBeUndefined();
      expect(schema.review).toBeUndefined();
    }
  });
});
