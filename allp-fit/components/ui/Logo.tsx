/**
 * Marca da Allp Fit: o losango laranja com o ponto no centro (como no letreiro
 * da fachada) e o logotipo em caixa baixa, com "ACADEMIA" embaixo.
 */
import { cn } from '@/lib/utils';

type Props = {
  /** 'completa' = marca + logotipo; 'marca' = só o losango. */
  variante?: 'completa' | 'marca';
  className?: string;
  /** Some com o "ACADEMIA" em espaços apertados (rodapé de celular). */
  compacta?: boolean;
};

export function Logo({ variante = 'completa', className, compacta = false }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 48 48"
        className={cn('shrink-0', variante === 'marca' ? 'h-7 w-7 md:h-8 md:w-8' : 'h-8 w-8 md:h-9 md:w-9')}
        role="img"
        aria-label={variante === 'marca' ? 'Allp Fit' : undefined}
        aria-hidden={variante === 'completa' ? true : undefined}
      >
        <defs>
          <linearGradient id="allp-marca" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF7A2F" />
            <stop offset="55%" stopColor="#FF4B1F" />
            <stop offset="100%" stopColor="#E62E00" />
          </linearGradient>
        </defs>
        <g transform="rotate(-14 24 24)">
          <rect
            x="5.5"
            y="14"
            width="37"
            height="20"
            rx="7"
            fill="none"
            stroke="url(#allp-marca)"
            strokeWidth="5"
          />
          <circle cx="24" cy="24" r="4.4" fill="url(#allp-marca)" />
        </g>
      </svg>

      {variante === 'completa' && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.35rem] font-extrabold tracking-[-0.055em] text-white md:text-[1.5rem]">
            allp fit
          </span>
          {!compacta && (
            <span className="mt-0.5 text-[0.5rem] font-semibold tracking-[0.42em] text-cinza md:text-[0.55rem]">
              ACADEMIA
            </span>
          )}
        </span>
      )}
    </span>
  );
}
