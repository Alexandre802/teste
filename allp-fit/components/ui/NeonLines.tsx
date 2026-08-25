/**
 * As fitas de LED do teto da academia, transformadas em elemento de interface.
 *
 * É decoração puramente visual: nenhum JavaScript, só CSS — as linhas derivam
 * de lado em animação de `transform`/`opacity`, e o bloco global de
 * `prefers-reduced-motion` congela tudo para quem pediu menos movimento.
 */
import { cn } from '@/lib/utils';

type Linha = { topo: string; cor: string; giro: string; atraso: string; largura: string };

/** Feixe do teto: linhas paralelas em diagonal, como na foto do salão. */
const feixe: Linha[] = [
  { topo: '14%', cor: 'text-roxo', giro: '-7deg', atraso: '0s', largura: '120%' },
  { topo: '20%', cor: 'text-azul', giro: '-7deg', atraso: '-3s', largura: '120%' },
  { topo: '26%', cor: 'text-ciano', giro: '-7deg', atraso: '-6s', largura: '120%' },
  { topo: '33%', cor: 'text-azul', giro: '-7deg', atraso: '-9s', largura: '120%' },
  { topo: '40%', cor: 'text-roxo', giro: '-7deg', atraso: '-12s', largura: '120%' },
];

/** Marcação discreta de transição entre seções. */
const transicao: Linha[] = [
  { topo: '18%', cor: 'text-roxo', giro: '-3deg', atraso: '0s', largura: '110%' },
  { topo: '52%', cor: 'text-ciano', giro: '-3deg', atraso: '-5s', largura: '110%' },
  { topo: '80%', cor: 'text-azul', giro: '-3deg', atraso: '-9s', largura: '110%' },
];

export function NeonLines({
  variante = 'transicao',
  className,
}: {
  variante?: 'feixe' | 'transicao';
  className?: string;
}) {
  const linhas = variante === 'feixe' ? feixe : transicao;

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {linhas.map((linha, i) => (
        <div
          key={i}
          className={cn('led anim-led absolute left-[-10%]', linha.cor)}
          style={{
            top: linha.topo,
            width: linha.largura,
            transform: `rotate(${linha.giro})`,
            animationDelay: linha.atraso,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Linha divisória entre seções, com uma faísca percorrendo de ponta a ponta.
 * Serve de costura: nenhuma seção começa como se fosse outra página.
 */
export function NeonDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('relative h-px w-full overflow-hidden', className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="anim-percorre absolute top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-ciano to-transparent shadow-[0_0_12px_rgba(0,221,253,0.9)]" />
    </div>
  );
}
