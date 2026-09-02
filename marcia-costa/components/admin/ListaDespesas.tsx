"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { FormularioLancamento } from "@/components/admin/FormularioLancamento";
import { BotaoExportar } from "@/components/admin/BotaoExportar";
import { BotaoAcao } from "@/components/admin/BotaoAcao";
import { PainelVazio } from "@/components/admin/EstadoPainel";
import { Modal } from "@/components/ui/Modal";
import { apagarDespesa, registrarDespesa } from "@/lib/admin/acoes";
import { formatarCentavos } from "@/lib/dinheiro";
import { linhasDeDespesas } from "@/lib/admin/csv";
import {
  ROTULO_FORMA,
  type CategoriaDespesa,
  type Despesa,
} from "@/lib/admin/tipos";

export function ListaDespesas({
  despesas,
  categorias,
  rotuloPeriodo,
  arquivo,
  abrirNova,
}: {
  despesas: Despesa[];
  categorias: CategoriaDespesa[];
  rotuloPeriodo: string;
  arquivo: string;
  abrirNova: boolean;
}) {
  const router = useRouter();
  const [nova, setNova] = useState(abrirNova);
  const [apagando, setApagando] = useState<Despesa | null>(null);

  const total = despesas.reduce((soma, item) => soma + item.amount_cents, 0);
  const nomes = new Map(categorias.map((c) => [c.id, c.nome]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-tinta-suave">
            Total · {rotuloPeriodo}
          </p>
          <p className="text-[22px] font-extrabold text-vermelho">
            {formatarCentavos(total)}
          </p>
        </div>
        <div className="flex gap-2">
          <BotaoExportar
            nome={arquivo}
            linhas={linhasDeDespesas(despesas, nomes)}
          />
          <button
            type="button"
            onClick={() => setNova(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-carta bg-laranja px-4 text-[14px] font-semibold text-white"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova despesa
          </button>
        </div>
      </div>

      {despesas.length === 0 ? (
        <PainelVazio
          titulo="Nenhuma despesa registrada"
          descricao="Registre o que sai do caixa para o lucro do período ficar certo."
        />
      ) : (
        <ul className="space-y-2">
          {despesas.map((despesa) => (
            <li
              key={despesa.id}
              className="flex items-center gap-2 rounded-bloco border border-borda bg-white p-4 shadow-carta"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-tinta">
                  {despesa.descricao}
                </p>
                <p className="text-[12px] text-tinta-suave">
                  {despesa.ocorrido_em.split("-").reverse().join("/")} ·{" "}
                  {despesa.category_id
                    ? (nomes.get(despesa.category_id) ?? "Sem categoria")
                    : "Sem categoria"}{" "}
                  · {ROTULO_FORMA[despesa.payment_method]}
                  {despesa.fornecedor ? ` · ${despesa.fornecedor}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-[15px] font-extrabold text-vermelho">
                {formatarCentavos(despesa.amount_cents)}
              </span>
              <button
                type="button"
                onClick={() => setApagando(despesa)}
                aria-label={`Apagar despesa ${despesa.descricao}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-tinta-suave hover:bg-vermelho/10 hover:text-vermelho"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <FormularioLancamento
        aberto={nova}
        aoFechar={() => setNova(false)}
        titulo="Nova despesa"
        extras={[
          {
            id: "categoria",
            rotulo: "Categoria",
            opcoes: categorias.map((categoria) => ({
              valor: categoria.id,
              rotulo: categoria.nome,
            })),
          },
          { id: "fornecedor", rotulo: "Fornecedor (opcional)" },
        ]}
        salvar={(dados) =>
          registrarDespesa({
            category_id: dados.categoria || null,
            descricao: dados.descricao,
            amount_cents: dados.amount_cents,
            payment_method: dados.payment_method,
            ocorrido_em: dados.ocorrido_em,
            fornecedor: dados.fornecedor,
            observacao: dados.observacao,
          })
        }
      />

      <Modal
        aberto={apagando !== null}
        aoFechar={() => setApagando(null)}
        titulo="Apagar despesa?"
        rodape={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setApagando(null)}
              className="min-h-[48px] flex-1 rounded-carta border border-borda bg-white text-[15px] font-semibold text-tinta"
            >
              Manter
            </button>
            <BotaoAcao
              variante="perigo"
              larguraTotal
              carregando="Apagando…"
              acao={() =>
                apagando
                  ? apagarDespesa(apagando.id)
                  : Promise.resolve({ ok: false as const, erro: "" })
              }
              aoTerminar={(resultado) => {
                if (resultado.ok) {
                  setApagando(null);
                  router.refresh();
                }
              }}
            >
              Apagar
            </BotaoAcao>
          </div>
        }
      >
        <p className="px-5 py-6 text-[15px] text-tinta-media">
          A despesa <strong className="text-tinta">{apagando?.descricao}</strong>{" "}
          sai do relatório. Isso não pode ser desfeito.
        </p>
      </Modal>
    </div>
  );
}
