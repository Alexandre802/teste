"use client";

import type { DataSnapshot } from "@/types/sync";
import type { VariantView } from "@/types";
import { paymentLabel, expenseCategoryLabel, categoryLabel } from "@/lib/constants";
import { paraCsv, reais } from "@/utils/csv";

/** Cada linha é um item vendido, para dar para somar por produto na planilha. */
export function csvVendas(dados: DataSnapshot): string {
  const vendaPorId = new Map(dados.sales.map((v) => [v.id, v]));
  const linhas = dados.saleItems
    .map((item) => {
      const venda = vendaPorId.get(item.saleId);
      if (!venda) return null;
      return [
        venda.soldAt,
        venda.status,
        item.productName,
        item.colorName,
        item.size,
        item.quantity,
        reais(item.unitPriceCents),
        reais(item.unitCostCents),
        reais((item.unitPriceCents - item.unitCostCents) * item.quantity),
        paymentLabel(venda.paymentMethod),
        venda.id,
      ];
    })
    .filter((linha): linha is (string | number)[] => linha !== null);

  return paraCsv(
    [
      "data", "situacao", "produto", "cor", "tamanho", "quantidade",
      "preco_unitario", "custo_unitario", "lucro_bruto", "pagamento", "venda_id",
    ],
    linhas,
  );
}

export function csvEstoque(views: VariantView[]): string {
  const linhas = views.flatMap((view) =>
    (view.sizes.length > 0 ? view.sizes : [{ size: "—", quantity: 0, position: 0 }]).map((tamanho) => [
      view.product.name,
      categoryLabel(view.product.category),
      view.variant.colorName,
      tamanho.size,
      tamanho.quantity,
      reais(view.product.costCents),
      reais(view.product.priceCents),
      reais(view.profitCents),
      view.product.minStock,
      view.variant.sku ?? view.product.sku ?? "",
    ]),
  );

  return paraCsv(
    [
      "produto", "categoria", "cor", "tamanho", "quantidade",
      "custo", "preco_venda", "lucro_unitario", "estoque_minimo", "sku",
    ],
    linhas,
  );
}

export function csvDespesas(dados: DataSnapshot): string {
  return paraCsv(
    ["data", "descricao", "categoria", "valor"],
    dados.expenses.map((despesa) => [
      despesa.spentOn,
      despesa.description,
      expenseCategoryLabel(despesa.category),
      reais(despesa.amountCents),
    ]),
  );
}
