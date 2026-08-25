'use client';

/**
 * "Quem treina, recomenda."
 *
 * Os depoimentos são transcrições das avaliações públicas do perfil da
 * academia no Google (data/testimonials.ts) — nenhum texto foi escrito em nome
 * de aluno. Onde o Google cortava a frase, o "…" ficou.
 *
 * O carrossel anda sozinho, para quando o visitante interage (mouse, foco,
 * toque) e aceita arrastar no celular, porque é rolagem nativa com encaixe.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, Star } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { academy, links } from '@/data/academy';
import { avaliacoesPublicadas } from '@/data/testimonials';
import { dur, suave } from '@/components/motion/config';
import { cn, numeroBR } from '@/lib/utils';

function Estrelas({ nota }: { nota: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${nota} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          aria-hidden
          className={cn(i <= nota ? 'fill-laranja text-laranja' : 'text-white/20')}
        />
      ))}
    </span>
  );
}

export function Testimonials() {
  const trilha = useRef<HTMLUListElement>(null);
  const [pausado, setPausado] = useState(false);
  const [atual, setAtual] = useState(0);
  const [precisaRolar, setPrecisaRolar] = useState(false);
  const semMovimento = useReducedMotion();

  /** Total de "páginas" = cartões de avaliação + o convite do final. */
  const total = avaliacoesPublicadas.length + 1;

  const irPara = useCallback((indice: number) => {
    const elemento = trilha.current;
    if (!elemento) return;

    const cartao = elemento.children[indice] as HTMLElement | undefined;
    if (!cartao) return;

    elemento.scrollTo({ left: cartao.offsetLeft - elemento.offsetLeft, behavior: 'smooth' });
    setAtual(indice);
  }, []);

  const andar = useCallback(
    (passo: number) => irPara((atual + passo + total) % total),
    [atual, total, irPara],
  );

  // a trilha só "anda" quando o conteúdo excede a largura visível
  useEffect(() => {
    const elemento = trilha.current;
    if (!elemento) return;

    const medir = () => setPrecisaRolar(elemento.scrollWidth > elemento.clientWidth + 8);
    medir();

    const observador = new ResizeObserver(medir);
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  // avanço automático, interrompido em qualquer interação
  useEffect(() => {
    if (pausado || semMovimento || total < 2 || !precisaRolar) return;
    const relogio = window.setInterval(() => andar(1), 5200);
    return () => window.clearInterval(relogio);
  }, [pausado, semMovimento, andar, total, precisaRolar]);

  // mantém os pontos em sincronia quando o visitante arrasta
  useEffect(() => {
    const elemento = trilha.current;
    if (!elemento) return;

    let quadro = 0;
    const aoRolar = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const filhos = Array.from(elemento.children) as HTMLElement[];
        const centro = elemento.scrollLeft + elemento.clientWidth / 2;
        let maisProximo = 0;
        let menorDistancia = Infinity;

        filhos.forEach((filho, i) => {
          const meio = filho.offsetLeft - elemento.offsetLeft + filho.clientWidth / 2;
          const distancia = Math.abs(meio - centro);
          if (distancia < menorDistancia) {
            menorDistancia = distancia;
            maisProximo = i;
          }
        });

        setAtual(maisProximo);
      });
    };

    elemento.addEventListener('scroll', aoRolar, { passive: true });
    return () => {
      elemento.removeEventListener('scroll', aoRolar);
      cancelAnimationFrame(quadro);
    };
  }, []);

  return (
    <section id="avaliacoes" className="relative isolate bg-surface py-20 md:py-28">
      <div aria-hidden className="glow-laranja anim-brilho left-[-10%] bottom-[5%] h-[22rem] w-[22rem] opacity-15" />

      <div className="shell">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <SectionHeading sobrescrito="Avaliações" titulo="Quem treina, recomenda." />

          <Reveal delay={0.1} className="card w-full p-5 md:w-auto md:min-w-[19rem]">
            <div className="flex items-end gap-4">
              <p className="font-display text-[3rem] font-extrabold leading-none tracking-[-0.05em] text-white">
                {numeroBR(academy.avaliacao.nota, 1)}
              </p>
              <div className="pb-1.5">
                <Estrelas nota={Math.round(academy.avaliacao.nota)} />
                <p className="mt-1.5 text-sm text-cinza">
                  {academy.avaliacao.quantidade} avaliações no {academy.avaliacao.fonte}
                </p>
              </div>
            </div>

            <a
              href={links.perfilMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-laranja"
            >
              Ver o perfil no Google
              <ExternalLink size={14} aria-hidden />
            </a>
          </Reveal>
        </div>

        {/* trilha: rolagem nativa com encaixe — arrasta no celular, e no
            desktop os cartões cabem todos sem precisar rolar */}
        <ul
          ref={trilha}
          className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-5 pb-2 [mask-image:linear-gradient(90deg,transparent,#000_2.5rem,#000_calc(100%-2.5rem),transparent)] sm:mx-0 sm:px-0 sm:[mask-image:none]"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
          onFocusCapture={() => setPausado(true)}
          onBlurCapture={() => setPausado(false)}
          onTouchStart={() => setPausado(true)}
        >
          {avaliacoesPublicadas.map((avaliacao, i) => (
            <motion.li
              key={avaliacao.id}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{
                duration: dur(semMovimento, 0.7),
                delay: dur(semMovimento, i * 0.08),
                ease: suave,
              }}
              className="card flex w-[85vw] shrink-0 snap-start flex-col p-6 sm:w-[23rem]"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-roxo to-azul font-display text-base font-bold text-white">
                  {avaliacao.inicial}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{avaliacao.nome}</p>
                  <p className="text-xs text-cinza">{avaliacao.quando}</p>
                </div>
              </div>

              <div className="mt-4">
                <Estrelas nota={avaliacao.nota} />
              </div>

              <blockquote className="mt-3.5 flex-1 text-[0.92rem] leading-relaxed text-white/85">
                {avaliacao.texto}
              </blockquote>

              <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/35">
                Avaliação publicada no Google
              </p>
            </motion.li>
          ))}

          {/* convite: quem já treina aqui alimenta a próxima nota */}
          <li className="flex w-[85vw] shrink-0 snap-start sm:w-[23rem]">
            <div className="flex w-full flex-col justify-between rounded-[var(--radius-card)] border border-dashed border-white/15 bg-white/[0.02] p-6">
              <div>
                <Estrelas nota={5} />
                <p className="mt-4 font-display text-lg font-bold text-white">
                  Já treina na Allp Fit?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-cinza">
                  Sua avaliação ajuda quem ainda está decidindo — e mantém a nota da
                  casa de olho no {academy.avaliacao.fonte}.
                </p>
              </div>

              <a
                href={links.perfilMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-laranja hover:text-white"
              >
                Avaliar no Google
                <ExternalLink size={14} aria-hidden />
              </a>
            </div>
          </li>
        </ul>

        {/* navegação manual: só aparece quando a trilha realmente rola */}
        {precisaRolar && (
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => andar(-1)}
              aria-label="Avaliação anterior"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-ciano/60"
            >
              <ChevronLeft size={19} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => andar(1)}
              aria-label="Próxima avaliação"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-ciano/60"
            >
              <ChevronRight size={19} aria-hidden />
            </button>

            <span className="ml-2 flex items-center gap-1.5" aria-hidden>
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  tabIndex={-1}
                  onClick={() => irPara(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    i === atual ? 'w-7 bg-ciano shadow-[0_0_10px_var(--color-ciano)]' : 'w-1.5 bg-white/25',
                  )}
                />
              ))}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
