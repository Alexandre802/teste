"use client";

import type { ReactNode } from "react";

/** Filtro em pílula. Selecionado = fundo ouro suave e borda dourada. */
export function Chip({
  active,
  children,
  onClick,
  className = "",
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 shrink-0 rounded-pill border px-4 text-[14px] font-medium transition-colors ${
        active
          ? "border-ouro-borda bg-ouro-suave text-ouro"
          : "border-borda bg-branco text-cinza hover:bg-areia"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <div className="rolagem-invisivel -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5">{children}</div>
  );
}
