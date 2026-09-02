"use client";

import { motion } from "framer-motion";
import { Check, Flame, Minus, Plus } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/types";
import { FotoProduto } from "@/components/ui/FotoProduto";
import { formatarPreco } from "@/lib/format";
import { usePedido } from "@/lib/cart-store";
import { useHidratado } from "@/lib/use-hidratado";

/**
 * Card do cardapio: foto a esquerda, informacao no centro, botao + a direita.
 *
 * O + soma direto quando o produto nao tem grupo de opcoes obrigatorio.
 * Tendo opcao a escolher, abre a folha de detalhes -- o site nao escolhe
 * acompanhamento no lugar do cliente.
 */
export function ProdutoCard({
  produto,
  aoAbrir,
  indice = 0,
}: {
  produto: Product;
  aoAbrir: (produto: Product) => void;
  indice?: number;
}) {
  const hidratado = useHidratado();
  const [somado, setSomado] = useState(false);

  const itens = usePedido((estado) => estado.items);
  const adicionar = usePedido((estado) => estado.adicionar);
  const incrementar = usePedido((estado) => estado.incrementar);
  const decrementar = usePedido((estado) => estado.decrementar);

  const precisaEscolher = (produto.options ?? []).some(
    (grupo) => grupo.required,
  );

  // Linha simples deste produto (sem nenhuma opcao e sem observacao).
  const linhaSimples = itens.find(
    (item) =>
      item.productId === produto.id &&
      item.selectedOptions.length === 0 &&
      !item.observation,
  );
  const noPedido = hidratado ? (linhaSimples?.quantity ?? 0) : 0;

  const somar = () => {
    if (precisaEscolher) {
      aoAbrir(produto);
      return;
    }
    adicionar(produto, 1, []);
    setSomado(true);
    window.setTimeout(() => setSomado(false), 900);
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(indice, 6) * 0.04 }}
      className="overflow-hidden rounded-bloco border border-borda bg-white shadow-carta"
    >
      <div className="flex gap-3 p-3">
        <button
          type="button"
          onClick={() => aoAbrir(produto)}
          aria-label={`Ver detalhes de ${produto.name}`}
          className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-carta sm:h-[116px] sm:w-[128px]"
        >
          <FotoProduto
            src={produto.image}
            alt={produto.name}
            sizes="140px"
            className="h-full w-full"
          />
        </button>

        {/* O preco e o seletor ficam embaixo do texto: assim o nome do produto
            usa a largura toda e nao quebra em telas de 360px. */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {produto.badge && (
            <span className="mb-1 inline-flex w-fit items-center gap-1 rounded-full border border-laranja/30 bg-creme px-2 py-0.5 text-[11px] font-bold text-laranja">
              <Flame className="h-3 w-3" aria-hidden="true" />
              {produto.badge}
            </span>
          )}

          <button
            type="button"
            onClick={() => aoAbrir(produto)}
            className="text-left"
          >
            <h3 className="fonte-titulo text-[16px] font-bold leading-tight text-tinta sm:text-[17px]">
              {produto.name}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-tinta-media">
              {produto.description}
            </p>
          </button>

          {/* flex-wrap: em 360px o seletor desce para a linha de baixo em vez
              de estourar a largura do card. */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[17px] font-extrabold text-laranja">
              {produto.priceFrom && (
                <span className="mr-1 text-[12px] font-semibold text-tinta-suave">
                  a partir de
                </span>
              )}
              {formatarPreco(produto.price)}
            </p>

            {noPedido > 0 ? (
              <div className="ml-auto flex shrink-0 items-center gap-0.5 rounded-full bg-creme p-1">
                <button
                  type="button"
                  onClick={() => decrementar(linhaSimples!.lineId)}
                  aria-label={`Remover uma unidade de ${produto.name}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-laranja transition-colors hover:bg-creme-forte"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span
                  aria-live="polite"
                  className="min-w-6 text-center text-[15px] font-bold text-tinta"
                >
                  {noPedido}
                </span>
                <button
                  type="button"
                  onClick={() => incrementar(linhaSimples!.lineId)}
                  aria-label={`Adicionar uma unidade de ${produto.name}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-laranja text-white transition-colors hover:bg-laranja-forte"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={somar}
                aria-label={
                  precisaEscolher
                    ? `Escolher opções de ${produto.name}`
                    : `Adicionar ${produto.name} ao pedido`
                }
                className="ml-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-carta bg-laranja text-white shadow-carta transition-colors hover:bg-laranja-forte"
              >
                {somado ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Plus className="h-5 w-5" aria-hidden="true" />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}
