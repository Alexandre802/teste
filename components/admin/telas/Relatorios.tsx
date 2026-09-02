'use client';

import { Download } from 'lucide-react';
import { carregarRelatorio } from '@/lib/admin/consultas';
import { baixarCsv, paraCsv } from '@/lib/admin/csv';
import { fatia, reais, reaisSemSimbolo } from '@/lib/admin/dinheiro';
import { isoDia, rotuloIntervalo } from '@/lib/admin/datas';
import { FORMA_PAGAMENTO, TIPO_PEDIDO } from '@/lib/admin/rotulos';
import type { Relatorio } from '@/lib/admin/tipos';
import FiltroPeriodo, { useFiltroPeriodo } from '../FiltroPeriodo';
import TituloPagina from '../TituloPagina';
import { useConsulta } from '../useConsulta';
import { Botao } from '../ui/Botao';
import { Cartao, CabecalhoCartao } from '../ui/Cartao';
import { Erro, Esqueleto, Vazio } from '../ui/Estados';

/**
 * Relatórios.
 *
 * Todos os números saem da MESMA função do banco que alimenta o resumo
 * (`comida_caseira_report`). Nenhuma conta é refeita aqui — se o lucro
 * líquido fosse somado de novo em JavaScript, um dia as duas telas
 * divergiriam e ninguém saberia qual acreditar.
 */
export default function Relatorios() {
  const filtro = useFiltroPeriodo('este-mes');
  const { de, ate } = filtro.periodo;

  // agrupa por dia em períodos curtos e por mês nos longos: 365 barras
  // diárias num gráfico de celular não se lê
  const dias = Math.round((ate.getTime() - de.getTime()) / 86_400_000);
  const bucket = dias > 92 ? 'month' : dias > 31 ? 'week' : 'day';

  const relatorio = useConsulta<Relatorio>(
    (sb) => carregarRelatorio(sb, de, ate, bucket),
    [de.toISOString(), ate.toISOString(), bucket],
  );

  const exportar = () => {
    const r = relatorio.dados;
    if (!r) return;

    const linhas: unknown[][] = [
      ['Período', rotuloIntervalo(filtro.periodo)],
      [],
      ['Faturamento bruto', reaisSemSimbolo(r.money.gross_cents)],
      ['Recebimentos', reaisSemSimbolo(r.money.received_cents)],
      ['A receber', reaisSemSimbolo(r.money.pending_cents)],
      ['Custo dos produtos', reaisSemSimbolo(r.money.cost_cents)],
      ['Despesas', reaisSemSimbolo(r.money.expenses_cents)],
      ['Lucro bruto', reaisSemSimbolo(r.money.gross_profit_cents)],
      ['Lucro líquido', reaisSemSimbolo(r.money.net_profit_cents)],
      ['Pedidos', r.orders.total],
      ['Pedidos faturados', r.orders.billed],
      ['Pedidos cancelados', r.orders.cancelled],
      ['Ticket médio', reaisSemSimbolo(r.money.ticket_cents)],
      [],
      ['Produtos mais vendidos', 'Quantidade', 'Faturamento'],
      ...r.top_products.map((p) => [p.nome, p.quantidade, reaisSemSimbolo(p.valor_cents)]),
      [],
      ['Formas de pagamento', 'Recebimentos', 'Valor'],
      ...r.by_method.map((m) => [
        FORMA_PAGAMENTO[m.forma],
        m.quantidade,
        reaisSemSimbolo(m.valor_cents),
      ]),
      [],
      ['Entrega x retirada', 'Pedidos', 'Faturamento'],
      ...r.by_type.map((t) => [TIPO_PEDIDO[t.tipo], t.quantidade, reaisSemSimbolo(t.valor_cents)]),
      [],
      ['Horário', 'Pedidos', 'Faturamento'],
      ...r.by_hour.map((h) => [
        `${String(h.hora).padStart(2, '0')}h–${String(h.hora + 1).padStart(2, '0')}h`,
        h.quantidade,
        reaisSemSimbolo(h.valor_cents),
      ]),
    ];

    baixarCsv(`relatorio-${isoDia()}`, paraCsv(['Relatório financeiro', '', ''], linhas));
  };

  return (
    <>
      <TituloPagina
        titulo="Relatórios"
        descricao={rotuloIntervalo(filtro.periodo)}
        acao={
          <div className="flex items-center gap-2">
            <FiltroPeriodo
              id={filtro.id}
              aoTrocar={filtro.setId}
              intervalo={filtro.intervalo}
              aoTrocarIntervalo={filtro.setIntervalo}
              periodo={filtro.periodo}
            />
            <Botao
              variante="secundario"
              tamanho="sm"
              onClick={exportar}
              disabled={!relatorio.dados}
            >
              <Download className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Exportar</span>
            </Botao>
          </div>
        }
      />

      {relatorio.carregando ? (
        <div className="space-y-4">
          <Esqueleto className="h-72 rounded-2xl" />
          <Esqueleto className="h-56 rounded-2xl" />
        </div>
      ) : relatorio.erro || !relatorio.dados ? (
        <Erro
          mensagem={relatorio.erro || 'Não foi possível montar o relatório.'}
          aoTentarDeNovo={relatorio.recarregar}
        />
      ) : (
        <Conteudo r={relatorio.dados} />
      )}
    </>
  );
}

function Conteudo({ r }: { r: Relatorio }) {
  const totalItens = r.top_products.reduce((s, p) => s + Number(p.quantidade), 0);
  const picoHora = Math.max(0, ...r.by_hour.map((h) => Number(h.quantidade)));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* ─────────────── números do período ─────────────── */}
      <Cartao className="lg:col-span-2">
        <CabecalhoCartao titulo="Números do período" />
        <dl className="grid grid-cols-2 gap-px border-t border-[var(--admin-borda)] bg-[var(--admin-borda)] sm:grid-cols-3 lg:grid-cols-4">
          <Numero rotulo="Faturamento bruto" valor={reais(r.money.gross_cents)} />
          <Numero rotulo="Recebimentos" valor={reais(r.money.received_cents)} tom="verde" />
          <Numero rotulo="A receber" valor={reais(r.money.pending_cents)} tom="ambar" />
          <Numero rotulo="Despesas" valor={reais(r.money.expenses_cents)} tom="vermelho" />
          <Numero rotulo="Custo dos produtos" valor={reais(r.money.cost_cents)} />
          <Numero rotulo="Lucro bruto" valor={reais(r.money.gross_profit_cents)} />
          <Numero
            rotulo="Lucro líquido"
            valor={reais(r.money.net_profit_cents)}
            tom={r.money.net_profit_cents >= 0 ? 'verde' : 'vermelho'}
          />
          <Numero rotulo="Ticket médio" valor={reais(r.money.ticket_cents)} />
          <Numero rotulo="Pedidos" valor={String(r.orders.total)} />
          <Numero rotulo="Pedidos faturados" valor={String(r.orders.billed)} />
          <Numero rotulo="Cancelados" valor={String(r.orders.cancelled)} />
          <Numero rotulo="Itens vendidos" valor={String(totalItens)} />
        </dl>

        {r.money.cost_cents === 0 && r.money.gross_cents > 0 && (
          <p className="border-t border-[var(--admin-borda)] px-4 py-3 text-xs leading-relaxed text-[var(--admin-tinta-suave)] sm:px-5">
            O custo aparece zerado porque os produtos ainda não têm custo informado. Preencha em
            Produtos para o lucro sair certo — sem custo, o lucro bruto fica igual ao faturamento.
          </p>
        )}
      </Cartao>

      {/* ─────────────── mais vendidos ─────────────── */}
      <Cartao>
        <CabecalhoCartao titulo="Produtos mais vendidos" />
        {r.top_products.length === 0 ? (
          <Vazio titulo="Nenhum item vendido no período" />
        ) : (
          <ol className="divide-y divide-[var(--admin-borda)] border-t border-[var(--admin-borda)]">
            {r.top_products.map((p, i) => (
              <li key={p.product_id} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                <span className="w-5 shrink-0 text-sm font-bold text-[var(--admin-tinta-suave)]">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--admin-tinta)]">
                  {p.nome}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-[var(--admin-tinta-suave)]">
                  {p.quantidade}x
                </span>
                <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--admin-tinta)]">
                  {reais(p.valor_cents)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Cartao>

      {/* ─────────────── horários ─────────────── */}
      <Cartao>
        <CabecalhoCartao titulo="Horários com mais pedidos" />
        {r.by_hour.length === 0 ? (
          <Vazio titulo="Sem pedidos no período" />
        ) : (
          <ul className="space-y-2 border-t border-[var(--admin-borda)] px-4 py-4 sm:px-5">
            {r.by_hour.map((h) => (
              <li key={h.hora} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs tabular-nums text-[var(--admin-tinta-suave)]">
                  {String(h.hora).padStart(2, '0')}h–{String(h.hora + 1).padStart(2, '0')}h
                </span>
                {/*
                  Barra proporcional ao pico do próprio período, não a um teto
                  fixo: assim o horário mais forte sempre ocupa a largura toda
                  e a comparação entre as faixas continua legível.
                */}
                <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-[var(--admin-laranja)]"
                    style={{ width: `${picoHora ? (Number(h.quantidade) / picoHora) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums text-[var(--admin-tinta)]">
                  {h.quantidade}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Cartao>

      {/* ─────────────── formas de pagamento ─────────────── */}
      <Cartao>
        <CabecalhoCartao titulo="Formas de pagamento" />
        {r.by_method.length === 0 ? (
          <Vazio titulo="Nenhum recebimento no período" />
        ) : (
          <Tabela
            colunas={['Forma', 'Recebimentos', '%', 'Valor']}
            linhas={r.by_method.map((m) => {
              const total = r.by_method.reduce((s, x) => s + Math.max(0, x.valor_cents), 0);
              return [
                FORMA_PAGAMENTO[m.forma],
                String(m.quantidade),
                `${Math.round(fatia(Math.max(0, m.valor_cents), total))}%`,
                reais(m.valor_cents),
              ];
            })}
          />
        )}
      </Cartao>

      {/* ─────────────── entrega x retirada ─────────────── */}
      <Cartao>
        <CabecalhoCartao titulo="Entrega × retirada" />
        {r.by_type.length === 0 ? (
          <Vazio titulo="Sem pedidos faturados no período" />
        ) : (
          <Tabela
            colunas={['Tipo', 'Pedidos', 'Faturamento']}
            linhas={r.by_type.map((t) => [
              TIPO_PEDIDO[t.tipo],
              String(t.quantidade),
              reais(t.valor_cents),
            ])}
          />
        )}
      </Cartao>

      {/* ─────────────── despesas por categoria ─────────────── */}
      <Cartao className="lg:col-span-2">
        <CabecalhoCartao titulo="Despesas por categoria" />
        {r.expenses_by_category.length === 0 ? (
          <Vazio titulo="Nenhuma despesa no período" />
        ) : (
          <Tabela
            colunas={['Categoria', 'Lançamentos', 'Valor']}
            linhas={r.expenses_by_category.map((c) => [
              c.categoria,
              String(c.quantidade),
              reais(c.valor_cents),
            ])}
          />
        )}
      </Cartao>
    </div>
  );
}

function Numero({
  rotulo,
  valor,
  tom = 'neutro',
}: {
  rotulo: string;
  valor: string;
  tom?: 'neutro' | 'verde' | 'vermelho' | 'ambar';
}) {
  const cores = {
    neutro: 'text-[var(--admin-tinta)]',
    verde: 'text-[var(--admin-verde)]',
    vermelho: 'text-[var(--admin-vermelho)]',
    ambar: 'text-amber-600',
  };
  return (
    <div className="bg-white px-4 py-3">
      <dt className="text-xs text-[var(--admin-tinta-suave)]">{rotulo}</dt>
      <dd className={`mt-0.5 text-base font-extrabold tabular-nums sm:text-lg ${cores[tom]}`}>
        {valor}
      </dd>
    </div>
  );
}

function Tabela({ colunas, linhas }: { colunas: string[]; linhas: string[][] }) {
  return (
    <div className="admin-rolagem-x border-t border-[var(--admin-borda)]">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-[var(--admin-tinta-suave)]">
          <tr>
            {colunas.map((c, i) => (
              <th
                key={c}
                scope="col"
                className={`px-4 py-2 font-semibold ${i > 0 ? 'text-right' : ''}`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--admin-borda)]">
          {linhas.map((linha) => (
            <tr key={linha[0]}>
              {linha.map((celula, i) => (
                <td
                  key={i}
                  className={`px-4 py-2.5 ${
                    i > 0
                      ? 'text-right tabular-nums'
                      : 'font-medium text-[var(--admin-tinta)]'
                  } ${i === linha.length - 1 ? 'font-semibold' : ''}`}
                >
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
