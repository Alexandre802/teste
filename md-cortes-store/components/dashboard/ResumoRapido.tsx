"use client";

import Link from "next/link";
import { ChevronRight, Flame, PackageCheck, ShoppingCart, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Linha {
  href: string;
  icone: ReactNode;
  titulo: string;
  detalhe?: ReactNode;
}

/** Os quatro atalhos que respondem "o que está acontecendo na loja". */
export function ResumoRapido({
  maisVendido,
  emAlerta,
  ultimaEntrada,
  ultimaVenda,
}: {
  maisVendido: string | null;
  emAlerta: number;
  ultimaEntrada: string | null;
  ultimaVenda: string | null;
}) {
  const linhas: Linha[] = [
    {
      href: "/relatorios",
      icone: <Flame size={18} className="text-laranja" />,
      titulo: "Produtos mais vendidos",
      detalhe: maisVendido ? <span className="truncate text-[13px] text-cinza">{maisVendido}</span> : null,
    },
    {
      href: "/reposicao",
      icone: <TriangleAlert size={18} className="text-laranja" />,
      titulo: "Estoque baixo",
      detalhe: emAlerta > 0 ? <Badge tone="vermelho">{emAlerta} em alerta</Badge> : <Badge tone="verde">tudo certo</Badge>,
    },
    {
      href: "/estoque",
      icone: <PackageCheck size={18} className="text-azul" />,
      titulo: "Últimas entradas",
      detalhe: ultimaEntrada ? <span className="text-[13px] text-cinza">{ultimaEntrada}</span> : null,
    },
    {
      href: "/vendas",
      icone: <ShoppingCart size={18} className="text-verde" />,
      titulo: "Últimas vendas",
      detalhe: ultimaVenda ? <span className="text-[13px] text-cinza">{ultimaVenda}</span> : null,
    },
  ];

  return (
    <Card>
      <CardHeader title="Resumo rápido" />
      <ul>
        {linhas.map((linha) => (
          <li key={linha.href} className="border-b border-borda last:border-b-0">
            <Link href={linha.href} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-areia">
              <span className="flex size-8 shrink-0 items-center justify-center">{linha.icone}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-snug text-tinta">{linha.titulo}</span>
                {linha.detalhe ? <span className="mt-0.5 block truncate">{linha.detalhe}</span> : null}
              </span>
              <ChevronRight size={17} className="shrink-0 text-cinza-claro" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
