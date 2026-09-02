"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatarCentavos } from "@/lib/dinheiro";

/**
 * Vendas ao longo do tempo.
 *
 * Uma série só: o título já diz o que é, então não existe legenda para ler.
 * A cor não carrega identidade nenhuma aqui — quem carrega é o eixo. Por isso
 * um tom só, o laranja da casa, em vez de uma paleta por categoria, que só
 * acrescentaria risco de leitura para quem enxerga cor de outro jeito.
 */
export function GraficoVendas({
  dados,
}: {
  dados: { rotulo: string; valor_cents: number; pedidos: number }[];
}) {
  if (dados.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-tinta-suave">
        Sem vendas no período.
      </p>
    );
  }

  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={dados}
          margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
        >
          <defs>
            <linearGradient id="preenchimentoVendas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e75c16" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#e75c16" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Grade discreta: ela orienta, não compete com os dados. */}
          <CartesianGrid stroke="#ecebe9" vertical={false} />

          <XAxis
            dataKey="rotulo"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#857c76", fontSize: 12 }}
            minTickGap={16}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: "#857c76", fontSize: 12 }}
            tickFormatter={(valor: number) =>
              valor >= 100_000
                ? `${Math.round(valor / 100_000)}k`
                : String(Math.round(valor / 100))
            }
          />

          <Tooltip
            cursor={{ stroke: "#857c76", strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const ponto = payload[0].payload as {
                valor_cents: number;
                pedidos: number;
              };
              return (
                <div className="rounded-carta border border-borda bg-white px-3 py-2 shadow-carta">
                  <p className="text-[12px] font-semibold text-tinta-media">
                    {String(label)}
                  </p>
                  <p className="text-[15px] font-extrabold text-tinta">
                    {formatarCentavos(ponto.valor_cents)}
                  </p>
                  <p className="text-[12px] text-tinta-suave">
                    {ponto.pedidos} {ponto.pedidos === 1 ? "pedido" : "pedidos"}
                  </p>
                </div>
              );
            }}
          />

          <Area
            type="monotone"
            dataKey="valor_cents"
            stroke="#e75c16"
            strokeWidth={2}
            fill="url(#preenchimentoVendas)"
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
