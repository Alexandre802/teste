/** Cabeçalho de seção: sobrescrito em ciano, título com máscara e apoio. */
import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { cn } from '@/lib/utils';

type Props = {
  sobrescrito: string;
  titulo: string;
  apoio?: ReactNode;
  centro?: boolean;
  className?: string;
  /** h1 só no hero; as seções usam h2. */
  as?: 'h1' | 'h2';
};

export function SectionHeading({
  sobrescrito,
  titulo,
  apoio,
  centro = false,
  className,
  as = 'h2',
}: Props) {
  return (
    <div className={cn(centro && 'mx-auto text-center', 'max-w-3xl', className)}>
      <Reveal>
        <span className="eyebrow">
          <span className="h-1 w-1 rounded-full bg-ciano shadow-[0_0_8px_var(--color-ciano)]" />
          {sobrescrito}
        </span>
      </Reveal>

      <TextReveal
        as={as}
        centro={centro}
        texto={titulo}
        className="display-lg mt-4 text-white"
        delay={0.05}
      />

      {apoio && (
        <Reveal delay={0.12} className="mt-5 text-base leading-relaxed text-cinza md:text-lg">
          {apoio}
        </Reveal>
      )}
    </div>
  );
}
