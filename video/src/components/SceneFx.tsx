import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { evolvePath, getLength, getPointAtLength } from '@remotion/paths';
import { beat, fade, overshoot, pulse } from '../config/beat';
import { font, theme } from '../config/theme';
import { CITIES } from './World';
import { IconBox } from './Icons';

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

const ROUTE = 'M 619 556 C 700 592, 732 662, 684 732';

/**
 * Rota Goiânia → São Paulo. Desenha no mesmo espaço 1000×1000 do mapa, então
 * sobrepor os dois componentes com o mesmo `size` alinha rota e território.
 * A linha se desenha, a caixa corre por cima e os dois pontos pulsam.
 */
export const RouteMap: React.FC<{ start: number; size: number }> = ({ start, size }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, start + beat(3)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const evolved = evolvePath(t, ROUTE);
  const pt = getPointAtLength(ROUTE, t * getLength(ROUTE));
  const glow = pulse(frame, 2);
  const k = size / 1000;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg viewBox="0 0 1000 1000" width={size} height={size} style={{ overflow: 'visible' }}>
        <path d={ROUTE} stroke={`${theme.cyan}30`} strokeWidth={5} fill="none" />
        <path
          d={ROUTE}
          stroke={theme.cyan}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={evolved.strokeDasharray}
          strokeDashoffset={evolved.strokeDashoffset}
          style={{ filter: `drop-shadow(0 0 ${10 + glow * 12}px ${theme.cyan})` }}
        />
      </svg>

      <City city={CITIES.goiania} k={k} start={start} side="left" />
      <City city={CITIES.saopaulo} k={k} start={start + beat(3)} side="right" />

      {pt && t > 0 && t < 1.02 ? (
        <div
          style={{
            position: 'absolute',
            left: pt.x * k,
            top: pt.y * k,
            transform: 'translate(-50%, -50%)',
            filter: `drop-shadow(0 0 18px ${theme.cyan})`,
          }}
        >
          <IconBox size={46} color={theme.white} />
        </div>
      ) : null}
    </div>
  );
};

const City: React.FC<{
  city: { x: number; y: number; name: string };
  k: number;
  start: number;
  side: 'left' | 'right';
}> = ({ city, k, start, side }) => {
  const frame = useCurrentFrame();
  const p = overshoot(frame, start, 1);
  const glow = pulse(frame, 2);
  return (
    <div
      style={{
        position: 'absolute',
        left: city.x * k,
        top: city.y * k,
        transform: `translate(${side === 'left' ? '-100%' : '0'}, -50%) scale(${interpolate(p, [0, 1], [0.4, 1])})`,
        opacity: fade(frame, start, 0.4),
        display: 'flex', alignItems: 'center', gap: 10,
        flexDirection: side === 'left' ? 'row' : 'row-reverse',
        paddingLeft: side === 'right' ? 0 : 0,
      }}
    >
      <div
        style={{
          fontFamily: font.body, fontSize: 22, fontWeight: 800,
          color: theme.white, letterSpacing: '0.06em',
          textShadow: '0 2px 14px rgba(0,0,0,0.8)', whiteSpace: 'nowrap',
        }}
      >
        {city.name}
      </div>
      <div
        style={{
          width: 18, height: 18, borderRadius: '50%',
          background: theme.cyan, flexShrink: 0,
          boxShadow: `0 0 ${14 + glow * 18}px ${theme.cyan}`,
        }}
      />
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
