'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { carregarProdutos, salvarCustoProduto, sincronizarProdutos } from '@/lib/admin/consultas';
import { lerCentavos, reais } from '@/lib/admin/dinheiro';
import { products } from '@/lib/catalog';
import type { ProdutoAdmin } from '@/lib/admin/tipos';
import TituloPagina from '../TituloPagina';
import { useSupabase } from '../SessaoProvider';
import { useConsulta } from '../useConsulta';
import { Botao } from '../ui/Botao';
import { Cartao } from '../ui/Cartao';
import { Aviso, Erro, EsqueletoLista, Vazio } from '../ui/Estados';
import { Modal } from '../ui/Modal';
import { CampoDinheiro } from '../formularios/CampoDinheiro';

/**
 * Produtos e custo.
 *
 * Duas informações com donos diferentes:
 *
 *   PREÇO  vem do cardápio do site. Sincronizado, nunca digitado aqui — dois
 *          lugares para editar preço é como o cliente vê R$ 25 e a cozinha
 *          cobra R$ 28.
 *   CUSTO  só existe aqui. Nunca aparece no site, em nenhuma rota pública,
 *          em nenhum JSON — a RLS nem devolve esta tabela para quem não é
 *          administrador.
 *
 * Sem o custo preenchido, o lucro bruto do relatório sai igual ao
 * faturamento. O aviso no topo diz isso, em vez de deixar a dona acreditar
 * numa margem de 100%.
 */
export default function Produtos() {
  const supabase = useSupabase();
  const [recarga, setRecarga] = useState(0);
  const [emEdicao, setEmEdicao] = useState<ProdutoAdmin | null>(null);
  const [custo, setCusto] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const lista = useConsulta(carregarProdutos, [recarga]);

  const abrirEdicao = (p: ProdutoAdmin) => {
    setEmEdicao(p);
    setCusto(p.cost_cents === null ? '' : (p.cost_cents / 100).toFixed(2).replace('.', ','));
    setErroAcao('');
  };

  const salvar = async () => {
    if (!emEdicao || salvando) return;
    const centavos = custo.trim() === '' ? null : lerCentavos(custo);
    if (custo.trim() !== '' && (centavos === null || centavos < 0)) {
      setErroAcao('Informe um custo válido, ou deixe em branco.');
      return;
    }

    setSalvando(true);
    setErroAcao('');
    try {
      await salvarCustoProduto(supabase, emEdicao.id, centavos);
      setEmEdicao(null);
      setRecarga((r) => r + 1);
    } catch (e) {
      setErroAcao(e instanceof Error ? e.message : 'Não foi possível salvar o custo.');
    } finally {
      setSalvando(false);
    }
  };

  const sincronizar = async () => {
    if (sincronizando) return;
    setSincronizando(true);
    setAviso('');
    try {
      const quantidade = await sincronizarProdutos(
        supabase,
        products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          // o catálogo trabalha em reais; o banco, em centavos
          price_cents: Math.round(p.price * 100),
          active: p.available,
        })),
      );
      setAviso(`${quantidade} itens do cardápio sincronizados. Os custos foram preservados.`);
      setRecarga((r) => r + 1);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não foi possível sincronizar.');
    } finally {
      setSincronizando(false);
    }
  };

  const semCusto = (lista.dados ?? []).filter((p) => p.cost_cents === null).length;

  return (
    <>
      <TituloPagina
        titulo="Produtos"
        descricao="Preço vem do cardápio. O custo é só seu."
        acao={
          <Botao
            variante="secundario"
            tamanho="sm"
            carregando={sincronizando}
            textoCarregando="Sincronizando…"
            onClick={() => void sincronizar()}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Sincronizar cardápio
          </Botao>
        }
      />

      {aviso && (
        <div className="mb-4">
          <Aviso tipo="info">{aviso}</Aviso>
        </div>
      )}

      {lista.carregando ? (
        <EsqueletoLista linhas={6} />
      ) : lista.erro ? (
        <Erro mensagem={lista.erro} aoTentarDeNovo={lista.recarregar} />
      ) : !lista.dados || lista.dados.length === 0 ? (
        <Cartao>
          <Vazio
            titulo="Nenhum produto cadastrado"
            descricao="Sincronize o cardápio do site para trazer os itens e poder informar o custo de cada um."
            acao={
              <Botao
                tamanho="sm"
                carregando={sincronizando}
                textoCarregando="Sincronizando…"
                onClick={() => void sincronizar()}
              >
                Sincronizar cardápio
              </Botao>
            }
          />
        </Cartao>
      ) : (
        <>
          {semCusto > 0 && (
            <div className="mb-4">
              <Aviso tipo="info">
                {semCusto === 1
                  ? '1 produto ainda está sem custo informado.'
                  : `${semCusto} produtos ainda estão sem custo informado.`}{' '}
                Enquanto o custo estiver em branco, o lucro do relatório sai maior do que é de
                verdade.
              </Aviso>
            </div>
          )}

          <Cartao className="overflow-hidden">
            <div className="admin-rolagem-x">
              <table className="w-full text-sm">
                <thead className="border-b border-[var(--admin-borda)] bg-slate-50 text-left text-xs uppercase tracking-wide text-[var(--admin-tinta-suave)]">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Produto</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-semibold">Venda</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-semibold">Custo</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-semibold">Lucro bruto</th>
                    <th scope="col" className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-borda)]">
                  {lista.dados.map((p) => {
                    const lucro = p.cost_cents === null ? null : p.price_cents - p.cost_cents;
                    return (
                      <tr key={p.id} className={p.active ? '' : 'opacity-55'}>
                        <td className="px-4 py-2.5">
                          <span className="font-medium text-[var(--admin-tinta)]">{p.name}</span>
                          {!p.active && (
                            <span className="ml-2 text-xs text-[var(--admin-tinta-suave)]">
                              (fora do cardápio)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {reais(p.price_cents)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {p.cost_cents === null ? (
                            <span className="text-[var(--admin-tinta-suave)]">—</span>
                          ) : (
                            reais(p.cost_cents)
                          )}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-semibold tabular-nums ${
                            lucro === null
                              ? 'text-[var(--admin-tinta-suave)]'
                              : lucro >= 0
                                ? 'text-[var(--admin-verde)]'
                                : 'text-[var(--admin-vermelho)]'
                          }`}
                        >
                          {lucro === null ? '—' : reais(lucro)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => abrirEdicao(p)}
                            className="text-xs font-bold text-[var(--admin-laranja)] hover:underline"
                          >
                            {p.cost_cents === null ? 'informar custo' : 'editar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Cartao>
        </>
      )}

      <Modal
        aberto={emEdicao !== null}
        aoFechar={() => setEmEdicao(null)}
        titulo={emEdicao?.name ?? ''}
        descricao={`Preço de venda: ${reais(emEdicao?.price_cents ?? 0)}`}
        largura="sm"
        fecharAoClicarFora={false}
        rodape={
          <div className="flex gap-2">
            <Botao variante="secundario" className="flex-1" onClick={() => setEmEdicao(null)}>
              Cancelar
            </Botao>
            <Botao
              className="flex-1"
              carregando={salvando}
              textoCarregando="Salvando…"
              onClick={() => void salvar()}
            >
              Salvar custo
            </Botao>
          </div>
        }
      >
        <CampoDinheiro
          id="custo-produto"
          rotulo="Custo estimado do item"
          valor={custo}
          aoMudar={setCusto}
          autoFocus
        />
        <p className="mt-2 text-xs leading-relaxed text-[var(--admin-tinta-suave)]">
          Quanto custa produzir uma unidade: ingredientes e embalagem. Deixe em branco se ainda não
          souber — melhor vazio do que um número chutado, que mente no relatório de lucro.
        </p>
        <p className="mt-2 text-xs font-semibold text-[var(--admin-tinta-suave)]">
          Este valor nunca aparece no site.
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
