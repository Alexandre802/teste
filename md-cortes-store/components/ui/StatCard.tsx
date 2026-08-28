"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { AnimatedNumber } from "./AnimatedNumber";

type Tone = "verde" | "ouro" | "azul" | "roxo" | "laranja" | "vermelho";

const CHIPS: Record<Tone, string> = {
  verde: "bg-verde-suave text-verde",
  ouro: "bg-ouro-suave text-ouro",
  azul: "bg-azul-suave text-azul",
  roxo: "bg-roxo-suave text-roxo",
  laranja: "bg-laranja-suave text-laranja",
  vermelho: "bg-vermelho-suave text-vermelho",
};

const VALUES: Record<Tone, string> = {
  verde: "text-verde",
  ouro: "text-ouro",
  azul: "text-azul",
  roxo: "text-roxo",
  laranja: "text-laranja",
  vermelho: "text-vermelho",
};

/** Cartão de indicador: ícone em pastilha colorida, rótulo cinza, valor grande. */
export function StatCard({
  icon,
  label,
  value,
  format,
  tone = "ouro",
  delay = 0,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  format: (value: number) => string;
  tone?: Tone;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-card border border-borda bg-branco p-4 shadow-card"
    >
      {/* Ícone e rótulo em cima, valor embaixo ocupando a largura toda: em
          meia tela de celular, "R$ 1.956,20" ao lado do ícone estoura o cartão. */}
      <div className="flex items-start gap-2.5">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${CHIPS[tone]}`}>
          {icon}
        </span>
        <span className="min-h-[2.6em] min-w-0 flex-1 text-[12.5px] leading-snug text-cinza">{label}</span>
      </div>
      <AnimatedNumber
        value={value}
        format={format}
        className={`mt-2 block text-[19px] font-bold leading-tight ${VALUES[tone]}`}
      />
    </motion.div>
  );
}
