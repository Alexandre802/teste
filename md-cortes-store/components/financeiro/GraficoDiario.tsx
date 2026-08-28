"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayPoint } from "@/lib/selectors";
import { money, moneyAxis } from "@/lib/format";

/**
 * Uma série por gráfico, sempre.
 *
 * Faturamento e lucro juntos no mesmo desenho exigiriam duas escalas — e ouro
 * com verde é justamente o par que quem tem daltonismo protan não separa
 * (ΔE 3,6). Quando as duas leituras são necessárias, vão dois gráficos.
 */
const OURO_LINHA = "#B87C10";

// O gráfico mede o container, então no servidor não há o que desenhar.
const SEM_INSCRICAO = () => () => {};
const NO_CLIENTE = () => true;
const NO_SERVIDOR = () => false;

export function GraficoDiario({
  dados,
  chave = "revenue",
  titulo,
  altura = 190,
}: {
  dados: DayPoint[];
  chave?: "revenue" | "profit";
  titulo: string;
  altura?: number;
}) {
  const montado = useSyncExternalStore(SEM_INSCRICAO, NO_CLIENTE, NO_SERVIDOR);

  const temValor = dados.some((ponto) => ponto[chave] !== 0);

  if (!montado) return <div style={{ height: altura }} aria-hidden />;

  if (!temValor) {
    return (
      <div
        className="flex items-center justify-center rounded-suave bg-areia text-[14px] text-cinza"
        style={{ height: altura }}
      >
        Sem movimento no período
      </div>
    );
  }

  return (
    <div style={{ height: altura }} role="img" aria-label={titulo}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ top: 8, right: 8, bottom: 0, left: -6 }}>
          <defs>
            <linearGradient id={`preenche-${chave}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C98A13" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#C98A13" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#EDEDEA" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={18}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={64}
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            tickFormatter={(valor: number) => moneyAxis(valor)}
          />
          <Tooltip
            cursor={{ stroke: "#DEBE7A", strokeWidth: 1 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-suave border border-borda bg-branco px-3 py-2 shadow-flutuante">
                  <p className="text-[12px] text-cinza">{label}</p>
                  <p className="tabular text-[15px] font-bold text-tinta">
                    {money(Number(payload[0]?.value ?? 0))}
                  </p>
                </div>
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey={chave}
            stroke={OURO_LINHA}
            strokeWidth={2}
            fill={`url(#preenche-${chave})`}
            dot={{ r: 3, fill: "#fff", stroke: OURO_LINHA, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: OURO_LINHA, stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
