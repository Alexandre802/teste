"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { lerCentavos, mascaraCentavos } from "@/lib/dinheiro";
import { hojeEmSaoPaulo } from "@/lib/admin/periodo";
import { ROTULO_FORMA, type FormaPagamentoDb } from "@/lib/admin/tipos";
import type { Resultado } from "@/lib/admin/acoes";

const FORMAS: FormaPagamentoDb[] = ["pix", "cash", "debit", "credit"];

export type CampoExtra = {
  id: "categoria" | "fornecedor" | "tipo";
  rotulo: string;
  opcoes?: { valor: string; rotulo: string }[];
};

/**
 * Formulário de receita ou despesa.
 *
 * O botão trava enquanto salva: dois toques não podem virar dois lançamentos.
 * O valor é digitado com máscara e convertido para centavos — nada de float
 * chegando perto do caixa.
 */
export function FormularioLancamento({
  aberto,
  aoFechar,
  titulo,
  extras,
  salvar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  extras: CampoExtra[];
  salvar: (dados: {
    descricao: string;
    amount_cents: number;
    payment_method: FormaPagamentoDb;
    ocorrido_em: string;
    observacao: string;
    categoria: string;
    fornecedor: string;
    tipo: string;
  }) => Promise<Resultado>;
}) {
  const router = useRouter();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState<FormaPagamentoDb>("cash");
  const [data, setData] = useState(hojeEmSaoPaulo());
  const [observacao, setObservacao] = useState("");
  const [categoria, setCategoria] = useState(
    extras.find((extra) => extra.id === "categoria")?.opcoes?.[0]?.valor ?? "",
  );
  const [tipo, setTipo] = useState(
    extras.find((extra) => extra.id === "tipo")?.opcoes?.[0]?.valor ?? "manual",
  );
  const [fornecedor, setFornecedor] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const limpar = () => {
    setDescricao("");
    setValor("");
    setObservacao("");
    setFornecedor("");
    setErro(null);
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (salvando) return;

    const centavos = lerCentavos(valor);
    if (centavos === null || centavos <= 0) {
      setErro("Informe um valor maior que zero.");
      return;
    }
    if (!descricao.trim()) {
      setErro("Escreva uma descrição.");
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const resultado = await salvar({
        descricao,
        amount_cents: centavos,
        payment_method: forma,
        ocorrido_em: data,
        observacao,
        categoria,
        fornecedor,
        tipo,
      });
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      limpar();
      aoFechar();
      router.refresh();
    } catch {
      setErro("Não foi possível salvar. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo={titulo}>
      <form onSubmit={enviar} className="space-y-4 px-5 py-5">
        {extras.map((extra) => (
          <div key={extra.id}>
            <label
              htmlFor={`extra-${extra.id}`}
              className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
            >
              {extra.rotulo}
            </label>
            {extra.opcoes ? (
              <select
                id={`extra-${extra.id}`}
                value={extra.id === "categoria" ? categoria : tipo}
                onChange={(evento) =>
                  extra.id === "categoria"
                    ? setCategoria(evento.target.value)
                    : setTipo(evento.target.value)
                }
                className="min-h-[48px] w-full rounded-carta border border-borda bg-white px-4 text-[15px]"
              >
                {extra.opcoes.map((opcao) => (
                  <option key={opcao.valor} value={opcao.valor}>
                    {opcao.rotulo}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`extra-${extra.id}`}
                value={fornecedor}
                onChange={(evento) => setFornecedor(evento.target.value)}
                className="min-h-[48px] w-full rounded-carta border border-borda px-4 text-[15px]"
              />
            )}
          </div>
        ))}

        <div>
          <label
            htmlFor="lanc-descricao"
            className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
          >
            Descrição
          </label>
          <input
            id="lanc-descricao"
            required
            value={descricao}
            maxLength={200}
            onChange={(evento) => setDescricao(evento.target.value)}
            className="min-h-[48px] w-full rounded-carta border border-borda px-4 text-[15px]"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="lanc-valor"
              className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
            >
              Valor
            </label>
            <input
              id="lanc-valor"
              required
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={valor}
              onChange={(evento) => setValor(mascaraCentavos(evento.target.value))}
              className="min-h-[48px] w-full rounded-carta border border-borda px-4 text-[15px]"
            />
          </div>
          <div>
            <label
              htmlFor="lanc-data"
              className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
            >
              Data
            </label>
            <input
              id="lanc-data"
              type="date"
              required
              value={data}
              onChange={(evento) => setData(evento.target.value)}
              className="min-h-[48px] w-full rounded-carta border border-borda px-4 text-[15px]"
            />
          </div>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-[13px] font-semibold text-tinta-media">
            Forma de pagamento
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FORMAS.map((opcao) => (
              <label
                key={opcao}
                className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-carta border text-[14px] font-semibold ${
                  forma === opcao
                    ? "border-laranja bg-creme text-laranja-queimado"
                    : "border-borda bg-white text-tinta"
                }`}
              >
                <input
                  type="radio"
                  name="forma-lancamento"
                  checked={forma === opcao}
                  onChange={() => setForma(opcao)}
                  className="sr-only"
                />
                {ROTULO_FORMA[opcao]}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="lanc-obs"
            className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
          >
            Observação{" "}
            <span className="font-normal text-tinta-suave">(opcional)</span>
          </label>
          <textarea
            id="lanc-obs"
            rows={2}
            value={observacao}
            maxLength={300}
            onChange={(evento) => setObservacao(evento.target.value)}
            className="w-full rounded-carta border border-borda px-4 py-3 text-[15px]"
          />
        </div>

        {erro && (
          <p
            role="alert"
            className="rounded-carta border border-vermelho/25 bg-vermelho/5 px-4 py-3 text-sm text-vermelho"
          >
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={salvando}
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-carta bg-laranja text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {salvando && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </Modal>
  );
}
