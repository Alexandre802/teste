'use client';

/**
 * "Não é apenas uma academia": o texto institucional ao lado da foto do salão,
 * que cresce devagar enquanto a seção passa pela tela.
 *
 * A lista está dividida em duas: o que a casa oferece e o que aparece como
 * comentário recorrente nas avaliações. A segunda parte declara a fonte, para
 * não vender como serviço anunciado aquilo que veio de resenha de aluno.
 */
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Check, Quote } from 'lucide-react';
import { useRef } from 'react';
import { ItemStagger, Reveal, Stagger } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { itensEstrutura } from '@/data/differentials';
import { fotos } from '@/data/gallery';
import { resumoGoogle } from '@/data/testimonials';

export function About() {
  const moldura = useRef<HTMLDivElement>(null);
  const semMovimento = useReducedMotion();

  // a foto entra levemente ampliada e assenta conforme a seção sobe
  const { scrollYProgress } = useScroll({
    target: moldura,
    offset: ['start end', 'end start'],
  });
  const escala = useTransform(scrollYProgress, [0, 0.55, 1], [1.16, 1, 1.06]);
  const deslocamento = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);

  const confirmados = itensEstrutura.filter((item) => item.confirmado);
  const mencionados = itensEstrutura.filter((item) => !item.confirmado);

  return (
    <section id="sobre" className="relative isolate overflow-hidden py-20 md:py-28">
      <div aria-hidden className="glow-roxo anim-brilho -left-[12%] top-[10%] h-[24rem] w-[24rem] opacity-30" />

      <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <SectionHeading
            sobrescrito="A Allp Fit"
            titulo="Não é apenas uma academia."
            apoio={
              <>
                A Allp Fit une estrutura, equipamentos modernos, conforto e uma
                experiência de treino criada para quem busca evolução.
              </>
            }
          />

          <Stagger as="ul" className="mt-10 grid grid-cols-1 gap-y-3 sm:grid-cols-2" intervalo={0.06}>
            {confirmados.map((item) => (
              <ItemStagger as="li" key={item.texto} y={14} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ciano/40 bg-ciano/10">
                  <Check size={13} className="text-ciano" aria-hidden />
                </span>
                <span className="text-[0.95rem] text-white/90">{item.texto}</span>
              </ItemStagger>
            ))}
          </Stagger>

          <Reveal delay={0.1} className="card mt-10 p-5 md:p-6">
            <Quote size={18} className="text-laranja" aria-hidden />
            <p className="mt-3 text-sm leading-relaxed text-cinza">{resumoGoogle.texto}</p>
            <p className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/45">
              {resumoGoogle.atribuicao}
            </p>

            {mencionados.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {mencionados.map((item) => (
                  <li
                    key={item.texto}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.78rem] text-white/80"
                  >
                    {item.texto}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>

        {/* foto do salão, com crescimento controlado pela rolagem */}
        <Reveal y={40} delay={0.05}>
          <div
            ref={moldura}
            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 sm:aspect-[5/4] lg:aspect-[4/5]"
          >
            <motion.div
              className="absolute inset-0"
              style={semMovimento ? undefined : { scale: escala, y: deslocamento }}
            >
              <Image
                src={fotos.salao.src}
                alt={fotos.salao.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-[50%_35%]"
              />
            </motion.div>

            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ciano/80 to-transparent"
            />

            <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
              <p className="font-display text-lg font-bold text-white md:text-xl">
                {fotos.salao.titulo}
              </p>
              <p className="mt-1 max-w-sm text-sm text-cinza">{fotos.salao.legenda}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
