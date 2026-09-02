'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { reais } from '@/lib/admin/dinheiro';
import type { Relatorio } from '@/lib/admin/tipos';

/**
 * Vendas do período.
 *
 * Barra, não linha: cada barra é um dia fechado, uma quantidade — e
 * quantidade se compara por altura. Linha sugere continuidade entre os
 * pontos, que aqui não existe (não há "meio-dia e meio" entre terça e quarta).
 *
 * O eixo Y mostra valor em reais inteiros; os centavos poluem sem informar
 * nada em escala de gráfico. O número exato está no tooltip.
 */

const MES_CURTO = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
});

function rotuloBaliza(iso: string, bucket: Relatorio['bucket']): string {
  // as balizas vêm como data pura ("2026-09-02"), sem hora: lidas como UTC
  // para não escorregar um dia no fuso do navegador
  const data = new Date(`${iso}T00:00:00Z`);
  if (bucket === 'month') {
    return new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(data);
  }
  return MES_CURTO.format(data);
}

export default function GraficoVendas({ relatorio }: { relatorio: Relatorio }) {
  const dados = relatorio.series.map((s) => ({
    rotulo: rotuloBaliza(s.bucket, relatorio.bucket),
    valor: s.valor_cents / 100,
    pedidos: s.pedidos,
  }));

  const temVenda = dados.some((d) => d.valor > 0);

  if (!temVenda) {
    return (
      <div className="grid h-56 place-items-center px-6 text-center">
        <p className="text-sm text-[var(--admin-tinta-suave)]">
          Nenhuma venda confirmada neste período ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
          <XAxis
            dataKey="rotulo"
            tick={{ fontSize: 11, fill: '#667085' }}
            tickLine={false}
            axisLine={{ stroke: '#e6e8ec' }}
            // com 30 dias, os rótulos se sobrepõem: o Recharts pula alguns
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#667085' }}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(v: number) =>
              v >= 1000 ? `R$ ${(v / 1000).toFixed(1).replace('.', ',')} mil` : `R$ ${v}`
            }
          />
          <Tooltip
            cursor={{ fill: 'rgba(242, 98, 12, 0.06)' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e6e8ec',
              fontSize: 13,
              boxShadow: '0 4px 12px rgb(16 24 40 / 0.08)',
            }}
            formatter={(valor: number, nome: string) =>
              nome === 'valor'
                ? [reais(Math.round(valor * 100)), 'Vendas']
                : [String(valor), 'Pedidos']
            }
            labelFormatter={(r: string) => `Dia ${r}`}
          />
          <Bar dataKey="valor" fill="#f2620c" radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
