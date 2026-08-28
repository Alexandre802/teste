import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isReminderDue, nextReminderAt, isWithinActiveWindow } from "@/lib/reminders";
import { parseMoneyToCents, centsToInput, money } from "@/lib/format";
import { compareSizes } from "@/lib/constants";
import { rangeFor, toDateKey, daysSince } from "@/lib/date";
import {
  buildVariantViews,
  dailySeries,
  lowStockEntries,
  rankBy,
  rankProducts,
  staleVariants,
  summarize,
} from "@/lib/selectors";
import { paraCsv, reais } from "@/utils/csv";
import type { Expense, InventoryRow, Movement, Product, Sale, SaleItem, Variant } from "@/types";

const CONFIG = { enabled: true, intervalMinutes: 120, quietStart: "08:00", quietEnd: "22:00" };

describe("lembrete inteligente", () => {
  it("avisa quando passou o intervalo desde a última venda", () => {
    const agora = new Date("2026-08-28T16:00:00");
    const atividade = {
      lastSaleAt: new Date("2026-08-28T13:00:00").toISOString(),
      lastStockUpdateAt: null,
      lastReminderAt: null,
    };
    assert.equal(isReminderDue(CONFIG, atividade, agora), true);
  });

  it("adia quando a venda foi minutos antes do horário do lembrete", () => {
    // Caso do enunciado: lembrete cairia 16:00, venda registrada 15:55.
    const agora = new Date("2026-08-28T16:00:00");
    const atividade = {
      lastSaleAt: new Date("2026-08-28T15:55:00").toISOString(),
      lastStockUpdateAt: null,
      lastReminderAt: null,
    };
    assert.equal(isReminderDue(CONFIG, atividade, agora), false);
    const proximo = nextReminderAt(CONFIG, atividade, agora);
    assert.equal(proximo?.getHours(), 17);
    assert.equal(proximo?.getMinutes(), 55);
  });

  it("entrada de estoque também reinicia a contagem", () => {
    const agora = new Date("2026-08-28T16:00:00");
    const atividade = {
      lastSaleAt: new Date("2026-08-28T09:00:00").toISOString(),
      lastStockUpdateAt: new Date("2026-08-28T15:50:00").toISOString(),
      lastReminderAt: null,
    };
    assert.equal(isReminderDue(CONFIG, atividade, agora), false);
  });

  it("não avisa de madrugada: escorrega para a abertura da faixa", () => {
    const agora = new Date("2026-08-28T03:00:00");
    const atividade = {
      lastSaleAt: new Date("2026-08-27T22:30:00").toISOString(),
      lastStockUpdateAt: null,
      lastReminderAt: null,
    };
    const proximo = nextReminderAt(CONFIG, atividade, agora);
    assert.equal(proximo?.getHours(), 8);
    assert.equal(toDateKey(proximo as Date), "2026-08-28");
    assert.equal(isReminderDue(CONFIG, atividade, agora), false);
  });

  it("desligado não gera lembrete", () => {
    assert.equal(
      nextReminderAt({ ...CONFIG, enabled: false }, { lastSaleAt: null, lastStockUpdateAt: null, lastReminderAt: null }),
      null,
    );
  });

  it("faixa ativa aceita virada de meia-noite", () => {
    assert.equal(isWithinActiveWindow(new Date("2026-08-28T23:00:00"), "20:00", "06:00"), true);
    assert.equal(isWithinActiveWindow(new Date("2026-08-28T12:00:00"), "20:00", "06:00"), false);
  });
});

describe("dinheiro", () => {
  it("converte texto em centavos sem erro de arredondamento", () => {
    assert.equal(parseMoneyToCents("99,90"), 9990);
    assert.equal(parseMoneyToCents("R$ 1.280,00"), 128000);
    assert.equal(parseMoneyToCents("45"), 4500);
    assert.equal(parseMoneyToCents(""), 0);
    assert.equal(parseMoneyToCents("abc"), 0);
  });

  it("volta de centavos para o campo de texto", () => {
    assert.equal(centsToInput(9990), "99,90");
    assert.equal(centsToInput(0), "");
  });

  it("formata em reais", () => {
    assert.match(money(9990), /99,90/);
  });
});

describe("ordem dos tamanhos", () => {
  it("P antes de M antes de G", () => {
    assert.deepEqual(["GG", "P", "M", "G"].sort(compareSizes), ["P", "M", "G", "GG"]);
  });
  it("numeração de calçado sai na ordem numérica", () => {
    assert.deepEqual(["42", "38", "40"].sort(compareSizes), ["38", "40", "42"]);
  });
});

// ------------------------------------------------------------------ catálogo

const produto: Product = {
  id: "p1",
  name: "Camiseta Oversized MD",
  category: "camiseta",
  supplierId: null,
  sku: "CMD-OV-001",
  costCents: 4500,
  priceCents: 9990,
  minStock: 3,
  archived: false,
  createdAt: "2026-08-01T10:00:00.000Z",
  updatedAt: "2026-08-01T10:00:00.000Z",
};

const variante: Variant = {
  id: "v1",
  productId: "p1",
  colorName: "Preta",
  colorHex: "#111111",
  sku: null,
  imageUrl: null,
  archived: false,
  createdAt: "2026-08-01T10:00:00.000Z",
  updatedAt: "2026-08-01T10:00:00.000Z",
};

const estoque: InventoryRow[] = [
  { id: "i1", variantId: "v1", size: "M", quantity: 8, position: 1, updatedAt: "" },
  { id: "i2", variantId: "v1", size: "P", quantity: 2, position: 0, updatedAt: "" },
];

describe("montagem do catálogo", () => {
  const views = buildVariantViews({ products: [produto], variants: [variante], inventory: estoque, movements: [] });

  it("soma o estoque e ordena os tamanhos", () => {
    assert.equal(views.length, 1);
    assert.equal(views[0]?.total, 10);
    assert.deepEqual(views[0]?.sizes.map((s) => s.size), ["P", "M"]);
  });

  it("calcula o lucro por unidade", () => {
    assert.equal(views[0]?.profitCents, 5490);
  });

  it("lista o tamanho abaixo do mínimo", () => {
    const alertas = lowStockEntries(views);
    assert.equal(alertas.length, 1);
    assert.equal(alertas[0]?.size, "P");
    assert.equal(alertas[0]?.quantity, 2);
  });

  it("produto arquivado não aparece", () => {
    const semNada = buildVariantViews({
      products: [{ ...produto, archived: true }],
      variants: [variante],
      inventory: estoque,
      movements: [],
    });
    assert.equal(semNada.length, 0);
  });
});

// -------------------------------------------------------------------- resumo

function vendaEm(iso: string, total: number, custo: number, id: string): Sale {
  return {
    id,
    totalCents: total,
    costCents: custo,
    paymentMethod: "pix",
    status: "concluida",
    note: null,
    soldAt: iso,
    cancelledAt: null,
    createdAt: iso,
  };
}

describe("faturamento, custo e lucro", () => {
  const hoje = new Date();
  const iso = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 14, 0).toISOString();
  const vendas = [vendaEm(iso, 9990, 4500, "s1"), vendaEm(iso, 12990, 5500, "s2")];
  const itens: SaleItem[] = [
    {
      id: "si1", saleId: "s1", variantId: "v1", productId: "p1", productName: "Camiseta Oversized MD",
      colorName: "Preta", size: "M", quantity: 1, unitPriceCents: 9990, unitCostCents: 4500,
    },
    {
      id: "si2", saleId: "s2", variantId: "v2", productId: "p2", productName: "Bermuda Cargo MD",
      colorName: "Bege", size: "G", quantity: 1, unitPriceCents: 12990, unitCostCents: 5500,
    },
  ];
  const despesas: Expense[] = [
    { id: "d1", description: "Frete", amountCents: 2000, category: "frete", spentOn: toDateKey(hoje), createdAt: iso },
  ];

  const { start, end } = rangeFor("hoje");
  const resumo = summarize(vendas, itens, despesas, start, end);

  it("faturamento é a soma das vendas", () => {
    assert.equal(resumo.revenueCents, 22980);
  });

  it("lucro bruto desconta só o custo da peça", () => {
    assert.equal(resumo.grossProfitCents, 22980 - 10000);
  });

  it("lucro líquido desconta também as despesas", () => {
    assert.equal(resumo.netProfitCents, 22980 - 10000 - 2000);
  });

  it("ticket médio", () => {
    assert.equal(resumo.averageTicketCents, 11490);
  });

  it("venda cancelada sai da conta", () => {
    const comCancelada = [...vendas, { ...vendaEm(iso, 50000, 20000, "s3"), status: "cancelada" as const }];
    assert.equal(summarize(comCancelada, itens, despesas, start, end).revenueCents, 22980);
  });

  it("série diária cobre todos os dias do período", () => {
    const semana = rangeFor("7d");
    const serie = dailySeries(vendas, despesas, semana.start, semana.end);
    assert.equal(serie.length, 7);
    assert.equal(serie[6]?.revenue, 22980);
    assert.equal(serie[6]?.profit, 22980 - 10000 - 2000);
  });

  it("ranking por produto, tamanho e cor", () => {
    const ranking = rankProducts(itens);
    assert.equal(ranking.length, 2);
    assert.equal(ranking[0]?.quantity, 1);
    assert.deepEqual(rankBy(itens, "size").map((r) => r.label).sort(), ["G", "M"]);
    assert.deepEqual(rankBy(itens, "colorName").map((r) => r.label).sort(), ["Bege", "Preta"]);
  });
});

describe("produtos parados", () => {
  it("conta os dias desde a última venda da peça", () => {
    const antiga = new Date();
    antiga.setDate(antiga.getDate() - 40);
    const movimentos: Movement[] = [
      {
        id: "m1", variantId: "v1", size: "M", delta: -1, kind: "venda", unitCostCents: 4500,
        supplierId: null, saleId: "s0", note: null, createdAt: antiga.toISOString(),
      },
    ];
    const views = buildVariantViews({ products: [produto], variants: [variante], inventory: estoque, movements: movimentos });
    const parados = staleVariants(views, 30);
    assert.equal(parados.length, 1);
    assert.equal(parados[0]?.days, daysSince(antiga.toISOString()));
  });
});

describe("exportação", () => {
  it("escapa ponto e vírgula e aspas", () => {
    const csv = paraCsv(["a", "b"], [["x;y", 'diz "oi"']]);
    assert.equal(csv, 'a;b\r\n"x;y";"diz ""oi"""');
  });
  it("valor sai com vírgula decimal", () => {
    assert.equal(reais(9990), "99,90");
  });
});
