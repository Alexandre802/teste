import React from 'react';
import { random, useCurrentFrame } from 'remotion';
import { pulse } from '../config/beat';
import { theme } from '../config/theme';

/**
 * Centro de distribuição: bloco escuro com as docas acesas, como o fundo das
 * artes. As docas piscam em tempos diferentes para o prédio parecer operando.
 */
export const Warehouse: React.FC<{ width: number; bays?: number; opacity?: number }> = ({
  width, bays = 7, opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const h = width * 0.42;
  return (
    <svg width={width} height={h} viewBox="0 0 1000 420" style={{ opacity, overflow: 'visible' }}>
      <defs>
        <linearGradient id="wh-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1a6b" />
          <stop offset="100%" stopColor="#03083a" />
        </linearGradient>
        <linearGradient id="wh-bay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.cyanSoft} />
          <stop offset="100%" stopColor={theme.blueBright} />
        </linearGradient>
      </defs>

      <path d="M 60 120 L 940 120 L 1000 175 L 1000 420 L 0 420 L 0 175 Z" fill="url(#wh-body)" />
      <path d="M 0 175 L 1000 175" stroke={`${theme.cyan}66`} strokeWidth={3} />
      <path d="M 60 120 L 940 120 L 1000 175 L 0 175 Z" fill="#061046" />

      {new Array(bays).fill(0).map((_, i) => {
        const bw = 860 / bays;
        const x = 70 + i * bw;
        const lit = 0.35 + 0.65 * pulse(frame + i * 17, 3);
        return (
          <g key={i}>
            <rect x={x} y={250} width={bw * 0.62} height={150} rx={6} fill="url(#wh-bay)" opacity={0.22 + lit * 0.5} />
            <rect x={x} y={250} width={bw * 0.62} height={150} rx={6} fill="none" stroke={theme.cyan} strokeWidth={2} opacity={0.5 + lit * 0.4} />
            <text
              x={x + bw * 0.31} y={228}
              fill={theme.cyanSoft} fontSize={26} fontWeight={700}
              textAnchor="middle" fontFamily="Archivo, sans-serif" opacity={0.8}
            >
              {String(i + 11)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** Carreta estilizada de perfil, com o vidro e as luzes acesas. */
export const Truck: React.FC<{ width: number; opacity?: number; flip?: boolean }> = ({
  width, opacity = 1, flip = false,
}) => {
  const h = width * 0.46;
  return (
    <svg
      width={width} height={h} viewBox="0 0 600 276"
      style={{ opacity, transform: flip ? 'scaleX(-1)' : undefined, overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="tk-box" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b3fb8" />
          <stop offset="100%" stopColor="#08154f" />
        </linearGradient>
      </defs>
      {/* baú */}
      <rect x={20} y={40} width={370} height={150} rx={8} fill="url(#tk-box)" stroke={`${theme.cyan}55`} strokeWidth={2} />
      <rect x={44} y={66} width={322} height={98} rx={4} fill="none" stroke={`${theme.cyanSoft}33`} strokeWidth={2} />
      {/* cabine */}
      <path d="M 396 92 L 470 92 L 520 140 L 520 190 L 396 190 Z" fill="url(#tk-box)" stroke={`${theme.cyan}55`} strokeWidth={2} />
      <path d="M 404 100 L 462 100 L 500 138 L 404 138 Z" fill={theme.cyanSoft} opacity={0.55} />
      {/* farol */}
      <circle cx={516} cy={168} r={7} fill="#fff" opacity={0.95} />
      <circle cx={516} cy={168} r={18} fill={theme.cyanSoft} opacity={0.35} />
      {/* rodas */}
      {[92, 172, 300, 466].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={200} r={30} fill="#050a30" stroke={`${theme.cyan}44`} strokeWidth={2} />
          <circle cx={cx} cy={200} r={12} fill="#0b1a63" />
        </g>
      ))}
      {/* reflexo no piso */}
      <ellipse cx={280} cy={244} rx={250} ry={12} fill={theme.cyan} opacity={0.16} />
    </svg>
  );
};

/** Fileira de carretas no pátio, com escala e opacidade caindo ao fundo. */
export const Fleet: React.FC<{ count?: number; baseWidth: number }> = ({ count = 5, baseWidth }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: baseWidth * 0.04 }}>
    {new Array(count).fill(0).map((_, i) => {
      const k = 1 - i * 0.11;
      return (
        <div key={i} style={{ marginBottom: i * 6 }}>
          <Truck width={baseWidth * k} opacity={0.95 - i * 0.13} />
        </div>
      );
    })}
  </div>
);

/** Caixa de papelão em três faces, com a etiqueta da marca. */
export const Box3D: React.FC<{ size: number; label?: boolean; opacity?: number }> = ({
  size, label = true, opacity = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ opacity, overflow: 'visible' }}>
    <defs>
      <linearGradient id="bx-top" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e8dcc4" /><stop offset="100%" stopColor="#c9b696" />
      </linearGradient>
      <linearGradient id="bx-left" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c2ae8c" /><stop offset="100%" stopColor="#95835f" />
      </linearGradient>
      <linearGradient id="bx-right" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d8c8a8" /><stop offset="100%" stopColor="#ab9772" />
      </linearGradient>
    </defs>
    <path d="M 100 20 L 180 58 L 100 96 L 20 58 Z" fill="url(#bx-top)" />
    <path d="M 20 58 L 100 96 L 100 180 L 20 142 Z" fill="url(#bx-left)" />
    <path d="M 180 58 L 100 96 L 100 180 L 180 142 Z" fill="url(#bx-right)" />
    <path d="M 100 20 L 180 58 L 100 96 L 20 58 Z" fill="none" stroke="#7d6c4c" strokeWidth={1.5} />
    {label ? (
      <g opacity={0.9}>
        <rect x={112} y={104} width={54} height={30} rx={3} fill="#f4ecdc" />
        <text x={139} y={124} fill="#0a2170" fontSize={13} fontWeight={800} textAnchor="middle" fontFamily="Archivo, sans-serif">
          3★
        </text>
      </g>
    ) : null}
  </svg>
);

/**
 * Silhueta do Brasil. Os vértices vêm de coordenadas reais projetadas num
 * quadro de 1000×1000 (lon -74..-34, lat +5..-34), então o contorno fecha
 * certo e qualquer cidade pode ser posicionada no mesmo espaço por `geo()`.
 */
export const BRAZIL_PATH =
  'M 345 0 L 420 30 L 555 15 L 600 128 L 638 165 L 743 192 L 888 223 L 970 277 ' +
  'L 978 335 L 940 400 L 888 462 L 860 540 L 843 649 L 770 718 L 693 744 ' +
  'L 638 836 L 560 880 L 515 992 L 455 940 L 423 892 L 470 820 L 485 785 ' +
  'L 485 744 L 410 615 L 330 540 L 218 454 L 120 420 L 30 397 L 5 321 ' +
  'L 100 240 L 180 97 L 250 60 Z';

/** Converte longitude/latitude para o espaço 1000×1000 do mapa. */
export const geo = (lon: number, lat: number) => ({
  x: ((lon + 74) / 40) * 1000,
  y: ((5 - lat) / 39) * 1000,
});

export const CITIES = {
  goiania: { ...geo(-49.25, -16.68), name: 'GOIÂNIA' },
  saopaulo: { ...geo(-46.63, -23.55), name: 'SÃO PAULO' },
};

export const BrazilMap: React.FC<{ size: number; opacity?: number }> = ({ size, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const glow = pulse(frame, 5);
  return (
    <svg width={size} height={size} viewBox="0 0 1000 1000" style={{ opacity, overflow: 'visible' }}>
      <defs>
        <linearGradient id="br-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1540d8" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#06104f" stopOpacity={0.8} />
        </linearGradient>
      </defs>
      <path
        d={BRAZIL_PATH}
        fill="url(#br-fill)"
        stroke={theme.cyan}
        strokeWidth={3}
        strokeLinejoin="round"
        opacity={0.7 + glow * 0.3}
        style={{ filter: `drop-shadow(0 0 ${16 + glow * 14}px ${theme.cyan}88)` }}
      />
      {new Array(52).fill(0).map((_, i) => {
        const seed = `m${i}`;
        const x = 150 + random(seed + 'x') * 700;
        const y = 120 + random(seed + 'y') * 760;
        return <circle key={seed} cx={x} cy={y} r={3.5} fill={theme.cyanSoft} opacity={0.1 + random(seed) * 0.2} />;
      })}
    </svg>
  );
};
