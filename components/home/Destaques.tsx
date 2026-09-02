"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

import type { Product } from "@/types";
import { ProdutoCard } from "@/components/menu/ProdutoCard";
import { FolhaProduto } from "@/components/menu/FolhaProduto";
import { BotaoLink } from "@/components/ui/Botao";
import { AvisoInformativo, EstadoVazio } from "@/components/ui/Estados";
import { cardapioEmConferencia, produtosDestaque } from "@/data/menu";

export function Destaques() {
  const [aberto, setAberto] = useState<Product | null>(null);
  const destaques = produtosDestaque().slice(0, 8);

  return (
    <section id="mais-pedidos" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-laranja">
            Destaques do cardápio
          </p>
          <h2 className="fonte-titulo mt-1 text-2xl font-extrabold text-tinta sm:text-3xl">
            Mais pedidos
          </h2>
        </div>
        <BotaoLink href="/cardapio" variante="suave" className="shrink-0">
          Ver tudo
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </BotaoLink>
      </div>

      {cardapioEmConferencia && destaques.length > 0 && (
        <div className="mt-4">
          <AvisoInformativo>
            Cardápio em conferência: os itens abaixo saíram das telas enviadas
            pela casa e ainda serão confirmados. Confirme o valor no WhatsApp
            antes de pagar.
          </AvisoInformativo>
        </div>
      )}

      {destaques.length === 0 ? (
        <div className="mt-6">
          <EstadoVazio
            titulo="Nenhum destaque cadastrado"
            descricao="Assim que os produtos forem cadastrados, os mais pedidos aparecem aqui."
            acao={<BotaoLink href="/cardapio">Abrir cardápio</BotaoLink>}
          />
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 lg:grid-cols-2">
          {destaques.map((produto, indice) => (
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
    </section>
  );
}
