import { formatarCentavos } from "@/lib/dinheiro";

/**
 * Comparação de valores entre categorias.
 *
 * Barras em HTML puro: são de quatro a dez linhas com rótulo, valor e
 * percentual ao lado. Uma pizza aqui só dificultaria a comparação, e pintar
 * cada categoria de uma cor não acrescentaria informação nenhuma — o nome já
 * está escrito na frente da barra.
 */
export function BarrasHorizontais({
  itens,
  vazio = "Nada no período.",
}: {
  itens: {
    id: string;
    rotulo: string;
    valor_cents: number;
    detalhe?: string;
  }[];
  vazio?: string;
}) {
  if (itens.length === 0) {
    return <p className="py-8 text-center text-sm text-tinta-suave">{vazio}</p>;
  }

  const total = itens.reduce((soma, item) => soma + item.valor_cents, 0);
  const maior = Math.max(...itens.map((item) => item.valor_cents), 1);

  return (
    <ul className="space-y-3">
      {itens.map((item) => {
        const fatia =
          total > 0 ? Math.round((item.valor_cents / total) * 100) : 0;
        return (
          <li key={item.id}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[14px] font-semibold text-tinta">
                {item.rotulo}
              </span>
              <span className="shrink-0 text-[14px] font-bold text-tinta">
                {formatarCentavos(item.valor_cents)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-nevoa"
                role="img"
                aria-label={`${item.rotulo}: ${formatarCentavos(item.valor_cents)}, ${fatia}% do período`}
              >
                <div
                  className="h-full rounded-full bg-laranja"
                  style={{
                    width: `${Math.max((item.valor_cents / maior) * 100, 2)}%`,
                  }}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-[12px] text-tinta-suave">
                {fatia}%{item.detalhe ? ` · ${item.detalhe}` : ""}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
