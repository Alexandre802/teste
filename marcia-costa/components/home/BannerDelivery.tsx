"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BadgeCheck, Bike, MapPin } from "lucide-react";

import { BotaoLink } from "@/components/ui/Botao";
import { cidadesAtendidas } from "@/data/deliveryZones";

export function BannerDelivery() {
  return (
    <section id="delivery" className="mx-auto max-w-6xl px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="grid overflow-hidden rounded-gigante bg-creme sm:grid-cols-2"
      >
        <div className="order-2 p-6 sm:order-1 sm:p-9">
          <p className="text-[11px] font-bold uppercase tracking-wide text-laranja">
            É rápido e seguro
          </p>
          <h2 className="fonte-titulo mt-2 text-2xl font-extrabold leading-tight text-tinta sm:text-3xl">
            Peça pelo <span className="text-laranja">delivery</span>
            <br />e receba onde estiver!
          </h2>
          <p className="mt-3 flex items-start gap-1.5 text-sm text-tinta-media">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-laranja"
              aria-hidden="true"
            />
            Entregas em {cidadesAtendidas.join(" e ")}
          </p>
          <BotaoLink href="/cardapio" tamanho="grande" className="mt-6">
            <Bike className="h-5 w-5" aria-hidden="true" />
            Pedir agora
          </BotaoLink>
        </div>

        <div className="relative order-1 min-h-[190px] sm:order-2 sm:min-h-[260px]">
          <Image
            src="/images/banners/delivery.jpg"
            alt="Bolsa térmica de entrega da Comida Caseira da Márcia Costa"
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="mt-4 grid overflow-hidden rounded-gigante bg-laranja sm:grid-cols-[1fr_auto]"
      >
        <div className="flex items-start gap-4 p-6 sm:p-8">
          <BadgeCheck
            className="h-10 w-10 shrink-0 text-white/90"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div>
            <h2 className="fonte-titulo text-xl font-extrabold text-white">
              Qualidade em cada detalhe
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/90">
              Ingredientes selecionados, preparo higiênico e o verdadeiro sabor
              da comida caseira.
            </p>
          </div>
        </div>
        <div className="relative min-h-[130px] sm:min-h-full sm:w-64">
          <Image
            src="/images/banners/qualidade.jpg"
            alt="Marmita servida com arroz, feijão, carne e farofa"
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            className="object-cover"
          />
        </div>
      </motion.div>
    </section>
  );
}
