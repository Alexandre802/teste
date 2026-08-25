'use client';

/**
 * Modalidades. Cada card usa a foto do próprio ambiente quando existe; quando
 * não existe fotografia confirmada daquela modalidade, entra o marcador da
 * marca — nunca a foto de outro espaço fazendo as vezes.
 *
 * O que aparece aqui é controlado por `data/modalities.ts` (`ativo: false`
 * remove o card sem tocar no componente).
 */
import Image from 'next/image';
import { Activity, ArrowUpRight, Bike, Dumbbell, HeartPulse, Users, Waves } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ItemStagger, Stagger } from '@/components/motion/Reveal';
import { Logo } from '@/components/ui/Logo';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { mensagens, whatsapp } from '@/data/academy';
import { modalidadesAtivas, type Modalidade } from '@/data/modalities';
import { cn } from '@/lib/utils';

const icones: Record<Modalidade['icone'], LucideIcon> = {
  dumbbell: Dumbbell,
  heart: HeartPulse,
  bike: Bike,
  users: Users,
  activity: Activity,
  stretch: Waves,
};

export function Modalities() {
  return (
    <section id="modalidades" className="relative isolate py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          sobrescrito="Modalidades"
          titulo="Escolha o seu treino."
          apoio={
            <>
              Musculação, cardio e aulas em grupo dividindo o mesmo salão. A grade
              de horários das aulas é confirmada pela equipe no WhatsApp.
            </>
          }
        />

        <Stagger
          as="ul"
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          intervalo={0.09}
        >
          {modalidadesAtivas.map((modalidade) => {
            const Icone = icones[modalidade.icone];

            return (
              <ItemStagger as="li" key={modalidade.id} y={26} className="min-w-0">
                <article className="card group flex h-full flex-col">
                  {/* imagem ou marcador da marca */}
                  <div className="relative aspect-[16/11] overflow-hidden">
                    {modalidade.foto ? (
                      <Image
                        src={modalidade.foto.src}
                        alt={modalidade.foto.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_0%,rgba(106,34,230,0.7),transparent_62%),radial-gradient(100%_100%_at_100%_100%,rgba(34,87,255,0.55),transparent_58%)]"
                      >
                        {[22, 34, 46, 58, 70].map((topo, i) => (
                          <span
                            key={topo}
                            className={cn(
                              'led anim-led absolute left-[-10%] w-[120%]',
                              i % 2 === 0 ? 'text-ciano' : 'text-roxo',
                            )}
                            style={{ top: `${topo}%`, animationDelay: `${-i * 3}s`, transform: 'rotate(-6deg)' }}
                          />
                        ))}
                        <span className="absolute inset-0 grid place-items-center">
                          <Logo variante="marca" className="scale-[2.2] opacity-25" />
                        </span>
                      </div>
                    )}

                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent"
                    />

                    <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-void/60 text-ciano backdrop-blur-md">
                      <Icone size={18} aria-hidden />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-bold text-white">{modalidade.nome}</h3>

                    {(modalidade.nivel || modalidade.duracao) && (
                      <p className="mt-2 flex flex-wrap gap-x-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ciano">
                        {modalidade.nivel && <span>{modalidade.nivel}</span>}
                        {modalidade.duracao && <span>{modalidade.duracao}</span>}
                      </p>
                    )}

                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-cinza">
                      {modalidade.descricao}
                    </p>

                    <a
                      href={whatsapp(
                        `Olá! Gostaria de saber mais sobre ${modalidade.nome} na Allp Fit.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors hover:text-laranja"
                    >
                      Saiba mais
                      <ArrowUpRight
                        size={15}
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  </div>
                </article>
              </ItemStagger>
            );
          })}
        </Stagger>

        <p className="mt-8 text-sm text-cinza">
          Quer confirmar a grade de aulas da semana?{' '}
          <a
            href={whatsapp(mensagens.geral)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline decoration-laranja decoration-2 underline-offset-4 hover:text-laranja"
          >
            Fale com a equipe
          </a>
          .
        </p>
      </div>
    </section>
  );
}
