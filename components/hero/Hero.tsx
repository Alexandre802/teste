'use client';

import { useRef } from 'react';
import { business, whatsappUrl } from '@/lib/business';
import { BurgerMark, CutleryIcon, WhatsAppIcon } from '../ui/Icons';
import ExplodedBurger from './ExplodedBurger';

/**
 * Primeira dobra.
 *
 * A seção é mais alta que a tela e o conteúdo fica `sticky`: a página rola, o
 * hero permanece à vista, e esse trecho de rolagem é o que abre o lanche. O
 * fundo laranja é o do documento — não há camada escura em lugar nenhum.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section id="inicio" ref={sectionRef} className="relative h-[172svh] lg:h-[200svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="mx-auto grid h-full w-full max-w-[86rem] items-center gap-4 px-5 pt-24 pb-8 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-20 lg:pb-0">
          {/* ── texto e CTAs ── */}
          <div className="order-2 lg:order-1">
            <h1 className="text-[clamp(2.5rem,8.5vw,6.25rem)] font-extrabold leading-[0.9] tracking-[-0.035em] text-white drop-shadow-[0_6px_26px_rgba(150,55,5,0.35)]">
              Michel
              <br />
              Food House
            </h1>

            <div className="my-5 flex max-w-xl items-center gap-4 lg:my-7" aria-hidden="true">
              <span className="h-px flex-1 bg-white/50" />
              <BurgerMark className="h-7 w-7 shrink-0 text-white" />
              <span className="h-px flex-1 bg-white/50" />
            </div>

            <p className="max-w-xl text-[clamp(1rem,2.3vw,1.4rem)] leading-snug text-white/95">
              O sabor que impressiona na{' '}
              <strong className="font-extrabold text-white">primeira mordida</strong>.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-9">
              <a
                href="#cardapio"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 text-base font-extrabold text-cocoa shadow-[0_16px_40px_-14px_rgba(110,40,5,0.6)] transition-transform duration-200 hover:-translate-y-0.5 sm:text-lg"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-flame text-white">
                  <CutleryIcon className="h-4.5 w-4.5" />
                </span>
                Coma aqui
              </a>

              <a
                href={whatsappUrl(
                  `Olá! Vim pelo site da ${business.name} e gostaria de fazer um pedido.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-full border-2 border-white/75 px-7 py-4 text-base font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-cocoa sm:text-lg"
              >
                <WhatsAppIcon className="h-6 w-6" />
                WhatsApp
              </a>
            </div>

            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-white/90 lg:mt-7">
              <span className="font-extrabold text-white">
                ★ {business.rating.value.toString().replace('.', ',')}
              </span>
              <span>{business.rating.count} avaliações no Google</span>
              <span aria-hidden="true">·</span>
              <span>{business.openingNote}</span>
            </p>
          </div>

          {/* ── o lanche que se abre ── */}
          <div className="order-1 flex min-h-0 items-center justify-center lg:order-2">
            <ExplodedBurger targetRef={sectionRef} />
          </div>
        </div>

        <a
          href="#cardapio"
          aria-label="Rolar para o cardápio"
          className="absolute inset-x-0 bottom-5 mx-auto hidden w-fit flex-col items-center gap-1.5 text-white/80 transition-colors hover:text-white lg:flex"
        >
          <span className="grid h-10 w-6 place-items-start rounded-full border border-current pt-2">
            <span className="animate-bob mx-auto h-2 w-1 rounded-full bg-current" />
          </span>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
