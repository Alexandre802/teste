import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { beat, fade, overshoot, pulse } from '../config/beat';
import { font, theme } from '../config/theme';
import { IconBox, IconCheck, IconEye, IconShield, IconStar, IconTruck } from './Icons';

/**
 * Cartão de "novo pedido". Entra deslizando pela lateral com passagem além
 * do ponto, exatamente como os toasts da referência.
 */
export const Toast: React.FC<{
  start: number;
  title: string;
  subtitle: string;
  accent?: string;
  variant?: 'light' | 'dark';
  from?: 'left' | 'right';
  width?: number;
}> = ({ start, title, subtitle, accent = theme.amber, variant = 'dark', from = 'left', width = 300 }) => {
  const frame = useCurrentFrame();
  const p = overshoot(frame, start, 1.1);
  const dx = interpolate(p, [0, 1], [from === 'left' ? -160 : 160, 0]);
  const light = variant === 'light';
  return (
    <div
      style={{
        width,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
        borderRadius: 16,
        background: light ? 'rgba(255,255,255,0.94)' : 'rgba(10,22,86,0.72)',
        border: `1px solid ${light ? 'rgba(255,255,255,0.9)' : 'rgba(120,180,255,0.35)'}`,
        boxShadow: light ? '0 18px 40px rgba(0,0,0,0.35)' : '0 18px 40px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(6px)',
        opacity: fade(frame, start, 0.5),
        transform: `translateX(${dx}px)`,
      }}
    >
      <div
        style={{
          width: 34, height: 34, borderRadius: 9,
          background: accent, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <IconBox size={19} color={light ? '#fff' : '#04113f'} />
      </div>
      <div style={{ fontFamily: font.body, lineHeight: 1.25, minWidth: 0 }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: light ? theme.ink : theme.white }}>{title}</div>
        <div style={{ fontSize: 16, fontWeight: 500, color: light ? '#5c6478' : theme.cyanSoft }}>{subtitle}</div>
      </div>
    </div>
  );
};

/** Selo dos diferenciais: pílula escura com ícone, entra em sequência. */
export const Stamp: React.FC<{
  start: number;
  lines: string[];
  icon: 'shield' | 'eye' | 'truck' | 'box';
  from?: 'left' | 'right';
}> = ({ start, lines, icon, from = 'left' }) => {
  const frame = useCurrentFrame();
  const p = overshoot(frame, start, 1.1);
  const dx = interpolate(p, [0, 1], [from === 'left' ? -70 : 70, 0]);
  const Icon = icon === 'shield' ? IconShield : icon === 'eye' ? IconEye : icon === 'truck' ? IconTruck : IconBox;
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 12,
        padding: '12px 20px', borderRadius: 12,
        background: 'rgba(6,16,72,0.78)',
        border: `1px solid ${theme.cyan}66`,
        boxShadow: `0 0 26px ${theme.cyan}33`,
        opacity: fade(frame, start, 0.5),
        transform: `translateX(${dx}px)`,
      }}
    >
      <Icon size={22} color={theme.cyan} />
      <div style={{ fontFamily: font.body, fontSize: 18, fontWeight: 700, color: theme.white, lineHeight: 1.2, letterSpacing: '0.03em' }}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
};

/** Fluxo de status: cada etapa acende num tempo, a última em verde. */
export const StatusFlow: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const steps = [
    { label: 'Pedido enviado', icon: <IconBox size={22} color={theme.cyan} />, at: start },
    { label: 'Em transporte', icon: <IconTruck size={22} color={theme.cyan} />, at: start + beat(1) },
    { label: 'ENTREGUE', icon: <IconCheck size={22} color={theme.green} />, at: start + beat(2) },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {steps.map((s, i) => {
        const done = i === steps.length - 1;
        const p = overshoot(frame, s.at, 1);
        return (
          <React.Fragment key={i}>
            {i > 0 ? (
              <div style={{ height: 16, opacity: fade(frame, s.at - beat(0.25), 0.3), color: theme.cyanSoft, fontSize: 18, lineHeight: 1 }}>↓</div>
            ) : null}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 18px', borderRadius: 12,
                background: done ? 'rgba(20,90,50,0.55)' : 'rgba(6,16,72,0.72)',
                border: `1px solid ${done ? theme.green : theme.cyan}66`,
                opacity: fade(frame, s.at, 0.4),
                transform: `scale(${interpolate(p, [0, 1], [0.9, 1])})`,
                fontFamily: font.body,
                fontSize: done ? 22 : 19,
                fontWeight: done ? 800 : 600,
                color: theme.white,
              }}
            >
              {s.icon}
              {s.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** Cinco estrelas acendendo em sequência, meio tempo entre cada. */
export const Stars: React.FC<{ start: number; size?: number }> = ({ start, size = 34 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const at = start + beat(i * 0.25);
        const p = overshoot(frame, at, 0.8);
        return (
          <div key={i} style={{ opacity: fade(frame, at, 0.2), transform: `scale(${interpolate(p, [0, 1], [0.2, 1])})` }}>
            <IconStar size={size} color={theme.amber} />
          </div>
        );
      })}
    </div>
  );
};

/** Contorno de celular com conteúdo livre na tela. */
export const Phone: React.FC<{
  start: number;
  width?: number;
  children?: React.ReactNode;
  delayFrom?: number;
}> = ({ start, width = 300, children, delayFrom = 90 }) => {
  const frame = useCurrentFrame();
  const p = overshoot(frame, start, 1.4);
  const h = width * 2.02;
  return (
    <div
      style={{
        width, height: h, borderRadius: width * 0.14,
        background: '#05060f',
        border: '3px solid #23283d',
        boxShadow: `0 30px 70px rgba(0,0,0,0.55), 0 0 60px ${theme.cyan}22`,
        overflow: 'hidden',
        position: 'relative',
        opacity: fade(frame, start, 0.5),
        transform: `translateY(${interpolate(p, [0, 1], [delayFrom, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`,
      }}
    >
      <div
        style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: width * 0.3, height: width * 0.075, borderRadius: 999, background: '#000', zIndex: 3,
        }}
      />
      {children}
    </div>
  );
};

/** Halo pulsante travado no tempo musical, para a caixa protegida. */
export const Dome: React.FC<{ start: number; size: number }> = ({ start, size }) => {
  const frame = useCurrentFrame();
  const p = overshoot(frame, start, 1.6);
  const glow = pulse(frame, 2);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        border: `2px solid ${theme.cyan}${Math.round(80 + glow * 90).toString(16)}`,
        boxShadow: `0 0 ${40 + glow * 50}px ${theme.cyan}66, inset 0 0 ${60 + glow * 40}px ${theme.cyan}33`,
        opacity: fade(frame, start, 0.8) * 0.9,
        transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})`,
      }}
    />
  );
};
