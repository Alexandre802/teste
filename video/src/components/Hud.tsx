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
        position: 'absolute', width: 190, height: 190,
        borderColor: `${theme.cyan}${Math.round(90 + glow * 70).toString(16)}`,
        borderStyle: 'solid', borderWidth: 0,
        ...style,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: 0.75 }}>
      {corner({ top: 84, left: 84, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 18 })}
      {corner({ top: 84, right: 84, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 18 })}
      {corner({ bottom: 84, left: 84, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 18 })}
      {corner({ bottom: 84, right: 84, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 18 })}
      <Ruler side="left" />
      <Ruler side="right" />
    </AbsoluteFill>
  );
};

const Ruler: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', [side]: 52, top: '28%', height: '44%', width: 26 }}>
      {new Array(14).fill(0).map((_, i) => {
        const on = Math.floor(frame / (BEAT / 2)) % 14 === i;
        return (
          <div
            key={i}
            style={{
              width: on ? 26 : 13, height: 4, marginBottom: 30,
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
  const x = -((frame * 3.2) % 4800);
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 26, height: 56,
        overflow: 'hidden', display: 'flex', alignItems: 'center',
        opacity: 0.34,
        maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
      }}
    >
      <div
        style={{
          whiteSpace: 'nowrap', transform: `translateX(${x}px)`,
          fontFamily: font.body, fontSize: 36, fontWeight: 700,
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
        position: 'absolute', top: 112, right: 130,
        fontFamily: font.body, fontSize: 40, fontWeight: 800,
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
