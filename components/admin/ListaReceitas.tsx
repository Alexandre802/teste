"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { FormularioLancamento } from "@/components/admin/FormularioLancamento";
import { BotaoExportar } from "@/components/admin/BotaoExportar";
import { PainelVazio } from "@/components/admin/EstadoPainel";
import { registrarReceita } from "@/lib/admin/acoes";
import { formatarCentavos } from "@/lib/dinheiro";
import { linhasDeReceitas } from "@/lib/admin/csv";
import { ROTULO_FORMA, type Receita } from "@/lib/admin/tipos";

export function ListaReceitas({
  receitas,
  rotuloPeriodo,
  arquivo,
  abrirNova,
}: {
  receitas: Receita[];
  rotuloPeriodo: string;
  arquivo: string;
  abrirNova: boolean;
}) {
  const [nova, setNova] = useState(abrirNova);

  const total = receitas.reduce((soma, item) => soma + item.amount_cents, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-tinta-suave">
            Total · {rotuloPeriodo}
          </p>
          <p className="text-[22px] font-extrabold text-verde-positivo">
            {formatarCentavos(total)}
          </p>
        </div>
        <div className="flex gap-2">
          <BotaoExportar nome={arquivo} linhas={linhasDeReceitas(receitas)} />
          <button
            type="button"
            onClick={() => setNova(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-carta bg-laranja px-4 text-[14px] font-semibold text-white"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova receita
          </button>
        </div>
      </div>

      {receitas.length === 0 ? (
        <PainelVazio
          titulo="Nenhuma receita no período"
          descricao="Assim que um pedido for marcado como pago, ele entra aqui sozinho."
        />
      ) : (
        <ul className="space-y-2">
          {receitas.map((receita) => (
            <li
              key={receita.id}
              className="flex items-center gap-3 rounded-bloco border border-borda bg-white p-4 shadow-carta"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-tinta">
                  {receita.descricao}
                </p>
                <p className="text-[12px] text-tinta-suave">
                  {receita.ocorrido_em.split("-").reverse().join("/")} ·{" "}
                  {ROTULO_FORMA[receita.payment_method]} ·{" "}
                  {receita.tipo === "order" ? "pedido" : "lançamento manual"}
                </p>
              </div>
              <span
                className={`shrink-0 text-[15px] font-extrabold ${
                  receita.amount_cents < 0
                    ? "text-vermelho"
                    : "text-verde-positivo"
                }`}
              >
                {formatarCentavos(receita.amount_cents)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <FormularioLancamento
        aberto={nova}
        aoFechar={() => setNova(false)}
        titulo="Nova receita"
        extras={[
          {
            id: "tipo",
            rotulo: "Tipo",
            opcoes: [
              { valor: "manual", rotulo: "Receita manual" },
              { valor: "outros", rotulo: "Outros" },
            ],
          },
        ]}
        salvar={(dados) =>
          registrarReceita({
            tipo: dados.tipo === "outros" ? "outros" : "manual",
            descricao: dados.descricao,
            amount_cents: dados.amount_cents,
            payment_method: dados.payment_method,
            ocorrido_em: dados.ocorrido_em,
            observacao: dados.observacao,
          })
        }
      />
    </div>
  );
}
