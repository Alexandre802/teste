'use client';

/**
 * Galeria cinematográfica.
 *
 * No desktop a rolagem vertical vira deslocamento horizontal: a seção fica
 * presa na tela e as fotos passam de lado, com paralaxe leve dentro de cada
 * quadro. No celular é uma trilha de rolagem nativa com encaixe — arrastar com
 * o dedo é melhor do que sequestrar o scroll.
 *
 * A decisão de qual dos dois usar acontece depois da montagem (matchMedia), e
 * a marcação é a mesma nos dois casos: as fotos existem uma única vez no DOM.
 */
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { NeonDivider } from '@/components/ui/NeonLines';
import { galeria } from '@/data/gallery';
import { cn } from '@/lib/utils';

export function Gallery() {
  const secao = useRef<HTMLElement>(null);
  const [desktop, setDesktop] = useState(false);
  const semMovimento = useReducedMotion();

  useEffect(() => {
    const consulta = window.matchMedia('(min-width: 768px)');
    const aplicar = () => setDesktop(consulta.matches);
    aplicar();
    consulta.addEventListener('change', aplicar);
    return () => consulta.removeEventListener('change', aplicar);
  }, []);

  const trilhoHorizontal = desktop && !semMovimento;

  const { scrollYProgress } = useScroll({
    target: secao,
    offset: ['start start', 'end end'],
  });

  // avanço com mola: o trilho não "gruda" no dedo/roda do mouse
  const progresso = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const x = useTransform(progresso, [0, 1], ['0%', '-72%']);

  return (
    <section
      id="galeria"
      ref={secao}
      aria-label="Galeria de fotos da Allp Fit"
      className="relative isolate"
      style={trilhoHorizontal ? { height: `${galeria.length * 62}vh` } : undefined}
    >
      <NeonDivider />

      <div
        className={cn(
          'flex flex-col justify-center overflow-hidden py-16 md:py-0',
          trilhoHorizontal && 'sticky top-0 h-[100svh]',
        )}
      >
        <div className="shell w-full">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
              <div>
                <span className="eyebrow">
                  <span className="h-1 w-1 rounded-full bg-ciano shadow-[0_0_8px_var(--color-ciano)]" />
                  Galeria
                </span>
                <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold tracking-[-0.035em] text-white">
                  A Allp Fit por dentro
                </h2>
              </div>
              <p className="max-w-xs text-sm text-cinza">
                {trilhoHorizontal
                  ? 'Continue rolando: as fotos passam de lado.'
                  : 'Arraste para o lado para ver todas as fotos.'}
              </p>
            </div>
          </Reveal>
        </div>

        {/* trilho: no desktop é movido pela rolagem; no celular, pelo dedo */}
        <motion.ul
          style={trilhoHorizontal ? { x } : undefined}
          className={cn(
            'flex gap-4 md:gap-6',
            trilhoHorizontal
              ? 'w-max pl-[max(1.25rem,calc((100vw-80rem)/2+2rem))]'
              : 'no-scrollbar w-full snap-x snap-mandatory overflow-x-auto px-5 pb-2',
          )}
        >
          {galeria.map((foto, i) => (
            <li
              key={foto.id}
              className={cn(
                'group relative shrink-0 snap-center overflow-hidden rounded-[1.5rem] border border-white/10',
                'h-[58vh] w-[78vw] sm:w-[60vw] md:h-[62vh] md:w-[34rem]',
              )}
            >
              <Image
                src={foto.src}
                alt={foto.alt}
                fill
                sizes="(max-width: 768px) 80vw, 34rem"
                loading={i === 0 ? 'eager' : 'lazy'}
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:group-hover:scale-100"
              />

              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-void via-void/15 to-transparent"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-roxo to-transparent opacity-60"
              />

              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                <p className="font-display text-lg font-bold text-white md:text-2xl">{foto.titulo}</p>
                <p className="mt-1.5 max-w-sm text-sm text-cinza">{foto.legenda}</p>
              </div>

              <span className="absolute right-5 top-5 rounded-full border border-white/15 bg-void/50 px-2.5 py-1 font-display text-[0.7rem] font-bold text-white backdrop-blur-md">
                {String(i + 1).padStart(2, '0')} / {String(galeria.length).padStart(2, '0')}
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
