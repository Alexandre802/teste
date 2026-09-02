'use client';

import { useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { apagarDespesa, carregarDespesas } from '@/lib/admin/consultas';
import { baixarCsv, paraCsv } from '@/lib/admin/csv';
import { reais, reaisSemSimbolo } from '@/lib/admin/dinheiro';
import { dataHora, hora, isoDia, type PeriodoId } from '@/lib/admin/datas';
import { FORMA_PAGAMENTO } from '@/lib/admin/rotulos';
import type { Despesa } from '@/lib/admin/tipos';
import FiltroPeriodo, { useFiltroPeriodo } from '../FiltroPeriodo';
import FormularioDespesa from '../formularios/FormularioDespesa';
import TituloPagina from '../TituloPagina';
import { useSupabase } from '../SessaoProvider';
import { useConsulta } from '../useConsulta';
import { Botao } from '../ui/Botao';
import { Cartao } from '../ui/Cartao';
import { Aviso, Erro, EsqueletoLista, Vazio } from '../ui/Estados';
import { Modal } from '../ui/Modal';

const FILTROS: PeriodoId[] = ['hoje', 'ontem', 'sete-dias', 'trinta-dias', 'este-mes', 'personalizado'];

export default function Despesas() {
  const supabase = useSupabase();
  const filtro = useFiltroPeriodo('hoje');
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [aApagar, setAApagar] = useState<Despesa | null>(null);
  const [apagando, setApagando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const [recarga, setRecarga] = useState(0);

  const { de, ate } = filtro.periodo;
  const despesas = useConsulta(
    (sb) => carregarDespesas(sb, de, ate),
    [de.toISOString(), ate.toISOString(), recarga],
  );

  const total = (despesas.dados ?? []).reduce((s, d) => s + d.amount_cents, 0);

  const confirmarApagar = async () => {
    if (!aApagar || apagando) return;
    setApagando(true);
    setErroAcao('');
    try {
      await apagarDespesa(supabase, aApagar.id);
      setAApagar(null);
      setRecarga((r) => r + 1);
    } catch (e) {
      setErroAcao(e instanceof Error ? e.message : 'Não foi possível apagar a despesa.');
    } finally {
      setApagando(false);
    }
  };

  const exportar = () => {
    if (!despesas.dados?.length) return;
    const csv = paraCsv(
      ['Data', 'Categoria', 'Descrição', 'Fornecedor', 'Forma de pagamento', 'Valor', 'Observação'],
      despesas.dados.map((d) => [
        dataHora(d.occurred_at),
        d.categoria?.name ?? 'Sem categoria',
        d.description,
        d.supplier,
        FORMA_PAGAMENTO[d.method],
        reaisSemSimbolo(d.amount_cents),
        d.notes,
      ]),
    );
    baixarCsv(`despesas-${isoDia()}`, csv);
  };

  return (
    <>
      <TituloPagina
        titulo="Despesas"
        acao={
          <div className="flex items-center gap-2">
            <FiltroPeriodo
              id={filtro.id}
              aoTrocar={filtro.setId}
              intervalo={filtro.intervalo}
              aoTrocarIntervalo={filtro.setIntervalo}
              periodo={filtro.periodo}
              opcoes={FILTROS}
            />
            <Botao
              variante="secundario"
              tamanho="sm"
              onClick={exportar}
              disabled={!despesas.dados?.length}
            >
              <Download className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">CSV</span>
            </Botao>
            <Botao tamanho="sm" onClick={() => setFormularioAberto(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Nova despesa</span>
            </Botao>
          </div>
        }
      />

      <Cartao className="mb-4 flex items-baseline justify-between gap-3 p-4">
        <span className="text-sm font-medium text-[var(--admin-tinta-suave)]">Total do período</span>
        <span className="text-xl font-extrabold tabular-nums text-[var(--admin-vermelho)] sm:text-2xl">
          {reais(total)}
        </span>
      </Cartao>

      {despesas.carregando ? (
        <EsqueletoLista linhas={6} />
      ) : despesas.erro ? (
        <Erro mensagem={despesas.erro} aoTentarDeNovo={despesas.recarregar} />
      ) : !despesas.dados || despesas.dados.length === 0 ? (
        <Cartao>
          <Vazio
            titulo="Nenhuma despesa registrada"
            descricao="Compra de ingrediente, gás, embalagem, conta de luz — tudo o que sai do caixa entra aqui."
            acao={
              <Botao tamanho="sm" onClick={() => setFormularioAberto(true)}>
                <Plus className="h-4 w-4" aria-hidden />
                Nova despesa
              </Botao>
            }
          />
        </Cartao>
      ) : (
        <Cartao className="overflow-hidden">
          <ul className="divide-y divide-[var(--admin-borda)]">
            {despesas.dados.map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--admin-tinta)]">
                    {d.description}
                  </p>
                  <p className="truncate text-xs text-[var(--admin-tinta-suave)]">
                    {hora(d.occurred_at)} · {d.categoria?.name ?? 'Sem categoria'} ·{' '}
                    {FORMA_PAGAMENTO[d.method]}
                    {d.supplier ? ` · ${d.supplier}` : ''}
                  </p>
                </div>
                <span className="shrink-0 font-bold tabular-nums text-[var(--admin-vermelho)]">
                  {reais(d.amount_cents)}
                </span>
                <button
                  type="button"
                  onClick={() => setAApagar(d)}
                  aria-label={`Apagar despesa ${d.description}`}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-[var(--admin-vermelho)]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </Cartao>
      )}

      <FormularioDespesa
        aberto={formularioAberto}
        aoFechar={() => setFormularioAberto(false)}
        aoSalvar={() => setRecarga((r) => r + 1)}
      />

      <Modal
        aberto={aApagar !== null}
        aoFechar={() => setAApagar(null)}
        titulo="Apagar despesa"
        largura="sm"
        rodape={
          <div className="flex gap-2">
            <Botao variante="secundario" className="flex-1" onClick={() => setAApagar(null)}>
              Cancelar
            </Botao>
            <Botao
              variante="perigo"
              className="flex-1"
              carregando={apagando}
              textoCarregando="Apagando…"
              onClick={() => void confirmarApagar()}
            >
              Apagar
            </Botao>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-[var(--admin-tinta)]">
          Apagar <strong>{aApagar?.description}</strong> de{' '}
          <strong>{reais(aApagar?.amount_cents ?? 0)}</strong>? Os relatórios do período vão ser
          recalculados sem ela.
        </p>
        {erroAcao && (
          <div className="mt-3">
            <Aviso tipo="erro">{erroAcao}</Aviso>
          </div>
        )}
      </Modal>
    </>
  );
}
