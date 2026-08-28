/**
 * O fluxo principal do enunciado, ponta a ponta no estado do app:
 * cadastrar → vender → estoque baixa → painel sobe → histórico → cancelar.
 *
 * Roda sem Supabase de propósito: é exatamente a situação de quem está sem
 * sinal. A operação tem de valer na hora e ficar na fila para envio depois.
 */
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

import { useStore } from "@/lib/store";
import { rangeFor } from "@/lib/date";
import { buildVariantViews, summarize, lowStockEntries } from "@/lib/selectors";

function estado() {
  return useStore.getState();
}

function catalogo() {
  const s = estado();
  return buildVariantViews({
    products: s.products,
    variants: s.variants,
    inventory: s.inventory,
    movements: s.movements,
  });
}

function estoqueDe(variantId: string, tamanho: string): number {
  return estado().inventory.find((i) => i.variantId === variantId && i.size === tamanho)?.quantity ?? 0;
}

function faturamentoDeHoje(): number {
  const s = estado();
  const { start, end } = rangeFor("hoje");
  return summarize(s.sales, s.saleItems, s.expenses, start, end).revenueCents;
}

describe("fluxo principal", () => {
  let variantId = "";
  let produtoId = "";

  before(async () => {
    produtoId = await estado().saveProduct({
      name: "Camiseta Oversized MD",
      category: "camiseta",
      supplierId: null,
      sku: "CMD-OV-001",
      costCents: 4500,
      priceCents: 9990,
      minStock: 3,
      variants: [
        {
          colorName: "Preta",
          colorHex: "#111111",
          imageUrl: null,
          sku: null,
          quantities: { P: 4, M: 8, G: 3, GG: 1 },
        },
      ],
    });
    variantId = estado().variants[0]?.id ?? "";
  });

  it("cadastro cria produto, cor e estoque por tamanho", () => {
    assert.ok(produtoId);
    assert.ok(variantId);
    const view = catalogo()[0];
    assert.equal(view?.product.name, "Camiseta Oversized MD");
    assert.equal(view?.total, 16);
    assert.equal(estoqueDe(variantId, "M"), 8);
  });

  it("o estoque inicial entra como movimentação, não como número solto", () => {
    const movimentos = estado().movements.filter((m) => m.variantId === variantId);
    assert.equal(movimentos.length, 4);
    assert.ok(movimentos.every((m) => m.kind === "cadastro"));
  });

  it("venda de 1 unidade do M baixa o estoque de 8 para 7", async () => {
    const view = catalogo()[0];
    assert.ok(view);
    await estado().registerSale({
      paymentMethod: "pix",
      items: [
        {
          variantId,
          productId: produtoId,
          productName: view.product.name,
          colorName: view.variant.colorName,
          size: "M",
          quantity: 1,
          unitPriceCents: view.product.priceCents,
          unitCostCents: view.product.costCents,
        },
      ],
    });
    assert.equal(estoqueDe(variantId, "M"), 7);
    assert.equal(catalogo()[0]?.total, 15);
  });

  it("o painel soma R$ 99,90 e recalcula o lucro", () => {
    const s = estado();
    const { start, end } = rangeFor("hoje");
    const resumo = summarize(s.sales, s.saleItems, s.expenses, start, end);
    assert.equal(resumo.revenueCents, 9990);
    assert.equal(resumo.costCents, 4500);
    assert.equal(resumo.grossProfitCents, 5490);
    assert.equal(resumo.itemsSold, 1);
    assert.equal(resumo.byPayment.pix, 9990);
  });

  it("a venda entra no histórico com forma de pagamento e horário", () => {
    const venda = estado().sales[0];
    assert.equal(venda?.status, "concluida");
    assert.equal(venda?.paymentMethod, "pix");
    assert.ok(venda?.soldAt);
    assert.equal(estado().saleItems.filter((i) => i.saleId === venda?.id).length, 1);
  });

  it("sem servidor, a venda fica na fila em vez de se perder", () => {
    const fila = estado().outbox;
    assert.ok(fila.some((op) => op.kind === "sale"));
    assert.ok(fila.some((op) => op.kind === "upsert" && op.table === "products"));
  });

  it("o lembrete passa a contar a partir da venda", () => {
    assert.ok(estado().settings.lastSaleAt);
  });

  it("entrada de estoque soma no tamanho certo", async () => {
    const somadas = await estado().addEntry({
      variantId,
      supplierId: null,
      unitCostCents: 4500,
      note: "Reposição",
      lines: [
        { size: "P", quantity: 5 },
        { size: "M", quantity: 0 },
      ],
    });
    assert.equal(somadas, 5);
    assert.equal(estoqueDe(variantId, "P"), 9);
    assert.equal(estoqueDe(variantId, "M"), 7);
    assert.ok(estado().settings.lastStockUpdateAt);
  });

  it("cancelar devolve a peça e mantém o registro", async () => {
    const venda = estado().sales.find((v) => v.status === "concluida");
    assert.ok(venda);
    await estado().cancelSale(venda.id);

    assert.equal(estoqueDe(variantId, "M"), 8);
    const depois = estado().sales.find((v) => v.id === venda.id);
    assert.equal(depois?.status, "cancelada");
    assert.ok(depois?.cancelledAt);
    // O faturamento do dia volta a zero, mas a venda continua no histórico.
    assert.equal(faturamentoDeHoje(), 0);
    assert.equal(estado().sales.length, 1);
  });

  it("cancelar de novo não devolve peça duas vezes", async () => {
    const venda = estado().sales[0];
    assert.ok(venda);
    await estado().cancelSale(venda.id);
    assert.equal(estoqueDe(variantId, "M"), 8);
  });

  it("editar o produto ajusta o estoque pela diferença", async () => {
    await estado().saveProduct({
      id: produtoId,
      name: "Camiseta Oversized MD",
      category: "camiseta",
      supplierId: null,
      sku: "CMD-OV-001",
      costCents: 4500,
      priceCents: 10990,
      minStock: 3,
      variants: [
        {
          id: variantId,
          colorName: "Preta",
          colorHex: "#111111",
          imageUrl: null,
          sku: null,
          quantities: { P: 9, M: 6, G: 3, GG: 1 },
        },
      ],
    });
    assert.equal(estoqueDe(variantId, "M"), 6);
    assert.equal(catalogo()[0]?.product.priceCents, 10990);
    const ajustes = estado().movements.filter((m) => m.kind === "ajuste");
    assert.equal(ajustes.length, 1);
    assert.equal(ajustes[0]?.delta, -2);
  });

  it("tamanho no mínimo entra no alerta de reposição", () => {
    const alertas = lowStockEntries(catalogo());
    assert.deepEqual(alertas.map((a) => a.size).sort(), ["G", "GG"]);
  });

  it("despesa entra no lucro líquido sem mexer no faturamento", async () => {
    await estado().saveExpense({
      description: "Embalagem",
      amountCents: 3000,
      category: "embalagem",
      spentOn: new Date().toISOString().slice(0, 10),
    });
    const s = estado();
    const { start, end } = rangeFor("hoje");
    const resumo = summarize(s.sales, s.saleItems, s.expenses, start, end);
    assert.equal(resumo.revenueCents, 0);
    assert.equal(resumo.expensesCents, 3000);
    assert.equal(resumo.netProfitCents, -3000);
  });
});
