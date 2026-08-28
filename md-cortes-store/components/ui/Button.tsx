"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "principal" | "ouro" | "contorno" | "suave" | "texto" | "perigo";
type Size = "sm" | "compacto" | "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  // O botão mais importante do app é preto com o texto em ouro, como na referência.
  principal: "bg-tinta text-ouro-claro hover:bg-[#1d1d1d] active:bg-[#000] shadow-card",
  ouro: "bg-ouro text-branco hover:bg-[#b87c10] active:bg-[#a06b0d] shadow-card",
  contorno: "border border-ouro-borda bg-branco text-ouro hover:bg-ouro-suave",
  suave: "border border-borda bg-branco text-tinta hover:bg-areia",
  texto: "text-ouro hover:bg-ouro-suave",
  perigo: "border border-[#f6d4d4] bg-vermelho-suave text-vermelho hover:bg-[#fbe0e0]",
};

const SIZES: Record<Size, string> = {
  sm: "h-10 px-3.5 text-[14px] rounded-suave gap-1.5",
  // Altura de botão principal com texto menor: cabe "Entrada de estoque"
  // em meia largura de celular sem quebrar linha.
  compacto: "h-12 px-2.5 text-[13.5px] rounded-suave gap-1.5",
  md: "h-12 px-4 text-[15px] rounded-suave gap-2",
  lg: "h-14 px-5 text-[16px] rounded-card gap-2.5",
  xl: "h-[58px] px-6 text-[17px] rounded-card gap-2.5",
};

function classes(variant: Variant, size: Size, full: boolean, extra: string) {
  return [
    "inline-flex items-center justify-center font-semibold transition-colors",
    "disabled:opacity-45 disabled:pointer-events-none select-none",
    VARIANTS[variant],
    SIZES[size],
    full ? "w-full" : "",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

interface Common {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "principal",
  size = "md",
  full = false,
  className = "",
  loading = false,
  children,
  ...props
}: Common & { loading?: boolean } & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={classes(variant, size, full, className)} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "principal",
  size = "md",
  full = false,
  className = "",
  children,
  ...props
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link className={classes(variant, size, full, className)} {...props}>
      {children}
    </Link>
  );
}
