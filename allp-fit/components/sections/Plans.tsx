'use client';

/**
 * Planos — a seção que converte.
 *
 * IMPORTANTE: nenhum preço é inventado. Enquanto `preco` estiver `null` em
 * data/plans.ts, o cartão mostra "Consulte" e manda para o WhatsApp. Quando os
 * valores oficiais entrarem no arquivo de dados, eles aparecem aqui sem
 * qualquer mudança de layout, e a troca Mensal/Anual já anima o valor.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { ItemStagger, Reveal, Stagger } from '@/components/motion/Reveal';
import { BotaoLink } from '@/components/ui/Button';
import { PlanToggle } from '@/components/ui/PlanToggle';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PlanComparison } from '@/components/sections/PlanComparison';
import { whatsapp } from '@/data/academy';
import { planos, precoIndefinido, type Periodo } from '@/data/plans';
import { dur, suave } from '@/components/motion/config';
import { cn, precoBR } from '@/lib/utils';

export function Plans() {
  const [periodo, setPeriodo] = useState<Periodo>('mensal');
  const semMovimento = useReducedMotion();

  return (
    <section id="planos" className="relative isolate overflow-hidden bg-surface py-20 md:py-28">
      <div aria-hidden className="glow-roxo anim-brilho left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 opacity-25" />

      <div className="shell">
        <SectionHeading
          centro
          sobrescrito="Planos"
          titulo="Encontre o plano ideal para você."
          apoio={
            <>
              Três níveis de acesso à estrutura da Allp Fit. Escolha o seu e a
              equipe finaliza a matrícula com você.
            </>
          }
        />

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <PlanToggle valor={periodo} onChange={setPeriodo} />
        </Reveal>

        <Stagger
          as="ul"
          className="mt-12 grid items-stretch gap-5 lg:grid-cols-3"
          intervalo={0.11}
        >
          {planos.map((plano) => {
            const valor = plano.preco[periodo];

            return (
              <ItemStagger as="li" key={plano.id} y={30} className="min-w-0">
                <motion.article
                  whileInView={plano.destaque ? { scale: [0.985, 1.015, 1] } : undefined}
                  viewport={{ once: true, margin: '-20% 0px' }}
                  transition={{ duration: dur(semMovimento, 1.1), ease: suave }}
                  className={cn(
                    'relative flex h-full flex-col rounded-[1.75rem] p-6 md:p-7',
                    plano.destaque
                      ? 'border border-laranja/45 bg-gradient-to-b from-laranja/12 via-white/[0.03] to-transparent shadow-[0_30px_80px_-40px_rgba(255,75,31,0.65)]'
                      : 'border border-white/10 bg-white/[0.025]',
                  )}
                >
                  {plano.destaque && (
                    <>
                      <span
                        aria-hidden
                        className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-laranja to-transparent"
                      />
                      <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-laranja px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_28px_-8px_rgba(255,75,31,0.9)]">
                        <Sparkles size={12} aria-hidden />
                        Mais escolhido
                      </span>
                    </>
                  )}

                  <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-white">
                    Plano {plano.nome}
                  </h3>
                  <p className="mt-1.5 text-sm text-cinza">{plano.resumo}</p>

                  {/* valor: troca com animação quando o período muda */}
                  <div className="mt-7 min-h-[5.25rem]">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`${plano.id}-${periodo}`}
                        initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
                        transition={{ duration: dur(semMovimento, 0.34), ease: suave }}
                      >
                        {valor === null ? (
                          <>
                            <p className="font-display text-[2.6rem] font-extrabold leading-none tracking-[-0.04em] text-white">
                              {precoIndefinido}
                            </p>
                            <p className="mt-2.5 text-xs leading-relaxed text-cinza">
                              Valores do plano {periodo} confirmados pela equipe — sem
                              surpresa na recepção.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-display text-[2.6rem] font-extrabold leading-none tracking-[-0.04em] text-white">
                              {precoBR(valor, precoIndefinido)}
                              <span className="ml-1 align-baseline text-sm font-semibold text-cinza">
                                /mês
                              </span>
                            </p>
                            <p className="mt-2.5 text-xs text-cinza">
                              {periodo === 'anual' ? 'No plano anual' : 'No plano mensal'}
                            </p>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plano.beneficios.map((beneficio) => (
                      <li key={beneficio} className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full',
                            plano.destaque
                              ? 'border border-laranja/50 bg-laranja/15'
                              : 'border border-ciano/35 bg-ciano/10',
                          )}
                        >
                          <Check
                            size={12}
                            aria-hidden
                            className={plano.destaque ? 'text-laranja' : 'text-ciano'}
                          />
                        </span>
                        <span className="text-[0.92rem] leading-relaxed text-white/90">
                          {beneficio}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <BotaoLink
                    href={whatsapp(
                      `Olá! Tenho interesse no Plano ${plano.nome} (${periodo}) da Allp Fit. Pode me passar os valores?`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    variante={plano.destaque ? 'chama' : 'led'}
                    tamanho="lg"
                    className="mt-8 w-full"
                  >
                    {plano.cta}
                    <ArrowRight
                      size={17}
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </BotaoLink>
                </motion.article>
              </ItemStagger>
            );
          })}
        </Stagger>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-white/45">
            Os nomes e os benefícios acima seguem a estrutura de planos da academia.
            Os valores atualizados de cada plano são informados pela equipe no
            WhatsApp ou na recepção da unidade.
          </p>
        </Reveal>

        <PlanComparison />
      </div>
    </section>
  );
}
