'use client';

import { useEffect, useState } from 'react';
import { carregarCategorias, criarDespesa } from '@/lib/admin/consultas';
import { lerCentavos } from '@/lib/admin/dinheiro';
import { doIsoDia, isoDia } from '@/lib/admin/datas';
import { FORMAS_EM_ORDEM, FORMA_PAGAMENTO } from '@/lib/admin/rotulos';
import type { CategoriaDespesa, FormaPagamentoDb } from '@/lib/admin/tipos';
import { useSupabase } from '../SessaoProvider';
import { Modal } from '../ui/Modal';
import { Botao } from '../ui/Botao';
import { Aviso } from '../ui/Estados';
import { CampoDinheiro } from './CampoDinheiro';

/** Nova despesa: compra, conta, pagamento. */
export default function FormularioDespesa({
  aberto,
  aoFechar,
  aoSalvar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar?: () => void;
}) {
  // Fechado, o formulário nem existe: reabre sempre em branco, sem efeito de
  // limpeza para esquecer um campo. Ver a nota igual em FormularioReceita.
  if (!aberto) return null;
  return <Conteudo aoFechar={aoFechar} aoSalvar={aoSalvar} />;
}

function Conteudo({ aoFechar, aoSalvar }: { aoFechar: () => void; aoSalvar?: () => void }) {
  const supabase = useSupabase();
  const [categorias, setCategorias] = useState<CategoriaDespesa[]>([]);
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [forma, setForma] = useState<FormaPagamentoDb>('cash');
  const [data, setData] = useState(isoDia());
  const [fornecedor, setFornecedor] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let vivo = true;
    carregarCategorias(supabase)
      .then((lista) => {
        if (vivo) setCategorias(lista);
      })
      .catch(() => {
        if (vivo) setErro('Não consegui carregar as categorias.');
      });
    return () => {
      vivo = false;
    };
  }, [supabase]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salvando) return;

    const centavos = lerCentavos(valor);
    if (centavos === null || centavos <= 0) {
      setErro('Informe o valor da despesa.');
      return;
    }
    if (!descricao.trim()) {
      setErro('Escreva o que foi essa despesa.');
      return;
    }

    setErro('');
    setSalvando(true);

    try {
      await criarDespesa(supabase, {
        // sem categoria é aceitável: melhor a despesa lançada e sem
        // classificação do que a pessoa desistir de lançar
        category_id: categoria || null,
        description: descricao.trim(),
        amount_cents: centavos,
        method: forma,
        supplier: fornecedor.trim(),
        notes: observacao.trim(),
        occurred_at: new Date(doIsoDia(data).getTime() + 12 * 3600_000).toISOString(),
      });
      aoSalvar?.();
      aoFechar();
    } catch (e) {
      setSalvando(false);
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar a despesa.');
    }
  };

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Nova despesa"
      fecharAoClicarFora={false}
      rodape={
        <div className="flex gap-2">
          <Botao variante="secundario" onClick={aoFechar} className="flex-1" disabled={salvando}>
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-despesa"
            className="flex-1"
            carregando={salvando}
            textoCarregando="Salvando…"
          >
            SALVAR DESPESA
          </Botao>
        </div>
      }
    >
      <form id="form-despesa" onSubmit={salvar} className="flex flex-col gap-4">
        <div>
          <label htmlFor="despesa-categoria" className="admin-rotulo">
            Categoria
          </label>
          <select
            id="despesa-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="admin-campo"
          >
            <option value="">Selecione a categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="despesa-descricao" className="admin-rotulo">
            Descrição
          </label>
          <input
            id="despesa-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={120}
            required
            placeholder="Ex.: compra de carne"
            className="admin-campo"
          />
        </div>

        <CampoDinheiro
          id="despesa-valor"
          rotulo="Valor"
          valor={valor}
          aoMudar={setValor}
          obrigatorio
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="despesa-forma" className="admin-rotulo">
              Forma de pagamento
            </label>
            <select
              id="despesa-forma"
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
            <label htmlFor="despesa-data" className="admin-rotulo">
              Data
            </label>
            <input
              id="despesa-data"
              type="date"
              value={data}
              max={isoDia()}
              onChange={(e) => setData(e.target.value)}
              className="admin-campo"
            />
          </div>
        </div>

        <div>
          <label htmlFor="despesa-fornecedor" className="admin-rotulo">
            Fornecedor <span className="font-normal text-[var(--admin-tinta-suave)]">(opcional)</span>
          </label>
          <input
            id="despesa-fornecedor"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
            maxLength={80}
            placeholder="Ex.: mercado do bairro"
            className="admin-campo"
          />
        </div>

        <div>
          <label htmlFor="despesa-obs" className="admin-rotulo">
            Observação <span className="font-normal text-[var(--admin-tinta-suave)]">(opcional)</span>
          </label>
          <input
            id="despesa-obs"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            maxLength={200}
            className="admin-campo"
          />
        </div>

        {erro && <Aviso tipo="erro">{erro}</Aviso>}
      </form>
    </Modal>
  );
}
