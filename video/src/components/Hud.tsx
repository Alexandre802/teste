import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { BEAT, beat, pulse } from '../config/beat';
import { font, theme } from '../config/theme';
import { scenes } from '../config/timeline';

/** Cantoneiras e marcações de régua: dão a moldura de painel de operação. */
export const HudFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = pulse(frame, 4);
  const corner = (style: React.CSSProperties) => (
    <div
      style={{
        position: 'absolute', width: 74, height: 74,
        borderColor: `${theme.cyan}${Math.round(90 + glow * 70).toString(16)}`,
        borderStyle: 'solid', borderWidth: 0,
        ...style,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: 0.75 }}>
      {corner({ top: 40, left: 40, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 })}
      {corner({ top: 40, right: 40, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 })}
      {corner({ bottom: 40, left: 40, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 })}
      {corner({ bottom: 40, right: 40, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 })}
      <Ruler side="left" />
      <Ruler side="right" />
    </AbsoluteFill>
  );
};

const Ruler: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', [side]: 22, top: '30%', height: '40%', width: 12 }}>
      {new Array(14).fill(0).map((_, i) => {
        const on = Math.floor(frame / (BEAT / 2)) % 14 === i;
        return (
          <div
            key={i}
            style={{
              width: on ? 12 : 6, height: 2, marginBottom: 20,
              background: theme.cyan,
              opacity: on ? 0.9 : 0.25,
              marginLeft: side === 'left' ? 0 : 'auto',
            }}
          />
        );
      })}
    </div>
  );
};

/** Faixa de dados correndo no rodapé, como um painel de operação ao vivo. */
export const Ticker: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    'GOIÂNIA → SÃO PAULO', 'CD A CD EM ATÉ 24H', 'RASTREAMENTO EM TEMPO REAL',
    '+100.000 VOLUMES/MÊS', 'CARGA SEGURADA', 'MONITORAMENTO 24H', 'OPERAÇÃO DIÁRIA',
  ];
  const line = items.join('   •   ') + '   •   ';
  const x = -((frame * 1.6) % 2400);
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 46, height: 34,
        overflow: 'hidden', display: 'flex', alignItems: 'center',
        opacity: 0.5,
        maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
      }}
    >
      <div
        style={{
          whiteSpace: 'nowrap', transform: `translateX(${x}px)`,
          fontFamily: font.body, fontSize: 19, fontWeight: 700,
          letterSpacing: '0.24em', color: theme.cyanSoft,
        }}
      >
        {line + line + line}
      </div>
    </div>
  );
};

/** Contador de cena, no canto: reforça a leitura de painel. */
export const SceneMark: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.max(0, scenes.findIndex((s) => frame >= s.from && frame < s.from + s.duration));
  return (
    <div
      style={{
        position: 'absolute', top: 52, right: 62,
        fontFamily: font.body, fontSize: 20, fontWeight: 800,
        letterSpacing: '0.2em', color: theme.cyanSoft, opacity: 0.55,
      }}
    >
      {String(i + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}
    </div>
  );
};

/** Varredura de luz atravessando o quadro a cada virada. */
export const Sweep: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + beat(1)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute', top: 0, bottom: 0, width: '46%',
          left: `${interpolate(p, [0, 1], [-50, 110])}%`,
          background: `linear-gradient(100deg, transparent, ${theme.cyanSoft}22, ${theme.white}33, ${theme.cyanSoft}22, transparent)`,
          filter: 'blur(14px)',
          opacity: interpolate(p, [0, 0.3, 1], [0, 1, 0]),
        }}
      />
    </AbsoluteFill>
  );
};
