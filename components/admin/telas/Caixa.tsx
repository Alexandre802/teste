'use client';

import { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Lock, Unlock } from 'lucide-react';
import {
  abrirCaixa,
  caixaAberto,
  carregarMovimentosCaixa,
  fecharCaixa,
  historicoCaixa,
  registrarMovimentoCaixa,
  resumoCaixa,
} from '@/lib/admin/consultas';
import { lerCentavos, reais } from '@/lib/admin/dinheiro';
import { dataHora } from '@/lib/admin/datas';
import { FORMA_PAGAMENTO } from '@/lib/admin/rotulos';
import type { FormaPagamentoDb } from '@/lib/admin/tipos';
import TituloPagina from '../TituloPagina';
import { useSupabase } from '../SessaoProvider';
import { useConsulta } from '../useConsulta';
import { Botao } from '../ui/Botao';
import { Cartao, CabecalhoCartao } from '../ui/Cartao';
import { Aviso, Erro, Esqueleto, Vazio } from '../ui/Estados';
import { Modal } from '../ui/Modal';
import { CampoDinheiro } from '../formularios/CampoDinheiro';

/**
 * Caixa: abertura, conferência e fechamento.
 *
 * O ponto todo desta tela é o VALOR ESPERADO ser calculado, não digitado:
 *
 *   abertura + dinheiro recebido + suprimento − despesas em dinheiro − sangria
 *
 * Quem digita os dois lados da conferência não está conferindo nada. A pessoa
 * informa só o que contou na gaveta; a diferença aparece sozinha.
 *
 * Só o dinheiro FÍSICO entra nessa conta. Pix e cartão aparecem à parte, para
 * conferir com o extrato — não estão na gaveta.
 */
export default function Caixa() {
  const supabase = useSupabase();
  const [recarga, setRecarga] = useState(0);
  const [modal, setModal] = useState<'abrir' | 'fechar' | 'sangria' | 'suprimento' | null>(null);
  const [valor, setValor] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');

  const sessao = useConsulta(caixaAberto, [recarga]);
  const idSessao = sessao.dados?.id ?? null;

  const resumo = useConsulta(
    async (sb) => (idSessao ? resumoCaixa(sb, idSessao) : null),
    [idSessao, recarga],
  );
  const movimentos = useConsulta(
    async (sb) => (idSessao ? carregarMovimentosCaixa(sb, idSessao) : []),
    [idSessao, recarga],
  );
  const anteriores = useConsulta(historicoCaixa, [recarga]);

  const abrirModal = (qual: typeof modal) => {
    setValor('');
    setObservacao('');
    setErroAcao('');
    setModal(qual);
  };

  const executar = async (acao: (centavos: number) => Promise<void>, exigeValor = true) => {
    if (salvando) return;
    const centavos = lerCentavos(valor) ?? 0;
    if (exigeValor && centavos <= 0) {
      setErroAcao('Informe um valor maior que zero.');
      return;
    }

    setSalvando(true);
    setErroAcao('');
    try {
      await acao(centavos);
      setModal(null);
      setRecarga((r) => r + 1);
    } catch (e) {
      setErroAcao(e instanceof Error ? e.message : 'Não foi possível concluir a ação.');
    } finally {
      setSalvando(false);
    }
  };

  const outras = Object.entries(resumo.dados?.other_methods ?? {}) as [FormaPagamentoDb, number][];

  return (
    <>
      <TituloPagina
        titulo="Caixa"
        descricao="Abertura, sangria, suprimento e fechamento"
        acao={
          sessao.carregando ? null : sessao.dados ? (
            <Botao variante="perigo" tamanho="sm" onClick={() => abrirModal('fechar')}>
              <Lock className="h-4 w-4" aria-hidden />
              Fechar caixa
            </Botao>
          ) : (
            <Botao tamanho="sm" onClick={() => abrirModal('abrir')}>
              <Unlock className="h-4 w-4" aria-hidden />
              Abrir caixa
            </Botao>
          )
        }
      />

      {sessao.erro && <Erro mensagem={sessao.erro} aoTentarDeNovo={sessao.recarregar} />}

      {sessao.carregando ? (
        <Esqueleto className="h-64 rounded-2xl" />
      ) : !sessao.dados ? (
        <Cartao>
          <Vazio
            titulo="Nenhum caixa aberto"
            descricao="Abra o caixa informando quanto tem de troco na gaveta. A partir daí, tudo que entra e sai em dinheiro é acompanhado até o fechamento."
            acao={
              <Botao tamanho="sm" onClick={() => abrirModal('abrir')}>
                Abrir caixa
              </Botao>
            }
          />
        </Cartao>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Cartao className="lg:col-span-2">
            <CabecalhoCartao
              titulo="Caixa aberto"
              acao={
                <span className="text-xs text-[var(--admin-tinta-suave)]">
                  desde {dataHora(sessao.dados.opened_at)}
                </span>
              }
            />
            {resumo.carregando || !resumo.dados ? (
              <div className="space-y-2 px-4 pb-4 sm:px-5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Esqueleto key={i} className="h-6" />
                ))}
              </div>
            ) : (
              <dl className="border-t border-[var(--admin-borda)] px-4 py-3 sm:px-5">
                <Linha rotulo="Valor inicial" valor={reais(sessao.dados.opening_cents)} />
                <Linha
                  rotulo="Dinheiro recebido"
                  valor={reais(resumo.dados.cash_in_cents)}
                  tom="verde"
                />
                <Linha
                  rotulo="Suprimento"
                  valor={reais(resumo.dados.suprimento_cents)}
                  tom="verde"
                />
                <Linha
                  rotulo="Despesas em dinheiro"
                  valor={`− ${reais(resumo.dados.cash_out_cents)}`}
                  tom="vermelho"
                />
                <Linha
                  rotulo="Sangria"
                  valor={`− ${reais(resumo.dados.sangria_cents)}`}
                  tom="vermelho"
                />
                <Linha
                  rotulo="Esperado na gaveta"
                  valor={reais(resumo.dados.expected_cents)}
                  destaque
                />
              </dl>
            )}

            {outras.length > 0 && (
              <div className="border-t border-[var(--admin-borda)] px-4 py-3 sm:px-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-tinta-suave)]">
                  Fora da gaveta — conferir no extrato
                </p>
                <ul className="flex flex-wrap gap-x-5 gap-y-1">
                  {outras.map(([forma, valorCentavos]) => (
                    <li key={forma} className="text-sm">
                      <span className="text-[var(--admin-tinta-suave)]">
                        {FORMA_PAGAMENTO[forma]}:{' '}
                      </span>
                      <span className="font-semibold tabular-nums text-[var(--admin-tinta)]">
                        {reais(valorCentavos)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2 border-t border-[var(--admin-borda)] px-4 py-3 sm:px-5">
              <Botao variante="secundario" tamanho="sm" onClick={() => abrirModal('sangria')}>
                <ArrowUpFromLine className="h-4 w-4" aria-hidden />
                Sangria
              </Botao>
              <Botao variante="secundario" tamanho="sm" onClick={() => abrirModal('suprimento')}>
                <ArrowDownToLine className="h-4 w-4" aria-hidden />
                Suprimento
              </Botao>
            </div>
          </Cartao>

          <Cartao>
            <CabecalhoCartao titulo="Sangrias e suprimentos" />
            {movimentos.carregando ? (
              <Esqueleto className="mx-4 mb-4 h-24" />
            ) : !movimentos.dados || movimentos.dados.length === 0 ? (
              <Vazio titulo="Nenhuma movimentação" />
            ) : (
              <ul className="divide-y divide-[var(--admin-borda)] border-t border-[var(--admin-borda)]">
                {movimentos.dados.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium capitalize text-[var(--admin-tinta)]">
                        {m.type}
                      </p>
                      <p className="truncate text-xs text-[var(--admin-tinta-suave)]">
                        {dataHora(m.created_at)}
                        {m.reason ? ` · ${m.reason}` : ''}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 font-bold tabular-nums ${
                        m.type === 'sangria'
                          ? 'text-[var(--admin-vermelho)]'
                          : 'text-[var(--admin-verde)]'
                      }`}
                    >
                      {m.type === 'sangria' ? '−' : '+'} {reais(m.amount_cents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Cartao>
        </div>
      )}

      {/* ─────────────── fechamentos anteriores ─────────────── */}
      {anteriores.dados && anteriores.dados.length > 0 && (
        <Cartao className="mt-4 overflow-hidden">
          <CabecalhoCartao titulo="Fechamentos anteriores" />
          <div className="admin-rolagem-x border-t border-[var(--admin-borda)]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-[var(--admin-tinta-suave)]">
                <tr>
                  <th scope="col" className="px-4 py-2 font-semibold">Fechado em</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Esperado</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Contado</th>
                  <th scope="col" className="px-4 py-2 text-right font-semibold">Diferença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-borda)]">
                {anteriores.dados.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2.5 text-[var(--admin-tinta-suave)]">
                      {s.closed_at ? dataHora(s.closed_at) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {reais(s.expected_cents ?? 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {reais(s.counted_cents ?? 0)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-semibold tabular-nums ${
                        (s.difference_cents ?? 0) === 0
                          ? 'text-[var(--admin-verde)]'
                          : 'text-[var(--admin-vermelho)]'
                      }`}
                    >
                      {reais(s.difference_cents ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Cartao>
      )}

      {/* ─────────────── modais ─────────────── */}
      <Modal
        aberto={modal === 'abrir'}
        aoFechar={() => setModal(null)}
        titulo="Abrir caixa"
        descricao="Quanto tem de troco na gaveta agora?"
        largura="sm"
        fecharAoClicarFora={false}
        rodape={
          <Botao
            className="w-full"
            carregando={salvando}
            textoCarregando="Abrindo…"
            onClick={() =>
              void executar((c) => abrirCaixa(supabase, c, observacao), false)
            }
          >
            Abrir caixa
          </Botao>
        }
      >
        <CampoDinheiro
          id="caixa-abertura"
          rotulo="Valor inicial"
          valor={valor}
          aoMudar={setValor}
          autoFocus
        />
        {erroAcao && (
          <div className="mt-3">
            <Aviso tipo="erro">{erroAcao}</Aviso>
          </div>
        )}
      </Modal>

      <Modal
        aberto={modal === 'fechar'}
        aoFechar={() => setModal(null)}
        titulo="Fechar caixa"
        descricao={`Esperado na gaveta: ${reais(resumo.dados?.expected_cents ?? 0)}`}
        largura="sm"
        fecharAoClicarFora={false}
        rodape={
          <Botao
            variante="perigo"
            className="w-full"
            carregando={salvando}
            textoCarregando="Fechando…"
            onClick={() =>
              void executar(
                async (c) => {
                  if (idSessao) await fecharCaixa(supabase, idSessao, c, observacao);
                },
                false,
              )
            }
          >
            Fechar caixa
          </Botao>
        }
      >
        <CampoDinheiro
          id="caixa-contado"
          rotulo="Quanto você contou na gaveta"
          valor={valor}
          aoMudar={setValor}
          autoFocus
        />
        <div className="mt-3">
          <label htmlFor="caixa-obs" className="admin-rotulo">
            Observação <span className="font-normal text-[var(--admin-tinta-suave)]">(opcional)</span>
          </label>
          <input
            id="caixa-obs"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            maxLength={300}
            className="admin-campo"
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--admin-tinta-suave)]">
          Conte só o dinheiro em espécie. Pix e cartão não estão na gaveta — eles aparecem à parte,
          para conferir com o extrato.
        </p>
        {erroAcao && (
          <div className="mt-3">
            <Aviso tipo="erro">{erroAcao}</Aviso>
          </div>
        )}
      </Modal>

      <Modal
        aberto={modal === 'sangria' || modal === 'suprimento'}
        aoFechar={() => setModal(null)}
        titulo={modal === 'sangria' ? 'Sangria' : 'Suprimento de caixa'}
        descricao={
          modal === 'sangria'
            ? 'Dinheiro retirado da gaveta.'
            : 'Dinheiro colocado na gaveta.'
        }
        largura="sm"
        fecharAoClicarFora={false}
        rodape={
          <Botao
            className="w-full"
            carregando={salvando}
            textoCarregando="Registrando…"
            onClick={() =>
              void executar(async (c) => {
                if (!idSessao || !modal) return;
                await registrarMovimentoCaixa(supabase, {
                  session_id: idSessao,
                  type: modal === 'sangria' ? 'sangria' : 'suprimento',
                  amount_cents: c,
                  reason: observacao.trim(),
                });
              })
            }
          >
            Registrar
          </Botao>
        }
      >
        <CampoDinheiro
          id="movimento-valor"
          rotulo="Valor"
          valor={valor}
          aoMudar={setValor}
          obrigatorio
          autoFocus
        />
        <div className="mt-3">
          <label htmlFor="movimento-motivo" className="admin-rotulo">
            Motivo
          </label>
          <input
            id="movimento-motivo"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            maxLength={200}
            placeholder={modal === 'sangria' ? 'Ex.: depósito no banco' : 'Ex.: reforço de troco'}
            className="admin-campo"
          />
        </div>
        {erroAcao && (
          <div className="mt-3">
            <Aviso tipo="erro">{erroAcao}</Aviso>
          </div>
        )}
      </Modal>
    </>
  );
}

function Linha({
  rotulo,
  valor,
  tom = 'neutro',
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  tom?: 'neutro' | 'verde' | 'vermelho';
  destaque?: boolean;
}) {
  const cores = {
    neutro: 'text-[var(--admin-tinta)]',
    verde: 'text-[var(--admin-verde)]',
    vermelho: 'text-[var(--admin-vermelho)]',
  };
  return (
    <div
      className={`flex items-baseline justify-between gap-3 border-b border-[var(--admin-borda)] py-2.5 last:border-0 ${
        destaque ? 'mt-1 rounded-lg bg-slate-50 px-2' : ''
      }`}
    >
      <dt
        className={
          destaque ? 'font-bold text-[var(--admin-tinta)]' : 'text-sm text-[var(--admin-tinta-suave)]'
        }
      >
        {rotulo}
      </dt>
      <dd className={`shrink-0 font-bold tabular-nums ${destaque ? 'text-lg' : ''} ${cores[tom]}`}>
        {valor}
      </dd>
    </div>
  );
}
