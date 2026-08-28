"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Barcode,
  CalendarClock,
  Pencil,
  Plus,
  ShoppingCart,
  Shirt,
  Tag,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useStore } from "@/lib/store";
import { categoryGroup, categoryLabel } from "@/lib/constants";
import { money, units } from "@/lib/format";
import { longDate, relativeTime } from "@/lib/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StockBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { ColorDot } from "@/components/ui/ProductThumb";
import { EmptyState } from "@/components/ui/EmptyState";

const GRUPOS = { roupas: "Roupas", acessorios: "Acessórios", calcados: "Calçados" } as const;

export default function DetalheProdutoPage() {
  const parametros = useParams<{ variantId: string }>();
  const catalogo = useCatalogo();
  const suppliers = useStore((s) => s.suppliers);
  const movements = useStore((s) => s.movements);

  const view = useMemo(
    () => catalogo.find((v) => v.variant.id === parametros.variantId),
    [catalogo, parametros.variantId],
  );

  const ultimaEntrada = useMemo(
    () =>
      movements.find(
        (m) => m.variantId === parametros.variantId && (m.kind === "entrada" || m.kind === "cadastro"),
      ),
    [movements, parametros.variantId],
  );

  if (!view) {
    return (
      <>
        <PageHeader title="Detalhes do produto" />
        <EmptyState icon={<Shirt size={26} />} title="Produto não encontrado" description="Ele pode ter sido removido." />
      </>
    );
  }

  const { product, variant, sizes, total, profitCents } = view;
  const fornecedor = suppliers.find((f) => f.id === product.supplierId);

  return (
    <>
      <PageHeader
        title="Detalhes do produto"
        action={
          <Link
            href={`/produto/${variant.id}/editar`}
            aria-label="Editar produto"
            className="flex size-10 items-center justify-center rounded-full text-ouro transition-colors hover:bg-ouro-suave"
          >
            <Pencil size={19} />
          </Link>
        }
      />

      <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-card border border-borda bg-areia">
        {variant.imageUrl ? (
          <Image
            src={variant.imageUrl}
            alt={`${product.name} ${variant.colorName}`}
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-contain p-4"
            priority
          />
        ) : (
          <span className="flex flex-col items-center gap-2 text-ouro-claro">
            <Shirt size={72} strokeWidth={1.2} />
            <span className="text-[13px] text-cinza">sem foto cadastrada</span>
          </span>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold leading-tight tracking-[-0.01em] text-tinta">{product.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[13px] text-cinza">
            <ColorDot hex={variant.colorHex} size={12} />
            {variant.colorName}
            <span className="text-borda-forte">•</span>
            {GRUPOS[categoryGroup(product.category)]}
            <span className="text-borda-forte">•</span>
            {categoryLabel(product.category)}
          </p>
        </div>
        <StockBadge total={total} minStock={product.minStock} />
      </div>

      <h2 className="mb-2 mt-5 text-[14px] font-semibold text-tinta">Tamanhos e quantidades</h2>
      {sizes.length === 0 ? (
        <p className="rounded-suave bg-areia px-4 py-3 text-[14px] text-cinza">
          Nenhum tamanho cadastrado ainda.
        </p>
      ) : (
        <ul className="grid grid-cols-4 gap-2.5">
          {sizes.map((s) => (
            <li
              key={s.size}
              className={`flex flex-col items-center justify-center rounded-suave border py-3 ${
                s.quantity === 0
                  ? "border-borda bg-areia"
                  : s.quantity <= product.minStock
                    ? "border-[#f6dcbc] bg-laranja-suave"
                    : "border-borda bg-branco"
              }`}
            >
              <span className="text-[13px] font-semibold text-cinza">{s.size}</span>
              <span
                className={`tabular text-[22px] font-bold leading-tight ${
                  s.quantity === 0 ? "text-cinza-claro" : s.quantity <= product.minStock ? "text-laranja" : "text-tinta"
                }`}
              >
                {s.quantity}
              </span>
              <span className="text-[11px] text-cinza">unidades</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <ValorCard icone={<Tag size={18} />} tom="ouro" rotulo="Custo unitário" valor={money(product.costCents)} />
        <ValorCard icone={<Tag size={18} />} tom="verde" rotulo="Preço de venda" valor={money(product.priceCents)} />
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-card border border-[#cdeed8] bg-verde-suave p-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-branco text-verde">
          <TrendingUp size={19} />
        </span>
        <span>
          <span className="block text-[13px] text-grafite">Lucro por unidade</span>
          <span className="tabular block text-[20px] font-bold text-verde">{money(profitCents)}</span>
        </span>
      </div>

      <Card className="mt-3">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-[15px] text-tinta">Estoque total</span>
          <span className="tabular text-[15px] font-bold text-tinta">{units(total)}</span>
        </div>
      </Card>

      <Card className="mt-3">
        <Linha icone={<Barcode size={17} />} rotulo="SKU" valor={variant.sku ?? product.sku ?? "—"} />
        <Linha icone={<Truck size={17} />} rotulo="Fornecedor" valor={fornecedor?.name ?? "—"} />
        <Linha
          icone={<Tag size={17} />}
          rotulo="Categoria"
          valor={`${GRUPOS[categoryGroup(product.category)]} > ${categoryLabel(product.category)}`}
        />
        <Linha
          icone={<CalendarClock size={17} />}
          rotulo="Última entrada"
          valor={ultimaEntrada ? `${longDate(ultimaEntrada.createdAt)} (${relativeTime(ultimaEntrada.createdAt)})` : "—"}
        />
        <Linha icone={<Shirt size={17} />} rotulo="Estoque mínimo" valor={units(product.minStock)} />
      </Card>

      <div className="mt-5 space-y-2.5">
        <ButtonLink href={`/entrada?variante=${variant.id}`} variant="contorno" size="lg" full>
          <Plus size={19} />
          Entrada de estoque
        </ButtonLink>
        <ButtonLink
          href={`/venda?variante=${variant.id}`}
          variant="ouro"
          size="lg"
          full
          className={total === 0 ? "pointer-events-none opacity-45" : ""}
        >
          <ShoppingCart size={19} />
          Registrar venda
        </ButtonLink>
        <ButtonLink href={`/produto/${variant.id}/editar`} variant="suave" size="md" full>
          <Pencil size={17} />
          Editar produto
        </ButtonLink>
      </div>
    </>
  );
}

function ValorCard({
  icone,
  rotulo,
  valor,
  tom,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
  tom: "ouro" | "verde";
}) {
  return (
    <div className="rounded-card border border-borda bg-branco p-4 shadow-card">
      <span
        className={`mb-2 flex size-9 items-center justify-center rounded-full ${
          tom === "ouro" ? "bg-ouro-suave text-ouro" : "bg-verde-suave text-verde"
        }`}
      >
        {icone}
      </span>
      <span className="block text-[13px] text-cinza">{rotulo}</span>
      <span className="tabular block text-[19px] font-bold text-tinta">{valor}</span>
    </div>
  );
}

function Linha({ icone, rotulo, valor }: { icone: React.ReactNode; rotulo: string; valor: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-borda px-4 py-3 last:border-b-0">
      <span className="text-cinza-claro">{icone}</span>
      <span className="flex-1 text-[14px] text-grafite">{rotulo}</span>
      <span className="max-w-[55%] truncate text-right text-[14px] font-medium text-tinta">{valor}</span>
    </div>
  );
}
