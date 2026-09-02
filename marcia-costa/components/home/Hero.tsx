"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpenText, Bike, Heart } from "lucide-react";

import { BotaoLink } from "@/components/ui/Botao";
import { restaurant } from "@/data/restaurant";

const surgir = {
  oculto: { opacity: 0, y: 18 },
  visivel: (atraso: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: atraso, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-tinta">
      {/*
        No celular a fotografia ocupa a tela inteira, como na referencia.
        A partir de lg ela ocupa so a faixa da direita. A fotografia e
        vertical: esticada na largura inteira de um monitor, viraria um zoom
        sem leitura nenhuma. Numa faixa estreita a marmita continua inteira.
      */}
      <div className="absolute inset-0 lg:left-[54%]">
        <Image
          src="/images/banners/hero.jpg"
          alt="Marmita de comida caseira com arroz, feijão, carne, farofa e legumes"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 46vw"
          className="object-cover object-center"
        />
        {/* Overlay para o texto ficar legivel sobre a fotografia. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-tinta/92 via-tinta/72 to-tinta/25 lg:from-tinta lg:via-tinta/45 lg:to-transparent"
        />
      </div>

      <div className="relative mx-auto flex min-h-[78dvh] max-w-6xl flex-col justify-center px-4 py-16 sm:min-h-[70dvh] sm:py-24">
        <motion.span
          variants={surgir}
          initial="oculto"
          animate="visivel"
          custom={0}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-laranja px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white sm:text-xs"
        >
          Fresco • Caseiro • Feito com carinho
          <Heart className="h-4 w-4 fill-white" aria-hidden="true" />
        </motion.span>

        <motion.h1
          variants={surgir}
          initial="oculto"
          animate="visivel"
          custom={0.08}
          className="mt-5 max-w-xl text-[2.75rem] font-extrabold leading-[1.05] text-white sm:text-6xl"
        >
          Sabor de comida{" "}
          <span className="text-laranja-claro">caseira de verdade</span>
        </motion.h1>

        <motion.p
          variants={surgir}
          initial="oculto"
          animate="visivel"
          custom={0.16}
          className="mt-5 max-w-md text-base leading-relaxed text-white/85 sm:text-lg"
        >
          {restaurant.description}
        </motion.p>

        <motion.div
          variants={surgir}
          initial="oculto"
          animate="visivel"
          custom={0.24}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <BotaoLink href="/cardapio" tamanho="grande" className="sm:px-8">
            <Bike className="h-5 w-5" aria-hidden="true" />
            Pedir agora
          </BotaoLink>
          <BotaoLink
            href="#mais-pedidos"
            variante="secundario"
            tamanho="grande"
            className="sm:px-8"
          >
            <BookOpenText className="h-5 w-5" aria-hidden="true" />
            Ver cardápio
          </BotaoLink>
        </motion.div>
      </div>

      {/* Onda laranja que separa o hero do conteudo, como na referencia. */}
      <div
        aria-hidden="true"
        className="onda-laranja absolute inset-x-0 bottom-0 h-6 sm:h-9"
      />
    </section>
  );
}
