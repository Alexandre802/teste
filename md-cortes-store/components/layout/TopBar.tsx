"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Monogram } from "@/components/ui/Logo";
import { SyncStatus } from "./SyncStatus";
import { BRAND } from "@/lib/brand";

/** Marca à esquerda, estado da sincronização e alertas à direita. */
export function TopBar({ alertas = 0 }: { alertas?: number }) {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-2 border-b border-borda bg-branco/95 px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 backdrop-blur">
      <Monogram size={30} />
      <span className="marca flex-1 truncate text-[16px] font-bold text-tinta">{BRAND.name}</span>
      <SyncStatus compacto />
      <Link
        href="/reposicao"
        aria-label={alertas > 0 ? `${alertas} alertas de estoque` : "Alertas de estoque"}
        className="relative flex size-10 items-center justify-center rounded-full text-ouro transition-colors hover:bg-ouro-suave"
      >
        <Bell size={20} />
        {alertas > 0 ? (
          <span className="tabular absolute right-1 top-1 flex min-w-[17px] items-center justify-center rounded-full bg-vermelho px-1 text-[10px] font-bold leading-[17px] text-branco">
            {alertas > 9 ? "9+" : alertas}
          </span>
        ) : null}
      </Link>
    </header>
  );
}
