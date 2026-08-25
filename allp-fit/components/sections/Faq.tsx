'use client';

/**
 * Perguntas frequentes em acordeão. Uma pergunta aberta por vez; a altura é
 * animada, mas o conteúdo continua no DOM para busca e leitor de tela.
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ItemStagger, Reveal, Stagger } from '@/components/motion/Reveal';
import { BotaoLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { mensagens, whatsapp } from '@/data/academy';
import { perguntas } from '@/data/faq';
import { cn } from '@/lib/utils';

export function Faq() {
  const [aberta, setAberta] = useState<string | null>(perguntas[0]?.id ?? null);
  const semMovimento = useReducedMotion();

  return (
    <section id="faq" className="relative isolate py-20 md:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading
            sobrescrito="Dúvidas"
            titulo="Perguntas frequentes"
            apoio={<>Se a sua dúvida não estiver aqui, a equipe responde no WhatsApp.</>}
          />

          <Reveal delay={0.12} className="mt-8">
            <BotaoLink
              href={whatsapp(mensagens.geral)}
              target="_blank"
              rel="noopener noreferrer"
              variante="led"
              tamanho="lg"
            >
              Tirar uma dúvida
            </BotaoLink>
          </Reveal>
        </div>

        <Stagger as="ul" className="grid gap-3" intervalo={0.06}>
          {perguntas.map((item) => {
            const expandida = aberta === item.id;

            return (
              <ItemStagger as="li" key={item.id} y={18}>
                <div
                  className={cn(
                    'card transition-colors duration-500',
                    expandida && 'border-ciano/25',
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setAberta(expandida ? null : item.id)}
                      aria-expanded={expandida}
                      aria-controls={`resposta-${item.id}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6 md:py-5"
                    >
                      <span className="font-display text-[1.02rem] font-bold text-white md:text-lg">
                        {item.pergunta}
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          'grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/12 text-white transition-transform duration-300',
                          expandida && 'rotate-45 border-ciano/50 text-ciano',
                        )}
                      >
                        <Plus size={16} />
                      </span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {expandida && (
                      <motion.div
                        id={`resposta-${item.id}`}
                        key="resposta"
                        initial={semMovimento ? { height: 'auto' } : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={semMovimento ? { height: 'auto', opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-cinza md:px-6 md:pb-6 md:text-[0.95rem]">
                          {item.resposta}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ItemStagger>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
