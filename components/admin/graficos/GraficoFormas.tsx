'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { fatia, reais } from '@/lib/admin/dinheiro';
import { COR_FORMA, FORMA_PAGAMENTO } from '@/lib/admin/rotulos';
import type { Relatorio } from '@/lib/admin/tipos';

/**
 * Formas de pagamento dos RECEBIMENTOS.
 *
 * A base são os lançamentos de entrada, não os pedidos: é o dinheiro que
 * entrou de verdade. Pedido pendente ainda não escolheu lado nenhum deste
 * gráfico — quem paga em dinheiro pode acabar pagando no Pix na porta.
 *
 * Rosca, não pizza: o buraco no meio evita comparar ângulos que se encontram
 * no centro, que é onde a leitura de pizza mais erra.
 */
export default function GraficoFormas({ relatorio }: { relatorio: Relatorio }) {
  // estorno é negativo e não é "forma de pagamento recebida": fora do gráfico
  const dados = relatorio.by_method
    .filter((m) => m.valor_cents > 0)
    .sort((a, b) => b.valor_cents - a.valor_cents);

  const total = dados.reduce((s, d) => s + d.valor_cents, 0);

  if (dados.length === 0) {
    return (
      <div className="grid h-48 place-items-center px-6 text-center">
        <p className="text-sm text-[var(--admin-tinta-suave)]">
          Nenhum recebimento registrado neste período.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor_cents"
              nameKey="forma"
              innerRadius={44}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
            >
              {dados.map((d) => (
                <Cell key={d.forma} fill={COR_FORMA[d.forma]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e6e8ec',
                fontSize: 13,
              }}
              formatter={(valor: number, nome: string) => [
                reais(valor),
                FORMA_PAGAMENTO[nome as keyof typeof FORMA_PAGAMENTO] ?? nome,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/*
        A legenda é uma lista de verdade, não a legenda do Recharts: assim o
        valor e o percentual ficam alinhados em coluna e dá para ler de relance.
      */}
      <ul className="w-full min-w-0 flex-1 space-y-2">
        {dados.map((d) => (
          <li key={d.forma} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: COR_FORMA[d.forma] }}
            />
            <span className="min-w-0 flex-1 truncate text-[var(--admin-tinta)]">
              {FORMA_PAGAMENTO[d.forma]}
            </span>
            <span className="shrink-0 tabular-nums text-[var(--admin-tinta-suave)]">
              {Math.round(fatia(d.valor_cents, total))}%
            </span>
            <span className="w-20 shrink-0 text-right font-semibold tabular-nums text-[var(--admin-tinta)]">
              {reais(d.valor_cents)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
