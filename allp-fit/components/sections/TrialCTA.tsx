'use client';

/**
 * Aula experimental. O formulário não guarda dado em servidor nenhum: ele monta
 * a mensagem e abre a conversa no WhatsApp da academia, que é onde o
 * atendimento realmente acontece.
 */
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { Botao } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { whatsapp } from '@/data/academy';
import { objetivos, type Objetivo } from '@/data/faq';
import { fotos } from '@/data/gallery';
import { cn } from '@/lib/utils';

export function TrialCTA() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [objetivo, setObjetivo] = useState<Objetivo>('Condicionamento');
  const semMovimento = useReducedMotion();

  const mensagem = useMemo(() => {
    const nomeLimpo = nome.trim();
    const telefoneLimpo = telefone.trim();

    return [
      `Olá! Meu nome é ${nomeLimpo || '[nome]'} e gostaria de conhecer a Allp Fit.`,
      `Meu objetivo é ${objetivo.toLowerCase()}.`,
      telefoneLimpo ? `Meu WhatsApp é ${telefoneLimpo}.` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }, [nome, telefone, objetivo]);

  const enviar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    window.open(whatsapp(mensagem), '_blank', 'noopener,noreferrer');
  };

  const campo =
    'w-full rounded-xl border border-white/12 bg-void/60 px-4 py-3.5 text-[0.95rem] text-white ' +
    'placeholder:text-white/35 transition-colors duration-300 focus:border-ciano/70 focus:outline-none';

  return (
    <section id="aula-experimental" className="relative isolate overflow-hidden py-20 md:py-28">
      <div aria-hidden className="glow-ciano anim-brilho right-[-12%] top-[10%] h-[24rem] w-[24rem] opacity-20" />

      <div className="shell grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            sobrescrito="Aula experimental"
            titulo="Quer conhecer antes de decidir?"
            apoio={
              <>
                Preencha os campos e a conversa abre direto no WhatsApp da academia,
                com a mensagem já escrita. A equipe combina o dia e o horário do seu
                treino de experiência.
              </>
            }
          />

          <Reveal delay={0.1} className="relative mt-10 hidden overflow-hidden rounded-[1.75rem] border border-white/10 lg:block">
            <div className="relative aspect-[16/9]">
              <Image
                src={fotos.esteiras.src}
                alt={fotos.esteiras.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent"
              />
            </div>
          </Reveal>
        </div>

        <Reveal y={34} delay={0.06}>
          <form onSubmit={enviar} className="card p-6 md:p-8">
            <p className="font-display text-xl font-bold text-white md:text-2xl">
              Agende sua aula experimental
            </p>

            <div className="mt-6 grid gap-4">
              <div>
                <label htmlFor="nome" className="mb-2 block text-sm font-medium text-white/85">
                  Nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className={campo}
                />
              </div>

              <div>
                <label htmlFor="telefone" className="mb-2 block text-sm font-medium text-white/85">
                  WhatsApp
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(43) 90000-0000"
                  className={campo}
                />
              </div>

              <fieldset>
                <legend className="mb-2 block text-sm font-medium text-white/85">Objetivo</legend>
                <div className="flex flex-wrap gap-2">
                  {objetivos.map((opcao) => {
                    const ativo = objetivo === opcao;
                    return (
                      <button
                        key={opcao}
                        type="button"
                        onClick={() => setObjetivo(opcao)}
                        aria-pressed={ativo}
                        className={cn(
                          'relative rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300',
                          ativo
                            ? 'border-ciano/70 text-white'
                            : 'border-white/12 text-cinza hover:border-white/25 hover:text-white',
                        )}
                      >
                        {ativo && (
                          <motion.span
                            layoutId="objetivo-ativo"
                            className="absolute inset-0 -z-10 rounded-full bg-ciano/12"
                            transition={
                              semMovimento
                                ? { duration: 0 }
                                : { type: 'spring', stiffness: 420, damping: 34 }
                            }
                          />
                        )}
                        {opcao}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <Botao type="submit" tamanho="lg" className="mt-7 w-full">
              <MessageCircle size={18} aria-hidden />
              Quero conhecer a Allp Fit
              <ArrowRight
                size={17}
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Botao>

            <p className="mt-4 text-xs leading-relaxed text-white/45">
              Ao enviar, o WhatsApp abre com esta mensagem:{' '}
              <span className="text-white/70">“{mensagem}”</span>
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
