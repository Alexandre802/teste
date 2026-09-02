"use client";

import { useState } from "react";

import type { Product } from "@/types";
import { Categorias } from "@/components/menu/Categorias";
import { ProdutoCard } from "@/components/menu/ProdutoCard";
import { FolhaProduto } from "@/components/menu/FolhaProduto";
import { AvisoInformativo, EstadoVazio } from "@/components/ui/Estados";
import { BotaoLink } from "@/components/ui/Botao";
import {
  cardapioEmConferencia,
  categoriasComProduto,
  produtosDaCategoria,
} from "@/data/menu";

/**
 * Cardapio completo. Categoria sem nenhum item disponivel nem aparece na
 * barra -- nao existe aba vazia.
 */
export function Cardapio() {
  const categorias = categoriasComProduto();
  const [ativa, setAtiva] = useState(categorias[0]?.id ?? "");
  const [aberto, setAberto] = useState<Product | null>(null);

  const produtos = ativa ? produtosDaCategoria(ativa) : [];

  if (categorias.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EstadoVazio
          titulo="Nenhum produto disponível no momento"
          descricao="O cardápio está sendo atualizado. Fale com a gente para saber o que temos hoje."
          acao={<BotaoLink href="/#informacoes">Ver informações</BotaoLink>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-4">
      <Categorias categorias={categorias} ativa={ativa} aoTrocar={setAtiva} />

      {cardapioEmConferencia && (
        <div className="mt-4">
          <AvisoInformativo>
            Cardápio em conferência: os itens abaixo saíram das telas enviadas
            pela casa e ainda serão confirmados. Confirme o valor no WhatsApp
            antes de pagar.
          </AvisoInformativo>
        </div>
      )}

      {produtos.length === 0 ? (
        <div className="mt-5">
          <EstadoVazio
            titulo="Nada nesta categoria por enquanto"
            descricao="Escolha outra categoria — logo temos novidade aqui."
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 pb-4">
          {produtos.map((produto, indice) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              indice={indice}
              aoAbrir={setAberto}
            />
          ))}
        </ul>
      )}

      <FolhaProduto produto={aberto} aoFechar={() => setAberto(null)} />
    </div>
  );
}
