import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type Props = {
  /** Omitido nas seções que, na referência, abrem direto no título. */
  sobrescrito?: string;
  titulo: ReactNode;
  descricao?: ReactNode;
  /** `claro` = sobre fundo creme; `escuro` = sobre fundo preto. */
  tom?: 'claro' | 'escuro';
  className?: string;
};

/**
 * Abertura de seção: chapinha espaçada, linha dourada curta e título em
 * serifada. É o mesmo bloco em todas as seções das referências.
 */
export const SectionHeading = ({
  sobrescrito,
  titulo,
  descricao,
  tom = 'escuro',
  className = '',
}: Props) => (
  <Reveal className={`flex flex-col items-center text-center ${className}`}>
    {sobrescrito ? (
      <>
        <p className={`sobrescrito ${tom === 'claro' ? 'text-dourado' : 'text-dourado-claro'}`}>
          {sobrescrito}
        </p>

        <span aria-hidden="true" className="mt-4 block h-px w-14 bg-dourado/60" />
      </>
    ) : null}

    <h2
      className={`max-w-3xl ${sobrescrito ? 'mt-6' : ''} font-serif text-[clamp(1.7rem,7.2vw,3.1rem)] leading-[1.12] font-light ${
        tom === 'claro' ? 'text-[#2a2118]' : 'text-branco'
      }`}
    >
      {titulo}
    </h2>

    {descricao ? (
      <p
        className={`mt-5 max-w-xl text-[0.95rem] leading-relaxed sm:text-base ${
          tom === 'claro' ? 'text-[#6b5f4f]' : 'text-texto'
        }`}
      >
        {descricao}
      </p>
    ) : null}
  </Reveal>
);
