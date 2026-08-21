import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { evolvePath, getPointAtLength } from '@remotion/paths';
import { beat, fade, overshoot, pulse } from '../config/beat';
import { font, theme } from '../config/theme';
import { IconBox, IconPin } from './Icons';

/**
 * Enxame de caixas atravessando o quadro. Alimenta a cena de escala: o roteiro
 * pede que as caixas "atravessem a tela e formem o número".
 */
export const BoxField: React.FC<{
  start: number;
  count?: number;
  duration: number;
  /** Convergem para o centro em vez de só atravessar. */
  converge?: boolean;
}> = ({ start, count = 90, duration, converge = true }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  if (local < 0) return null;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {new Array(count).fill(0).map((_, i) => {
        const seed = `box-${i}`;
        const lane = random(seed + 'y') * 100;
        const speed = 0.7 + random(seed + 's') * 1.1;
        const size = 14 + random(seed + 'z') * 34;
        const delay = random(seed + 'd') * duration * 0.55;
        const t = (local - delay) / (duration * 0.9);
        if (t < 0 || t > 1.2) return null;

        const fromLeft = random(seed + 'l') > 0.5;
        const startX = fromLeft ? -12 : 112;
        const endX = converge ? 50 : fromLeft ? 112 : -12;
        const x = interpolate(t * speed, [0, 1], [startX, endX], { extrapolateRight: 'clamp' });
        const yDrift = converge ? interpolate(t, [0, 1], [lane, 50 + (lane - 50) * 0.25]) : lane;
        // some ao chegar no centro: as caixas "viram" o número
        const op = converge
          ? interpolate(t, [0, 0.15, 0.72, 0.95], [0, 0.95, 0.85, 0], { extrapolateRight: 'clamp' })
          : interpolate(t, [0, 0.12, 0.85, 1], [0, 0.9, 0.9, 0], { extrapolateRight: 'clamp' });
        const blur = Math.min(6, speed * 3.4 * (1 - t));

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${yDrift}%`,
              width: size, height: size,
              transform: `translate(-50%, -50%) rotate(${random(seed + 'r') * 40 - 20}deg)`,
              opacity: op,
              filter: `blur(${blur}px)`,
              background: `linear-gradient(140deg, ${theme.cyanSoft}, ${theme.blueBright})`,
              borderRadius: size * 0.16,
              boxShadow: `0 0 ${size * 0.7}px ${theme.cyan}55`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const ROUTE = 'M 120 250 C 340 140, 620 120, 860 210';

/**
 * Rota Goiânia → São Paulo: a linha se desenha, a caixa corre por cima dela
 * e os dois pontos pulsam. A caixa chega junto com o tempo forte.
 */
export const RouteMap: React.FC<{ start: number; width: number; height: number }> = ({
  start, width, height,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, start + beat(3)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const evolved = evolvePath(t, ROUTE);
  const pt = getPointAtLength(ROUTE, t * 1000);
  const glow = pulse(frame, 2);

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg viewBox="0 0 1000 400" width={width} height={height} style={{ overflow: 'visible' }}>
        <path d={ROUTE} stroke={`${theme.cyan}33`} strokeWidth={3} fill="none" />
        <path
          d={ROUTE}
          stroke={theme.cyan}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={evolved.strokeDasharray}
          strokeDashoffset={evolved.strokeDashoffset}
          style={{ filter: `drop-shadow(0 0 ${8 + glow * 10}px ${theme.cyan})` }}
        />
      </svg>

      <City name="GOIÂNIA" x={120} y={250} w={width} h={height} start={start} />
      <City name="SÃO PAULO" x={860} y={210} w={width} h={height} start={start + beat(3)} />

      {pt && t > 0 && t < 1.02 ? (
        <div
          style={{
            position: 'absolute',
            left: (pt.x / 1000) * width,
            top: (pt.y / 400) * height,
            transform: 'translate(-50%, -50%)',
            filter: `drop-shadow(0 0 16px ${theme.cyan})`,
          }}
        >
          <IconBox size={44} color={theme.white} />
        </div>
      ) : null}
    </div>
  );
};

const City: React.FC<{
  name: string; x: number; y: number; w: number; h: number; start: number;
}> = ({ name, x, y, w, h, start }) => {
  const frame = useCurrentFrame();
  const p = overshoot(frame, start, 1);
  const glow = pulse(frame, 2);
  return (
    <div
      style={{
        position: 'absolute',
        left: (x / 1000) * w,
        top: (y / 400) * h,
        transform: `translate(-50%, -50%) scale(${interpolate(p, [0, 1], [0.4, 1])})`,
        opacity: fade(frame, start, 0.4),
        display: 'flex', alignItems: 'center', gap: 8,
      }}
    >
      <div
        style={{
          width: 16, height: 16, borderRadius: '50%',
          background: theme.cyan,
          boxShadow: `0 0 ${12 + glow * 16}px ${theme.cyan}`,
        }}
      />
      <div
        style={{
          fontFamily: font.body, fontSize: 20, fontWeight: 800,
          color: theme.white, letterSpacing: '0.06em',
          textShadow: '0 2px 12px rgba(0,0,0,0.7)', whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>
    </div>
  );
};

/** Lista de rastreio dentro do celular: cada etapa acende num tempo. */
export const TrackList: React.FC<{ start: number; width: number }> = ({ start, width }) => {
  const frame = useCurrentFrame();
  const steps = [
    { t: 'Pedido vendido', s: 'Seu comprador já finalizou a compra.' },
    { t: 'Separado', s: 'Seu pedido já está sendo preparado.' },
    { t: 'Enviado', s: 'Você recebe o código de rastreio.' },
  ];
  return (
    <div style={{ padding: width * 0.07, paddingTop: width * 0.16, fontFamily: font.body }}>
      <div style={{ fontSize: width * 0.062, fontWeight: 800, color: '#0b1020', marginBottom: width * 0.05 }}>
        Acompanhe sua venda
      </div>
      {steps.map((st, i) => {
        const at = start + beat(i * 1.5);
        const on = frame >= at;
        const p = overshoot(frame, at, 0.8);
        return (
          <div key={i} style={{ display: 'flex', gap: width * 0.04, marginBottom: width * 0.05 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: width * 0.05, height: width * 0.05, borderRadius: '50%',
                  border: `${width * 0.011}px solid ${on ? theme.blueBright : '#c9cede'}`,
                  background: on ? theme.blueBright : 'transparent',
                  transform: `scale(${interpolate(p, [0, 1], [0.5, 1])})`,
                }}
              />
              {i < steps.length - 1 ? (
                <div style={{ width: width * 0.008, flex: 1, minHeight: width * 0.09, background: on ? theme.blueBright : '#dfe3ee' }} />
              ) : null}
            </div>
            <div style={{ opacity: on ? 1 : 0.45, transition: 'none' }}>
              <div style={{ fontSize: width * 0.052, fontWeight: 700, color: '#0b1020' }}>{st.t}</div>
              <div style={{ fontSize: width * 0.04, color: '#6b7285', lineHeight: 1.3 }}>{st.s}</div>
            </div>
          </div>
        );
      })}
      <div
        style={{
          marginTop: width * 0.03, padding: width * 0.04,
          borderTop: '1px solid #e6e9f2',
          opacity: fade(frame, start + beat(4), 0.5),
        }}
      >
        <div style={{ fontSize: width * 0.04, color: '#6b7285' }}>Chega entre</div>
        <div style={{ fontSize: width * 0.062, fontWeight: 800, color: '#0b1020' }}>23 e 25 de maio</div>
      </div>
    </div>
  );
};
