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

/**
 * Contorno de celular com as duas faces. A traseira existe para o giro no
 * próprio eixo não virar uma folha de papel quando o aparelho passa de perfil.
 */
export const Phone: React.FC<{
  start: number;
  width?: number;
  children?: React.ReactNode;
  delayFrom?: number;
}> = ({ start, width = 300, children, delayFrom = 90 }) => {
  const frame = useCurrentFrame();
  const p = overshoot(frame, start, 1.4);
  const h = width * 2.02;
  const shell: React.CSSProperties = {
    position: 'absolute', inset: 0,
    borderRadius: width * 0.14,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };

  return (
    <div
      style={{
        width, height: h,
        position: 'relative',
        transformStyle: 'preserve-3d',
        borderRadius: width * 0.14,
        boxShadow: `0 ${width * 0.1}px ${width * 0.24}px rgba(0,0,0,0.55), 0 0 ${width * 0.2}px ${theme.cyan}22`,
        opacity: fade(frame, start, 0.5),
        transform: `translateY(${interpolate(p, [0, 1], [delayFrom, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`,
      }}
    >
      {/* frente */}
      <div style={{ ...shell, background: '#05060f', border: '3px solid #23283d' }}>
        {children}
        <div
          style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: width * 0.3, height: width * 0.075, borderRadius: 999, background: '#000', zIndex: 3,
          }}
        />
      </div>

      {/* traseira */}
      <div
        style={{
          ...shell,
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(150deg, #1a2140 0%, #0a0e22 55%, #151a33 100%)',
          border: '3px solid #23283d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute', top: width * 0.07, left: width * 0.07,
            width: width * 0.26, height: width * 0.26, borderRadius: width * 0.07,
            background: '#0c1024', border: '1px solid #262c48',
          }}
        />
        <div style={{ fontFamily: font.display, fontSize: width * 0.1, color: '#2b3358' }}>3</div>
      </div>
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

/**
 * Par de notificações: esquerda e direita entram no mesmo quadro, e os pares
 * se sucedem um por tempo. É o "uma por uma, porém junta acompanhando os dois
 * lados" do briefing.
 */
export const ToastPair: React.FC<{
  start: number;
  top: string;
  left: { title: string; subtitle: string; accent?: string };
  right: { title: string; subtitle: string; accent?: string };
  width?: number;
  inset?: string;
}> = ({ start, top, left, right, width = 300, inset = '2%' }) => (
  <>
    <div style={{ position: 'absolute', top, left: inset, zIndex: 20 }}>
      <Toast start={start} title={left.title} subtitle={left.subtitle} accent={left.accent} from="left" width={width} />
    </div>
    <div style={{ position: 'absolute', top, right: inset, zIndex: 20 }}>
      <Toast start={start} title={right.title} subtitle={right.subtitle} accent={right.accent} from="right" width={width} />
    </div>
  </>
);

/** Assinatura pequena da marca, como a copy pede na primeira cena. */
export const Wordmark: React.FC<{ start: number; size?: number }> = ({ start, size = 1 }) => {
  const frame = useCurrentFrame();
  const p = overshoot(frame, start, 1);
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 14 * size,
        opacity: fade(frame, start, 0.5),
        transform: `translateY(${interpolate(p, [0, 1], [-24, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 54 * size, height: 54 * size, borderRadius: 12 * size,
          background: `linear-gradient(140deg, ${theme.red}, ${theme.amber})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: font.display, fontSize: 30 * size, color: theme.white,
          boxShadow: `0 0 ${24 * size}px ${theme.amber}66`,
        }}
      >
        3
      </div>
      <div style={{ fontFamily: font.display, lineHeight: 1, color: theme.white }}>
        <div style={{ fontSize: 30 * size, letterSpacing: '0.06em' }}>TRÊS ESTRELAS</div>
        <div style={{ fontFamily: font.body, fontSize: 13 * size, fontWeight: 600, letterSpacing: '0.22em', color: theme.cyanSoft }}>
          TRANSPORTE E TURISMO
        </div>
      </div>
    </div>
  );
};
