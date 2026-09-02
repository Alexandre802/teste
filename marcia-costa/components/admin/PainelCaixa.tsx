"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Lock, Unlock } from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { BotaoAcao } from "@/components/admin/BotaoAcao";
import { PainelVazio } from "@/components/admin/EstadoPainel";
import {
  abrirCaixa,
  fecharCaixa,
  registrarMovimentoCaixa,
} from "@/lib/admin/acoes";
import { formatarCentavos, lerCentavos, mascaraCentavos } from "@/lib/dinheiro";
import { formatarData, formatarHora } from "@/lib/admin/periodo";
import type { ResumoCaixa, SessaoCaixa } from "@/lib/admin/tipos";

/**
 * Caixa do dia.
 *
 * Só o dinheiro físico entra na conta da gaveta: pix, débito e crédito são
 * mostrados como informação, mas não somam no valor esperado — eles nunca
 * passaram pela mão de ninguém.
 */
export function PainelCaixa({
  sessao,
  resumo,
  fechados,
}: {
  sessao: SessaoCaixa | null;
  resumo: ResumoCaixa | null;
  fechados: SessaoCaixa[];
}) {
  const router = useRouter();
  const [abrindo, setAbrindo] = useState(false);
  const [fechando, setFechando] = useState(false);
  const [movimento, setMovimento] = useState<"sangria" | "suprimento" | null>(
    null,
  );

  const [abertura, setAbertura] = useState("");
  const [contado, setContado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [valorMovimento, setValorMovimento] = useState("");
  const [motivo, setMotivo] = useState("");

  const recarregar = () => router.refresh();

  if (!sessao) {
    return (
      <>
        <PainelVazio
          titulo="Nenhum caixa aberto"
          descricao="Abra o caixa informando quanto tem de troco na gaveta. Só assim a conferência do fim do dia faz sentido."
          acao={
            <button
              type="button"
              onClick={() => setAbrindo(true)}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-carta bg-laranja px-5 text-[15px] font-semibold text-white"
            >
              <Unlock className="h-5 w-5" aria-hidden="true" />
              Abrir caixa
            </button>
          }
        />

        <Historico fechados={fechados} />

        <Modal
          aberto={abrindo}
          aoFechar={() => setAbrindo(false)}
          titulo="Abrir caixa"
          rodape={
            <BotaoAcao
              larguraTotal
              carregando="Abrindo…"
              acao={() => abrirCaixa(lerCentavos(abertura) ?? 0)}
              aoTerminar={(resultado) => {
                if (resultado.ok) {
                  setAbrindo(false);
                  setAbertura("");
                  recarregar();
                }
              }}
            >
              Abrir caixa
            </BotaoAcao>
          }
        >
          <div className="px-5 py-5">
            <label
              htmlFor="valor-abertura"
              className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
            >
              Quanto tem na gaveta agora?
            </label>
            <input
              id="valor-abertura"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={abertura}
              onChange={(evento) =>
                setAbertura(mascaraCentavos(evento.target.value))
              }
              className="min-h-[48px] w-full rounded-carta border border-borda px-4 text-[15px]"
            />
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wide text-tinta-suave">
              Caixa aberto
            </p>
            <p className="text-[15px] font-semibold text-tinta">
              Desde {formatarData(sessao.aberto_em)} às{" "}
              {formatarHora(sessao.aberto_em)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMovimento("sangria")}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-carta border border-borda bg-white px-4 text-[14px] font-semibold text-tinta"
            >
              <ArrowUpCircle className="h-4 w-4 text-vermelho" aria-hidden="true" />
              Sangria
            </button>
            <button
              type="button"
              onClick={() => setMovimento("suprimento")}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-carta border border-borda bg-white px-4 text-[14px] font-semibold text-tinta"
            >
              <ArrowDownCircle
                className="h-4 w-4 text-verde-positivo"
                aria-hidden="true"
              />
              Suprimento
            </button>
            <button
              type="button"
              onClick={() => setFechando(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-carta bg-laranja px-4 text-[14px] font-semibold text-white"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              Fechar caixa
            </button>
          </div>
        </div>

        {resumo && (
          <dl className="mt-4 grid gap-x-6 border-t border-borda pt-4 sm:grid-cols-2">
            <Linha termo="Valor de abertura" valor={resumo.abertura_cents} />
            <Linha termo="Dinheiro recebido" valor={resumo.dinheiro_cents} />
            <Linha termo="Suprimento" valor={resumo.suprimento_cents} />
            <Linha termo="Sangria" valor={-resumo.sangria_cents} />
            <Linha
              termo="Despesas em dinheiro"
              valor={-resumo.despesas_dinheiro_cents}
            />
            <Linha termo="Esperado na gaveta" valor={resumo.esperado_cents} destaque />

            <div className="mt-3 border-t border-borda pt-3 sm:col-span-2">
              <p className="text-[12px] font-bold uppercase tracking-wide text-tinta-suave">
                Não passa pela gaveta
              </p>
              <div className="mt-1 grid gap-x-6 sm:grid-cols-3">
                <Linha termo="Pix" valor={resumo.pix_cents} />
                <Linha termo="Débito" valor={resumo.debito_cents} />
                <Linha termo="Crédito" valor={resumo.credito_cents} />
              </div>
            </div>
          </dl>
        )}
      </section>

      <Historico fechados={fechados} />

      <Modal
        aberto={movimento !== null}
        aoFechar={() => setMovimento(null)}
        titulo={movimento === "sangria" ? "Sangria" : "Suprimento de caixa"}
        rodape={
          <BotaoAcao
            larguraTotal
            carregando="Registrando…"
            acao={() =>
              registrarMovimentoCaixa(
                sessao.id,
                movimento ?? "sangria",
                lerCentavos(valorMovimento) ?? 0,
                motivo,
              )
            }
            aoTerminar={(resultado) => {
              if (resultado.ok) {
                setMovimento(null);
                setValorMovimento("");
                setMotivo("");
                recarregar();
              }
            }}
          >
            Registrar
          </BotaoAcao>
        }
      >
        <div className="space-y-4 px-5 py-5">
          <p className="text-[14px] leading-relaxed text-tinta-media">
            {movimento === "sangria"
              ? "Dinheiro retirado da gaveta — para o banco, para pagar alguém, para guardar."
              : "Dinheiro colocado na gaveta fora das vendas, por exemplo mais troco."}
          </p>
          <div>
            <label
              htmlFor="valor-movimento"
              className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
            >
              Valor
            </label>
            <input
              id="valor-movimento"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={valorMovimento}
              onChange={(evento) =>
                setValorMovimento(mascaraCentavos(evento.target.value))
              }
              className="min-h-[48px] w-full rounded-carta border border-borda px-4 text-[15px]"
            />
          </div>
          <div>
            <label
              htmlFor="motivo-movimento"
              className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
            >
              Motivo
            </label>
            <input
              id="motivo-movimento"
              value={motivo}
              maxLength={200}
              onChange={(evento) => setMotivo(evento.target.value)}
              className="min-h-[48px] w-full rounded-carta border border-borda px-4 text-[15px]"
            />
          </div>
        </div>
      </Modal>

      <Modal
        aberto={fechando}
        aoFechar={() => setFechando(false)}
        titulo="Fechar caixa"
        rodape={
          <BotaoAcao
            larguraTotal
            carregando="Fechando…"
            acao={() =>
              fecharCaixa(sessao.id, lerCentavos(contado) ?? 0, observacao)
            }
            aoTerminar={(resultado) => {
              if (resultado.ok) {
                setFechando(false);
                setContado("");
                setObservacao("");
                recarregar();
              }
            }}
          >
            Fechar caixa
          </BotaoAcao>
        }
      >
        <div className="space-y-4 px-5 py-5">
          {resumo && (
            <p className="rounded-carta bg-nevoa px-4 py-3 text-[14px] text-tinta-media">
              Esperado na gaveta:{" "}
              <strong className="text-tinta">
                {formatarCentavos(resumo.esperado_cents)}
              </strong>
            </p>
          )}
          <div>
            <label
              htmlFor="valor-contado"
              className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
            >
              Quanto você contou de verdade?
            </label>
            <input
              id="valor-contado"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={contado}
              onChange={(evento) =>
                setContado(mascaraCentavos(evento.target.value))
              }
              className="min-h-[48px] w-full rounded-carta border border-borda px-4 text-[15px]"
            />
            {resumo && lerCentavos(contado) !== null && (
              <p className="mt-1.5 text-[13px] font-semibold text-tinta-media">
                Diferença:{" "}
                <span
                  className={
                    (lerCentavos(contado) ?? 0) - resumo.esperado_cents === 0
                      ? "text-verde-positivo"
                      : "text-vermelho"
                  }
                >
                  {formatarCentavos(
                    (lerCentavos(contado) ?? 0) - resumo.esperado_cents,
                  )}
                </span>
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="obs-fechamento"
              className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
            >
              Observação{" "}
              <span className="font-normal text-tinta-suave">(opcional)</span>
            </label>
            <textarea
              id="obs-fechamento"
              rows={2}
              value={observacao}
              maxLength={300}
              onChange={(evento) => setObservacao(evento.target.value)}
              className="w-full rounded-carta border border-borda px-4 py-3 text-[15px]"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

function Historico({ fechados }: { fechados: SessaoCaixa[] }) {
  if (fechados.length === 0) return null;

  return (
    <section className="rounded-bloco border border-borda bg-white p-4 shadow-carta">
      <h2 className="fonte-titulo mb-3 text-[16px] font-bold text-tinta">
        Fechamentos anteriores
      </h2>
      <ul className="divide-y divide-borda">
        {fechados.map((sessao) => {
          const diferenca =
            sessao.contado_cents === null ? null : sessao.contado_cents;
          return (
            <li key={sessao.id} className="flex justify-between gap-3 py-3">
              <div>
                <p className="text-[14px] font-semibold text-tinta">
                  {formatarData(sessao.aberto_em)}
                </p>
                <p className="text-[12px] text-tinta-suave">
                  Abertura {formatarCentavos(sessao.abertura_cents)}
                  {sessao.observacao ? ` · ${sessao.observacao}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-[14px] font-bold text-tinta">
                {diferenca === null ? "—" : formatarCentavos(diferenca)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Linha({
  termo,
  valor,
  destaque = false,
}: {
  termo: string;
  valor: number;
  destaque?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-3 py-1.5 text-[14px] ${
        destaque ? "border-t border-borda pt-2 font-bold sm:col-span-2" : ""
      }`}
    >
      <dt className={destaque ? "text-tinta" : "text-tinta-media"}>{termo}</dt>
      <dd
        className={
          valor < 0 ? "font-semibold text-vermelho" : "font-semibold text-tinta"
        }
      >
        {formatarCentavos(valor)}
      </dd>
    </div>
  );
}
