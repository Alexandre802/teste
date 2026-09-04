import { CalendarDays, Gem, Home, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Reveal } from './ui/Reveal';

type Pilar = {
  icone: LucideIcon;
  titulo: string;
  texto: string;
};

const pilares: Pilar[] = [
  {
    icone: Home,
    titulo: 'Imóveis\nselecionados',
    texto: 'Curadoria rigorosa e visitas apenas ao que faz sentido.',
  },
  {
    icone: CalendarDays,
    titulo: 'Visitas\nagendadas',
    texto: 'Organização completa e otimização do seu tempo.',
  },
  {
    icone: User,
    titulo: 'Atendimento\npersonalizado',
    texto: 'Acompanhamento próximo e dedicado em cada etapa.',
  },
  {
    icone: Gem,
    titulo: 'Alto\npadrão',
    texto: 'Imóveis únicos para um estilo de vida de alto padrão.',
  },
];

/**
 * Os quatro pilares da faixa escura. Em telas pequenas ficam 2×2: quatro
 * colunas num celular deixariam o texto abaixo do tamanho legível.
 */
export const AboutFeatures = () => (
  <ul className="mx-auto mt-11 grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 min-[560px]:grid-cols-4">
    {pilares.map(({ icone: Icone, titulo, texto }, indice) => (
      <li key={titulo} className="flex">
        <Reveal delay={indice * 0.08} className="flex w-full">
          <div className="flex w-full flex-col items-center rounded-card border border-dourado/20 bg-card px-3 py-6 text-center sm:px-4 sm:py-7">
            <span className="flex size-11 items-center justify-center rounded-full border border-dourado/45">
              <Icone aria-hidden="true" strokeWidth={1.3} className="size-5 text-dourado-claro" />
            </span>

            <h3 className="mt-4 font-serif text-[1.15rem] leading-tight font-light whitespace-pre-line text-branco sm:text-[1.25rem]">
              {titulo}
            </h3>

            <span aria-hidden="true" className="mt-3 block h-px w-8 bg-dourado/55" />

            <p className="mt-3 text-[0.76rem] leading-relaxed text-texto sm:text-[0.8rem]">
              {texto}
            </p>
          </div>
        </Reveal>
      </li>
    ))}
  </ul>
);
