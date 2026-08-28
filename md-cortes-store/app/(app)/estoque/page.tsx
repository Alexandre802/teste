"use client";

import { useMemo, useState } from "react";
import { PackagePlus, Plus, SlidersHorizontal } from "lucide-react";
import type { CategoryGroup } from "@/types";
import { CATEGORY_GROUPS } from "@/lib/constants";
import { filterByGroup, searchViews, stockValueCents, totalPieces } from "@/lib/selectors";
import { money } from "@/lib/format";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useStore } from "@/lib/store";
import { ScreenTitle } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { CardProduto } from "@/components/estoque/CardProduto";

type Ordem = "nome" | "menor-estoque" | "maior-estoque";

export default function EstoquePage() {
  const catalogo = useCatalogo();
  const inventory = useStore((s) => s.inventory);
  const [busca, setBusca] = useState("");
  const [grupo, setGrupo] = useState<CategoryGroup | "todos">("todos");
  const [ordem, setOrdem] = useState<Ordem>("nome");

  const lista = useMemo(() => {
    const filtrado = filterByGroup(searchViews(catalogo, busca), grupo);
    if (ordem === "nome") return filtrado;
    return [...filtrado].sort((a, b) =>
      ordem === "menor-estoque" ? a.total - b.total : b.total - a.total,
    );
  }, [catalogo, busca, grupo, ordem]);

  const vazio = catalogo.length === 0;

  return (
    <>
      <ScreenTitle
        title="Estoque"
        subtitle="Gerencie todos os produtos da loja"
        action={
          <ButtonLink href="/produto/novo" variant="contorno" size="sm" aria-label="Adicionar produto">
            <Plus size={17} />
            Adicionar
          </ButtonLink>
        }
      />

      <div className="space-y-3">
        <SearchInput
          value={busca}
          onValueChange={setBusca}
          placeholder="Buscar produto, cor ou tamanho..."
        />
        <ChipRow>
          {CATEGORY_GROUPS.map((g) => (
            <Chip key={g.id} active={grupo === g.id} onClick={() => setGrupo(g.id)}>
              {g.label}
            </Chip>
          ))}
          <Chip
            active={ordem !== "nome"}
            onClick={() =>
              setOrdem((atual) =>
                atual === "nome" ? "menor-estoque" : atual === "menor-estoque" ? "maior-estoque" : "nome",
              )
            }
          >
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal size={14} />
              {ordem === "nome" ? "Ordenar" : ordem === "menor-estoque" ? "Menor estoque" : "Maior estoque"}
            </span>
          </Chip>
        </ChipRow>
      </div>

      {vazio ? (
        <EmptyState
          icon={<PackagePlus size={26} />}
          title="Nenhum produto cadastrado"
          description="Cadastre a primeira peça com custo, preço e quantidade por tamanho."
          action={
            <ButtonLink href="/produto/novo" variant="principal" size="md">
              <Plus size={18} />
              Cadastrar produto
            </ButtonLink>
          }
        />
      ) : lista.length === 0 ? (
        <EmptyState
          icon={<PackagePlus size={26} />}
          title="Nada encontrado"
          description="Tente outro nome, cor, tamanho ou SKU."
        />
      ) : (
        <>
          <p className="tabular mb-3 mt-5 text-[13px] text-cinza">
            {lista.length} {lista.length === 1 ? "item" : "itens"} · {totalPieces(inventory)} peças ·{" "}
            {money(stockValueCents(catalogo))} em custo
          </p>
          <ul className="space-y-3">
            {lista.map((view, indice) => (
              <CardProduto key={view.variant.id} view={view} indice={indice} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
