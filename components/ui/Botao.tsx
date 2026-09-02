"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ComponentProps, ReactNode } from "react";

type Variante = "primario" | "secundario" | "whatsapp" | "suave";
type Tamanho = "medio" | "grande";

const variantes: Record<Variante, string> = {
  primario:
    "bg-laranja text-white shadow-carta hover:bg-laranja-forte disabled:bg-tinta-suave",
  secundario:
    "bg-white text-tinta border border-borda shadow-carta hover:border-laranja hover:text-laranja",
  whatsapp: "bg-whatsapp text-white shadow-carta hover:bg-whatsapp-escuro",
  suave: "bg-creme text-laranja-queimado hover:bg-creme-forte",
};

const tamanhos: Record<Tamanho, string> = {
  // Nunca abaixo de 44px de altura: e o minimo confortavel para o dedo.
  medio: "min-h-[48px] px-5 text-[15px]",
  grande: "min-h-[56px] px-6 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-carta font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60";

type BotaoProps = {
  variante?: Variante;
  tamanho?: Tamanho;
  larguraTotal?: boolean;
  children: ReactNode;
} & ComponentProps<"button">;

export function Botao({
  variante = "primario",
  tamanho = "medio",
  larguraTotal = false,
  className = "",
  children,
  ...resto
}: BotaoProps) {
  return (
    <motion.button
      whileTap={{ scale: resto.disabled ? 1 : 0.97 }}
      className={`${base} ${variantes[variante]} ${tamanhos[tamanho]} ${
        larguraTotal ? "w-full" : ""
      } ${className}`}
      {...(resto as ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}

type BotaoLinkProps = {
  href: string;
  variante?: Variante;
  tamanho?: Tamanho;
  larguraTotal?: boolean;
  externo?: boolean;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  onClick?: () => void;
};

export function BotaoLink({
  href,
  variante = "primario",
  tamanho = "medio",
  larguraTotal = false,
  externo = false,
  className = "",
  children,
  ...resto
}: BotaoLinkProps) {
  const classes = `${base} ${variantes[variante]} ${tamanhos[tamanho]} ${
    larguraTotal ? "w-full" : ""
  } ${className}`;

  if (externo) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...resto}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...resto}>
      {children}
    </Link>
  );
}
