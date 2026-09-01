"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LogoMark } from "@/components/ui/Logo";
import { fadeUp, staggerList, useMotionSettings } from "@/components/ui/Motion";
import { initials } from "@/lib/format";

/**
 * Hero da área do cliente.
 *
 * A foto do barbeiro é configurável em /admin/configuracoes — não existe
 * imagem fixa dentro do componente. Sem foto confirmada, entra um selo com as
 * iniciais em vez de uma foto de banco de imagens fingindo ser o Maicon.
 */
export function Hero({
  barberName,
  photoUrl,
  tagline,
}: {
  barberName: string;
  photoUrl: string | null;
  tagline: string | null;
}) {
  const { rise, duration, reduced } = useMotionSettings();

  return (
    <motion.section
      variants={staggerList(0.06)}
      initial="hidden"
      animate="show"
      className="pt-5 pb-2"
    >
      <div className="flex items-center gap-4 sm:gap-8">
        <motion.h1
          variants={fadeUp(rise, duration)}
          className="min-w-0 flex-1 text-[30px] leading-[1.1] tracking-tight sm:text-[40px]"
        >
          <span className="text-display">Agende seu horário com</span>{" "}
          <span className="block text-display text-[36px] text-gold sm:text-[48px]">
            {barberName}
          </span>
        </motion.h1>

        <motion.div
          variants={fadeUp(reduced ? 0 : 10, duration)}
          className="relative h-28 w-28 shrink-0 sm:h-40 sm:w-40"
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border border-line-gold"
            style={{ boxShadow: "0 0 0 6px rgba(216,155,50,0.05)" }}
          />
          <div className="absolute inset-1.5 overflow-hidden rounded-full bg-surface-2">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={`Foto de ${barberName}`}
                fill
                sizes="(max-width: 640px) 128px, 176px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="grid h-full w-full place-items-center gap-1">
                <LogoMark size={26} className="text-gold/70" />
                <span className="text-[20px] font-medium tracking-[0.12em] text-gold/85">
                  {initials(barberName)}
                </span>
              </div>
            )}
          </div>
          {tagline ? (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-line-gold bg-base px-3 py-1 text-[9px] tracking-[0.18em] text-gold uppercase">
              {tagline}
            </span>
          ) : null}
        </motion.div>
      </div>

      <motion.p
        variants={fadeUp(rise, duration)}
        className="mt-5 text-[14px] leading-relaxed text-muted"
      >
        Escolha o serviço, encontre o melhor horário e pronto. Seu agendamento
        chega automaticamente para o {barberName}.
      </motion.p>
    </motion.section>
  );
}
