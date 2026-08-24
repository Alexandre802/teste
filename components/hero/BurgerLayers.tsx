/**
 * Hambúrguer ilustrado em camadas, para a animação de "desmontar" do hero.
 *
 * É desenho vetorial, não fotografia: nenhuma foto real da casa é fatiada nem
 * usada para representar um produto que não seja o dela. Todas as camadas
 * compartilham o mesmo viewBox, então mover uma camada no eixo Y já a separa
 * das outras sem qualquer cálculo de alinhamento.
 */

export const BURGER_VIEWBOX = '0 0 400 400';

interface LayerProps {
  className?: string;
}

const Svg = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <svg viewBox={BURGER_VIEWBOX} className={className} aria-hidden="true" focusable="false">
    {children}
  </svg>
);

export function BunTop({ className }: LayerProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="bunTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5B95C" />
          <stop offset="55%" stopColor="#E09231" />
          <stop offset="100%" stopColor="#B96C1C" />
        </linearGradient>
      </defs>
      <path d="M60 132c0-44 34-78 82-86 12-2 24-2 36 0 48 8 82 42 82 86 0 6-5 10-11 10H71c-6 0-11-4-11-10z" fill="url(#bunTop)" />
      {/* sementes */}
      {[
        [140, 92], [178, 78], [216, 86], [252, 100], [120, 112],
        [196, 106], [236, 118], [162, 118], [272, 118],
      ].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="6.5" ry="4" fill="#FFE0A8" opacity="0.9" transform={`rotate(${(i * 37) % 60 - 30} ${cx} ${cy})`} />
      ))}
    </Svg>
  );
}

export function Tomato({ className }: LayerProps) {
  return (
    <Svg className={className}>
      <defs>
        <radialGradient id="tomatoFill" cx="0.5" cy="0.35">
          <stop offset="0%" stopColor="#E4571C" />
          <stop offset="100%" stopColor="#B03709" />
        </radialGradient>
      </defs>
      {/* fatias, para o tomate continuar legível quando a camada se separa */}
      {[128, 200, 272].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="141" rx="42" ry="13" fill="url(#tomatoFill)" />
          <ellipse cx={cx} cy="139" rx="27" ry="7" fill="#F0764A" opacity="0.55" />
        </g>
      ))}
      <path d="M74 148c-8 0-13-4-13-8s5-8 13-8h252c8 0 13 4 13 8s-5 8-13 8H74z" fill="url(#tomatoFill)" opacity="0.92" />
    </Svg>
  );
}

export function Lettuce({ className }: LayerProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="lettuceFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A542" />
          <stop offset="100%" stopColor="#96772A" />
        </linearGradient>
      </defs>
      {/* folha ondulada nas duas bordas — lê como alface mesmo isolada */}
      <path
        d="M60 166c7-11 17-3 24-11s15 3 22-6 16 4 23-5 16 5 23-4 16 6 23-3 16 6 23-3 16 6 23-4 17 3 24 11c5 6 3 15-4 19-9 5-19-2-28 3s-17-3-26 2-17-3-26 2-17-3-26 2-17-3-26 2-17-3-26 2-18 2-27-3c-7-4-9-13-4-19z"
        fill="url(#lettuceFill)"
      />
      <path
        d="M72 176c10-4 19 2 29-2s19 3 29-1 19 2 29-2 19 3 29-1 19 2 29-2"
        fill="none"
        stroke="#E0C368"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </Svg>
  );
}

function Cheese({ className, y }: LayerProps & { y: number }) {
  return (
    <Svg className={className}>
      <path
        d={`M70 ${y}h260c6 0 10 4 10 9s-4 9-10 9H70c-6 0-10-4-10-9s4-9 10-9z`}
        fill="#FFC857"
      />
      {/* pingos escorrendo */}
      <path d={`M96 ${y + 18}c0 12-2 18-8 22-6-4-8-10-8-22z`} fill="#F2B234" />
      <path d={`M214 ${y + 18}c0 15-3 22-9 26-6-4-9-11-9-26z`} fill="#F2B234" />
      <path d={`M312 ${y + 18}c0 10-2 15-7 18-5-3-7-8-7-18z`} fill="#F2B234" />
    </Svg>
  );
}

export const CheeseTop = ({ className }: LayerProps) => <Cheese className={className} y={170} />;
export const CheeseBottom = ({ className }: LayerProps) => <Cheese className={className} y={212} />;

function Patty({ className, y }: LayerProps & { y: number }) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id={`patty${y}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B3418" />
          <stop offset="100%" stopColor="#3E1B0A" />
        </linearGradient>
      </defs>
      <rect x="66" y={y} width="268" height="30" rx="15" fill={`url(#patty${y})`} />
      {[[110, 10], [168, 16], [232, 9], [286, 15]].map(([cx, dy], i) => (
        <ellipse key={i} cx={cx} cy={y + dy} rx="14" ry="4" fill="#8A4A22" opacity="0.55" />
      ))}
    </Svg>
  );
}

export const PattyTop = ({ className }: LayerProps) => <Patty className={className} y={186} />;
export const PattyBottom = ({ className }: LayerProps) => <Patty className={className} y={228} />;

export function BunBottom({ className }: LayerProps) {
  return (
    <Svg className={className}>
      <defs>
        <linearGradient id="bunBottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D9902F" />
          <stop offset="100%" stopColor="#A85F17" />
        </linearGradient>
      </defs>
      <path d="M70 262h260c6 0 10 4 10 10v14c0 16-14 28-32 28H92c-18 0-32-12-32-28v-14c0-6 4-10 10-10z" fill="url(#bunBottom)" />
    </Svg>
  );
}

/** Ordem visual, de cima para baixo. */
export const BURGER_STACK = [
  { key: 'bun-top', label: 'Pão superior', Component: BunTop, offset: -1 },
  { key: 'tomato', label: 'Tomate', Component: Tomato, offset: -0.64 },
  { key: 'lettuce', label: 'Alface', Component: Lettuce, offset: -0.36 },
  { key: 'cheese-top', label: 'Queijo', Component: CheeseTop, offset: -0.12 },
  { key: 'patty-top', label: 'Carne', Component: PattyTop, offset: 0.14 },
  { key: 'cheese-bottom', label: 'Queijo', Component: CheeseBottom, offset: 0.4 },
  { key: 'patty-bottom', label: 'Carne', Component: PattyBottom, offset: 0.66 },
  { key: 'bun-bottom', label: 'Pão inferior', Component: BunBottom, offset: 1 },
] as const;
