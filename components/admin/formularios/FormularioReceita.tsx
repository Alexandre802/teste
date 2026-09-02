'use client';

import { useState } from 'react';
import { criarReceita } from '@/lib/admin/consultas';
import { lerCentavos } from '@/lib/admin/dinheiro';
import { isoDia, doIsoDia } from '@/lib/admin/datas';
import { FORMAS_EM_ORDEM, FORMA_PAGAMENTO } from '@/lib/admin/rotulos';
import type { FormaPagamentoDb } from '@/lib/admin/tipos';
import { useSupabase } from '../SessaoProvider';
import { Modal } from '../ui/Modal';
import { Botao } from '../ui/Botao';
import { Aviso } from '../ui/Estados';
import { CampoDinheiro } from './CampoDinheiro';

/**
 * Nova receita — dinheiro que entrou fora do site.
 *
 * O que NÃO tem aqui, e é de propósito: escolher um pedido para "marcar como
 * recebido". Pedido vira recebimento por um caminho só, na tela do pedido,
 * onde a função do banco cria o lançamento junto. Duas portas para o mesmo
 * dinheiro é como o faturamento aparece dobrado no fim do mês.
 */
export default function FormularioReceita({
  aberto,
  aoFechar,
  aoSalvar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar?: () => void;
}) {
  // Fechado, o formulário nem existe. É o que garante que ele reabra sempre
  // em branco — sem efeito de limpeza para esquecer um campo e sem o risco de
  // lançar de novo o valor que ficou da vez anterior.
  if (!aberto) return null;
  return <Conteudo aoFechar={aoFechar} aoSalvar={aoSalvar} />;
}

function Conteudo({ aoFechar, aoSalvar }: { aoFechar: () => void; aoSalvar?: () => void }) {
  const supabase = useSupabase();
  const [valor, setValor] = useState('');
  const [forma, setForma] = useState<FormaPagamentoDb>('cash');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(isoDia());
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salvando) return;

    const centavos = lerCentavos(valor);
    if (centavos === null || centavos <= 0) {
      setErro('Informe o valor recebido.');
      return;
    }
    if (!descricao.trim()) {
      setErro('Escreva de onde veio esse dinheiro.');
      return;
    }

    setErro('');
    setSalvando(true);

    try {
      await criarReceita(supabase, {
        kind: 'manual',
        amount_cents: centavos,
        method: forma,
        description: descricao.trim(),
        notes: observacao.trim(),
        // guarda a data escolhida às 12h de São Paulo: no meio do dia, nenhum
        // ajuste de fuso empurra o lançamento para a véspera
        occurred_at: new Date(doIsoDia(data).getTime() + 12 * 3600_000).toISOString(),
      });
      aoSalvar?.();
      aoFechar();
    } catch (e) {
      setSalvando(false);
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar a receita.');
    }
  };

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Nova receita"
      descricao="Venda no balcão, encomenda, qualquer entrada que não passou pelo site."
      // formulário com dados digitados não fecha por clique fora
      fecharAoClicarFora={false}
      rodape={
        <div className="flex gap-2">
          <Botao variante="secundario" onClick={aoFechar} className="flex-1" disabled={salvando}>
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-receita"
            className="flex-1"
            carregando={salvando}
            textoCarregando="Salvando…"
          >
            SALVAR RECEITA
          </Botao>
        </div>
      }
    >
      <form id="form-receita" onSubmit={salvar} className="flex flex-col gap-4">
        <CampoDinheiro
          id="receita-valor"
          rotulo="Valor"
          valor={valor}
          aoMudar={setValor}
          obrigatorio
          autoFocus
        />

        <div>
          <label htmlFor="receita-descricao" className="admin-rotulo">
            Descrição
          </label>
          <input
            id="receita-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={120}
            required
            placeholder="Ex.: venda no balcão"
            className="admin-campo"
          />
        </div>

        <div>
          <label htmlFor="receita-forma" className="admin-rotulo">
            Forma de pagamento
          </label>
          <select
            id="receita-forma"
            value={forma}
            onChange={(e) => setForma(e.target.value as FormaPagamentoDb)}
            className="admin-campo"
          >
            {FORMAS_EM_ORDEM.map((f) => (
              <option key={f} value={f}>
                {FORMA_PAGAMENTO[f]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="receita-data" className="admin-rotulo">
            Data
          </label>
          <input
            id="receita-data"
            type="date"
            value={data}
            max={isoDia()}
            onChange={(e) => setData(e.target.value)}
            className="admin-campo"
          />
        </div>

        <div>
          <label htmlFor="receita-obs" className="admin-rotulo">
            Observação <span className="font-normal text-[var(--admin-tinta-suave)]">(opcional)</span>
          </label>
          <input
            id="receita-obs"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            maxLength={200}
            placeholder="Ex.: pagamento recebido"
            className="admin-campo"
          />
        </div>

        {erro && <Aviso tipo="erro">{erro}</Aviso>}
      </form>
    </Modal>
  );
}
