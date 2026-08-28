"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

/** Cabeçalho de tela interna: voltar, título centralizado e ação à direita. */
export function PageHeader({
  title,
  action,
  onBack,
}: {
  title: string;
  action?: ReactNode;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-2 border-b border-borda bg-branco/95 px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-3 backdrop-blur">
      <button
        type="button"
        onClick={() => (onBack ? onBack() : router.back())}
        aria-label="Voltar"
        className="-ml-2 flex size-10 items-center justify-center rounded-full text-ouro transition-colors hover:bg-ouro-suave"
      >
        <ChevronLeft size={22} />
      </button>
      <h1 className="flex-1 truncate text-center text-[17px] font-bold text-tinta">{title}</h1>
      <span className="flex min-w-10 justify-end">{action}</span>
    </header>
  );
}

/** Cabeçalho de tela raiz: título grande à esquerda, como no painel. */
export function ScreenTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.01em] text-tinta">{title}</h1>
        {subtitle ? <p className="mt-1 text-[14px] text-cinza">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
