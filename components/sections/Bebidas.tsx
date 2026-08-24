'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { formatPrice, productsByCategory } from '@/lib/catalog';
import { useShop } from '@/lib/store';
import { ProductImage } from '../ui/ProductImage';
import { Marquee, SplitHeading } from '../ui/Motion';

/**
 * Bebidas em destaque, logo depois da comida.
 *
 * Fica num carrossel de arrastar em vez de mais uma grade: são 17 rótulos e a
 * decisão da bebida é rápida — o cliente passa o olho, acha a dele e adiciona.
 * A aba "Bebidas" do cardápio continua existindo para quem procura direto.
 */
export default function Bebidas() {
  const add = useShop((s) => s.add);
  const trilho = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const bebidas = productsByCategory('bebidas');

  const rolar = (dir: -1 | 1) => {
    trilho.current?.scrollBy({ left: dir * 320, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <section aria-labelledby="bebidas-titulo" className="py-14 sm:py-20">
      <Marquee
        items={['Geladas', 'Coca-Cola', 'Guaranita', 'Fanta', 'Sucos naturais', 'Açaí']}
        className="mb-12"
      />

      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-white/75">
              Para acompanhar
            </p>
            <SplitHeading
              text="Bebidas geladas"
              id="bebidas-titulo"
              className="mt-3 text-[clamp(2rem,5.5vw,3.4rem)] font-extrabold leading-none tracking-tight text-white"
            />
            <p className="mt-3 max-w-md text-white/85">
              Lata, garrafa ou 2 litros — arraste para ver tudo.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => rolar(-1)}
              aria-label="Bebidas anteriores"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/45 text-white transition-colors hover:bg-white hover:text-ember"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              type="button"
              onClick={() => rolar(1)}
              aria-label="Próximas bebidas"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/45 text-white transition-colors hover:bg-white hover:text-ember"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        <ul
          ref={trilho}
          className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {bebidas.map((bebida, i) => (
            <motion.li
              key={bebida.id}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: Math.min(i, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="w-[9.5rem] shrink-0 snap-start sm:w-[11rem]"
            >
              <div className="glass group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] transition-transform duration-300 hover:-translate-y-1.5">
                <div className="relative aspect-square w-full overflow-hidden">
                  <ProductImage
                    product={bebida}
                    sizes="176px"
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                  {!bebida.available && (
                    <span className="absolute inset-0 grid place-items-center bg-ember-deep/70 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">
                      Esgotado
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <h3 className="text-[0.8rem] font-extrabold leading-tight text-white">
                    {bebida.name}
                  </h3>
                  <p className="text-base font-extrabold text-white tabular-nums">
                    {formatPrice(bebida.price)}
                  </p>
                  <button
                    type="button"
                    onClick={() => add(bebida.id, 1)}
                    disabled={!bebida.available}
                    className="mt-auto w-full rounded-full bg-white px-3 py-1.5 text-[0.7rem] font-extrabold text-ember transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/55"
                  >
                    {bebida.available ? 'Adicionar' : 'Indisponível'}
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
