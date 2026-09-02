"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";

import type { Product, SelectedOption } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Botao } from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/Campo";
import { FotoProduto } from "@/components/ui/FotoProduto";
import { EstadoErro } from "@/components/ui/Estados";
import { formatarPreco } from "@/lib/format";
import { usePedido } from "@/lib/cart-store";

/**
 * Detalhe do produto: foto grande, descricao, grupos de opcao, quantidade e
 * observacao. So renderiza os grupos que existem em data/menu.ts -- nenhum
 * tamanho, carne ou adicional e inventado aqui.
 */
export function FolhaProduto({
  produto,
  aoFechar,
}: {
  produto: Product | null;
  aoFechar: () => void;
}) {
  const adicionar = usePedido((estado) => estado.adicionar);
  const [quantidade, setQuantidade] = useState(1);
  const [escolhas, setEscolhas] = useState<Record<string, string[]>>({});
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  // Cada produto aberto comeca do zero. O ajuste acontece durante o render,
  // como o React recomenda, em vez de dentro de um efeito -- assim nao existe
  // um quadro intermediario com as escolhas do produto anterior.
  const [produtoAnterior, setProdutoAnterior] = useState(produto?.id);
  if (produto?.id !== produtoAnterior) {
    setProdutoAnterior(produto?.id);
    setQuantidade(1);
    setEscolhas({});
    setObservacao("");
    setErro(null);
  }

  const grupos = useMemo(() => produto?.options ?? [], [produto]);

  const selecionadas: SelectedOption[] = useMemo(() => {
    return grupos
      .map((grupo) => {
        const ids = escolhas[grupo.id] ?? [];
        const opcoes = grupo.choices.filter((escolha) =>
          ids.includes(escolha.id),
        );
        return {
          optionId: grupo.id,
          optionName: grupo.name,
          choiceIds: opcoes.map((escolha) => escolha.id),
          choiceNames: opcoes.map((escolha) => escolha.name),
          priceDelta: opcoes.reduce(
            (soma, escolha) => soma + escolha.priceDelta,
            0,
          ),
        };
      })
      .filter((opcao) => opcao.choiceIds.length > 0);
  }, [grupos, escolhas]);

  const extras = selecionadas.reduce((soma, opcao) => soma + opcao.priceDelta, 0);
  const total = produto ? (produto.price + extras) * quantidade : 0;

  const alternar = (
    grupoId: string,
    escolhaId: string,
    tipo: "single" | "multiple",
    max?: number,
  ) => {
    setErro(null);
    setEscolhas((atual) => {
      const jaEscolhidas = atual[grupoId] ?? [];
      if (tipo === "single") {
        return { ...atual, [grupoId]: [escolhaId] };
      }
      if (jaEscolhidas.includes(escolhaId)) {
        return {
          ...atual,
          [grupoId]: jaEscolhidas.filter((id) => id !== escolhaId),
        };
      }
      if (max !== undefined && jaEscolhidas.length >= max) return atual;
      return { ...atual, [grupoId]: [...jaEscolhidas, escolhaId] };
    });
  };

  const confirmar = () => {
    if (!produto) return;

    const faltando = grupos.find(
      (grupo) => grupo.required && (escolhas[grupo.id] ?? []).length === 0,
    );
    if (faltando) {
      setErro(`Escolha uma opção em "${faltando.name}".`);
      return;
    }

    adicionar(produto, quantidade, selecionadas, observacao);
    aoFechar();
  };

  return (
    <Modal
      aberto={produto !== null}
      aoFechar={aoFechar}
      titulo={produto?.name ?? ""}
      rodape={
        produto ? (
          <Botao larguraTotal tamanho="grande" onClick={confirmar}>
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            Adicionar ao pedido · {formatarPreco(total)}
          </Botao>
        ) : undefined
      }
    >
      {produto && (
        <div className="pb-2">
          <div className="relative aspect-[16/10] w-full">
            <FotoProduto
              src={produto.image}
              alt={produto.name}
              sizes="(max-width: 640px) 100vw, 512px"
              className="h-full w-full"
            />
          </div>

          <div className="space-y-5 px-5 pt-5">
            <div>
              <p className="text-sm leading-relaxed text-tinta-media">
                {produto.description}
              </p>
              <p className="mt-2 text-xl font-extrabold text-laranja">
                {formatarPreco(produto.price)}
              </p>
            </div>

            {grupos.map((grupo) => (
              <fieldset key={grupo.id}>
                <legend className="fonte-titulo text-[15px] font-bold text-tinta">
                  {grupo.name}
                  <span className="ml-2 text-[12px] font-medium text-tinta-suave">
                    {grupo.required ? "Obrigatório" : "Opcional"}
                    {grupo.type === "multiple" && grupo.max
                      ? ` · até ${grupo.max}`
                      : ""}
                  </span>
                </legend>

                <div className="mt-2 space-y-1.5">
                  {grupo.choices
                    .filter((escolha) => escolha.available !== false)
                    .map((escolha) => {
                      const marcada = (escolhas[grupo.id] ?? []).includes(
                        escolha.id,
                      );
                      return (
                        <label
                          key={escolha.id}
                          className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-carta border px-4 ${
                            marcada
                              ? "border-laranja bg-creme"
                              : "border-borda bg-white"
                          }`}
                        >
                          <input
                            type={grupo.type === "single" ? "radio" : "checkbox"}
                            name={grupo.id}
                            checked={marcada}
                            onChange={() =>
                              alternar(
                                grupo.id,
                                escolha.id,
                                grupo.type,
                                grupo.max,
                              )
                            }
                            className="h-5 w-5 accent-[#e75c16]"
                          />
                          <span className="flex-1 text-[15px] text-tinta">
                            {escolha.name}
                          </span>
                          {escolha.priceDelta > 0 && (
                            <span className="text-sm font-semibold text-laranja">
                              + {formatarPreco(escolha.priceDelta)}
                            </span>
                          )}
                        </label>
                      );
                    })}
                </div>
              </fieldset>
            ))}

            <CampoTexto
              rotulo="Observações"
              opcional
              placeholder="Ex.: sem cebola, por favor."
              value={observacao}
              maxLength={280}
              onChange={(evento) => setObservacao(evento.target.value)}
            />

            {erro && <EstadoErro mensagem={erro} />}

            <div className="flex items-center justify-between rounded-carta bg-nevoa px-3 py-2">
              <span className="text-[14px] font-semibold text-tinta-media">
                Quantidade
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantidade((n) => Math.max(1, n - 1))}
                  disabled={quantidade <= 1}
                  aria-label="Diminuir quantidade"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-laranja shadow-carta disabled:text-tinta-suave"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span
                  aria-live="polite"
                  className="min-w-8 text-center text-lg font-bold text-tinta"
                >
                  {quantidade}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantidade((n) => Math.min(99, n + 1))}
                  aria-label="Aumentar quantidade"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-laranja text-white"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
