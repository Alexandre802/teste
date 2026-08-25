'use client';

/**
 * Hero cinematográfico.
 *
 * A foto é a do próprio salão da academia. Ao carregar, ela entra com um zoom
 * muito lento; o mouse desloca a imagem alguns pixels (nunca o texto), e a
 * rolagem afunda a foto enquanto o conteúdo sobe. Todo o movimento é
 * `transform`/`opacity`; com `prefers-reduced-motion` a cena entra montada e
 * imóvel.
 */
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { BotaoLink } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { academy } from '@/data/academy';
import { notaHorario } from '@/data/businessHours';
import { fotos } from '@/data/gallery';
import { dur, suave } from '@/components/motion/config';
import { numeroBR } from '@/lib/utils';

export function Hero() {
  const secao = useRef<HTMLElement>(null);
  const semMovimento = useReducedMotion();

  // paralaxe de rolagem: a foto desce mais devagar que o conteúdo
  const { scrollY } = useScroll();
  const fotoY = useTransform(scrollY, [0, 900], ['0%', '16%']);
  const conteudoY = useTransform(scrollY, [0, 700], [0, -70]);
  const conteudoOpacidade = useTransform(scrollY, [0, 520], [1, 0]);

  // deslocamento pelo mouse — poucos pixels, com mola
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const molaX = useSpring(mouseX, { stiffness: 60, damping: 22, mass: 0.6 });
  const molaY = useSpring(mouseY, { stiffness: 60, damping: 22, mass: 0.6 });

  const aoMover = useCallback(
    (evento: React.MouseEvent<HTMLElement>) => {
      if (semMovimento) return;
      const area = evento.currentTarget.getBoundingClientRect();
      const px = (evento.clientX - area.left) / area.width - 0.5;
      const py = (evento.clientY - area.top) / area.height - 0.5;
      mouseX.set(px * -26);
      mouseY.set(py * -18);
    },
    [mouseX, mouseY, semMovimento],
  );

  useEffect(() => {
    if (!semMovimento) return;
    mouseX.set(0);
    mouseY.set(0);
  }, [semMovimento, mouseX, mouseY]);

  const selos: { id: string; icone: ReactNode; forte: string; fraco?: string }[] = [
    {
      id: 'nota',
      icone: <Star size={14} className="fill-laranja text-laranja" aria-hidden />,
      forte: `${numeroBR(academy.avaliacao.nota, 1)} no ${academy.avaliacao.fonte}`,
      fraco: `${academy.avaliacao.quantidade} avaliações`,
    },
    {
      id: 'horario',
      icone: <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lima shadow-[0_0_8px_var(--color-lima)]" />,
      forte: notaHorario,
    },
    {
      id: 'local',
      icone: <MapPin size={14} className="text-ciano" aria-hidden />,
      forte: 'Centro de Londrina',
      fraco: 'com estacionamento',
    },
  ];

  return (
    <section
      id="inicio"
      ref={secao}
      onMouseMove={aoMover}
      className="relative isolate grain flex min-h-[100svh] items-center overflow-hidden pt-24 pb-20 md:pt-28 md:pb-32"
    >
      {/* ── fotografia da unidade ───────────────────────────────────────── */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={semMovimento ? undefined : { y: fotoY }}
      >
        <motion.div
          className="absolute -left-[4%] -top-[6%] h-[112%] w-[108%]"
          style={semMovimento ? undefined : { x: molaX, y: molaY }}
          initial={{ scale: 1.14, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: dur(semMovimento, 2.4), ease: suave }}
        >
          <Image
            src={fotos.salao.src}
            alt={fotos.salao.alt}
            fill
            priority
            sizes="100vw"
            quality={82}
            className="object-cover object-[50%_48%]"
          />
        </motion.div>
      </motion.div>

      {/* ── camadas de leitura: escurece a foto e puxa o roxo/azul ──────── */}
      {/* No celular o texto fica sobre a foto: o escuro sobe de baixo. No
          desktop ele vem da esquerda e o lado direito da foto fica limpo — é
          ali que as fitas de LED aparecem. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(9,9,15,0.97)_0%,rgba(9,9,15,0.86)_32%,rgba(9,9,15,0.6)_58%,rgba(9,9,15,0.2)_82%,rgba(9,9,15,0.45)_100%)] md:bg-[linear-gradient(90deg,rgba(9,9,15,0.94)_0%,rgba(9,9,15,0.6)_34%,rgba(9,9,15,0.12)_66%,rgba(9,9,15,0)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_50%_100%,rgba(9,9,15,0.7)_0%,transparent_60%)]"
      />
      <div aria-hidden className="glow-roxo anim-brilho -z-10 left-[-15%] top-[8%] h-[26rem] w-[26rem] opacity-25" />

      {/* ── conteúdo ────────────────────────────────────────────────────── */}
      <motion.div
        className="shell relative"
        style={semMovimento ? undefined : { y: conteudoY, opacity: conteudoOpacidade }}
      >
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur(semMovimento, 0.7), delay: dur(semMovimento, 0.15), ease: suave }}
            className="glass inline-flex items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4"
          >
            <Logo variante="marca" />
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/85 md:text-[0.72rem]">
              Academia em {academy.endereco.cidade} — {academy.endereco.estado}
            </span>
          </motion.div>

          <h1 className="mt-7 md:mt-9">
            <span className="sr-only">Allp Fit — treine em outro nível</span>
            <span aria-hidden className="block overflow-hidden pb-[0.04em]">
              <motion.span
                className="display-xl block font-display font-extrabold text-white"
                initial={{ y: '105%' }}
                animate={{ y: '0%' }}
                transition={{ duration: dur(semMovimento, 1), delay: dur(semMovimento, 0.35), ease: suave }}
              >
                TREINE EM
              </motion.span>
            </span>
            <span aria-hidden className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="display-xl text-led block font-display font-extrabold"
                initial={{ y: '105%' }}
                animate={{ y: '0%' }}
                transition={{ duration: dur(semMovimento, 1), delay: dur(semMovimento, 0.47), ease: suave }}
              >
                OUTRO NÍVEL.
              </motion.span>
            </span>
          </h1>

          <motion.p
            className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur(semMovimento, 0.8), delay: dur(semMovimento, 0.72), ease: suave }}
          >
            Estrutura completa, equipamentos modernos, conforto e uma experiência
            criada para transformar cada treino — no Centro de Londrina.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            initial="oculto"
            animate="visivel"
            variants={{
              visivel: {
                transition: {
                  staggerChildren: dur(semMovimento, 0.1),
                  delayChildren: dur(semMovimento, 0.9),
                },
              },
            }}
          >
            {[
              <BotaoLink key="planos" href="#planos" tamanho="lg" className="w-full sm:w-auto">
                Conheça nossos planos
                <ArrowRight
                  size={18}
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </BotaoLink>,
              <BotaoLink
                key="experimental"
                href="#aula-experimental"
                variante="led"
                tamanho="lg"
                className="w-full sm:w-auto"
              >
                Aula experimental
              </BotaoLink>,
            ].map((botao, i) => (
              <motion.div
                key={i}
                className="w-full sm:w-auto"
                variants={{
                  oculto: { opacity: 0, y: 20 },
                  visivel: { opacity: 1, y: 0, transition: { duration: dur(semMovimento, 0.6), ease: suave } },
                }}
              >
                {botao}
              </motion.div>
            ))}
          </motion.div>

          {/* selos: nota do Google, horário e localização */}
          <motion.ul
            className="mt-10 flex flex-wrap items-center gap-2.5 md:mt-12"
            initial="oculto"
            animate="visivel"
            variants={{
              visivel: {
                transition: {
                  staggerChildren: dur(semMovimento, 0.09),
                  delayChildren: dur(semMovimento, 1.25),
                },
              },
            }}
          >
            {selos.map((selo) => (
              <motion.li
                key={selo.id}
                variants={{
                  oculto: { opacity: 0, y: 14, filter: 'blur(6px)' },
                  visivel: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: dur(semMovimento, 0.6), ease: suave },
                  },
                }}
                className="glass flex items-center gap-2 rounded-full px-3.5 py-2"
              >
                {selo.icone}
                <span className="text-[0.78rem] font-semibold text-white">{selo.forte}</span>
                {selo.fraco && (
                  <>
                    <span aria-hidden className="h-3 w-px bg-white/20" />
                    <span className="text-[0.72rem] text-cinza">{selo.fraco}</span>
                  </>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>

      {/* indicação de rolagem */}
      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: dur(semMovimento, 1.7), duration: dur(semMovimento, 0.8) }}
      >
        <span className="text-[0.62rem] font-semibold tracking-[0.3em] text-cinza">ROLE</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-ciano shadow-[0_0_10px_var(--color-ciano)]"
            animate={semMovimento ? undefined : { y: ['-100%', '260%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.div>
    </section>
  );
}
