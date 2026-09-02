"use client";

import { motion } from "framer-motion";
import { Bike, CookingPot, CreditCard, Heart, Sandwich } from "lucide-react";

/**
 * Os cinco diferenciais da casa. Nenhum promete prazo, taxa ou horario:
 * esses numeros so entram no site depois que a Marcia confirmar.
 */
const DIFERENCIAIS = [
  {
    icone: CookingPot,
    titulo: "Comida Caseira",
    texto: "Feita todos os dias com ingredientes fresquinhos.",
  },
  {
    icone: CreditCard,
    titulo: "Marmitas Frescas",
    texto: "Práticas, saborosas e prontas para você.",
  },
  {
    icone: Sandwich,
    titulo: "Lanches Deliciosos",
    texto: "Sanduíches preparados na hora.",
  },
  {
    icone: Bike,
    titulo: "Entrega Rápida",
    texto: "Entregamos em Jacareí e São José dos Campos.",
  },
  {
    icone: Heart,
    titulo: "Feito com Carinho",
    texto: "Cada pedido é preparado com dedicação.",
  },
] as const;

export function Diferenciais() {
  return (
    <section id="diferenciais" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <h2 className="sr-only">Nossos diferenciais</h2>

      <ul className="rolagem-horizontal -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0">
        {DIFERENCIAIS.map((item, indice) => {
          const Icone = item.icone;
          return (
            <motion.li
              key={item.titulo}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: indice * 0.06 }}
              className="flex w-[164px] shrink-0 flex-col items-center rounded-bloco border border-borda bg-white p-5 text-center shadow-carta lg:w-auto"
            >
              <Icone
                className="h-8 w-8 text-laranja"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <h3 className="fonte-titulo mt-4 text-[15px] font-bold leading-tight text-tinta">
                {item.titulo}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-tinta-media">
                {item.texto}
              </p>
              <span
                aria-hidden="true"
                className="mt-4 h-1 w-7 rounded-full bg-laranja"
              />
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
