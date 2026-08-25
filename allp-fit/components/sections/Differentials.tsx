/**
 * "Por que treinar na Allp Fit?" — seis cartões com ícone.
 *
 * O ícone ganha um leve movimento no hover (só transform), e o cartão acende o
 * fio de luz do topo, que é o motivo visual do site.
 */
import { Clock, Dumbbell, LayoutGrid, Sparkles, Users, Wind } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ItemStagger, Stagger } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { diferenciais, type Diferencial } from '@/data/differentials';

const icones: Record<Diferencial['icone'], LucideIcon> = {
  dumbbell: Dumbbell,
  wind: Wind,
  users: Users,
  clock: Clock,
  layout: LayoutGrid,
  sparkles: Sparkles,
};

export function Differentials() {
  return (
    <section className="relative isolate py-20 md:py-28">
      <div className="shell">
        <SectionHeading
          centro
          sobrescrito="Diferenciais"
          titulo="Por que treinar na Allp Fit?"
        />

        <Stagger as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" intervalo={0.08}>
          {diferenciais.map((item) => {
            const Icone = icones[item.icone];

            return (
              <ItemStagger as="li" key={item.id} y={24} className="min-w-0">
                <article className="card group h-full p-6 transition-transform duration-500 hover:-translate-y-1 motion-reduce:hover:translate-y-0">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-roxo/35 to-azul/20 text-ciano transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
                    <Icone size={21} aria-hidden />
                  </span>

                  <h3 className="mt-5 font-display text-lg font-bold text-white">{item.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cinza">{item.texto}</p>
                </article>
              </ItemStagger>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
