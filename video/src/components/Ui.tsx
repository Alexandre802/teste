import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, FONT, SHADOW } from '../theme';
import { EASE, enter, float, iv, pulse, s, SPRING } from '../lib/anim';
import { DoubleCheck, WhatsappIcon } from './Icons';

// ------------------------------------------------------------------- Card ---

export const Card: React.FC<{
  children?: React.ReactNode;
  delay?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  radius?: number;
  shadow?: string;
  background?: string;
  padding?: number | string;
  style?: React.CSSProperties;
  config?: (typeof SPRING)['soft'];
  /** Flutuação contínua depois da entrada. */
  drift?: number;
  driftPhase?: number;
}> = ({
  children,
  delay = 0,
  x = 0,
  y = 34,
  scale = 0.92,
  rotate = 0,
  radius = 34,
  shadow = SHADOW.card,
  background = COLORS.white,
  padding = 0,
  style,
  config = SPRING.pop,
  drift = 0,
  driftPhase = 0,
}) => {
  const frame = useCurrentFrame();
  const e = enter(frame, { delay, x, y, scale, rotate, config, fade: 8 });
  const dy = drift ? float(frame, drift, 120, driftPhase) : 0;
  return (
    <div
      style={{
        borderRadius: radius,
        background,
        boxShadow: shadow,
        padding,
        opacity: e.opacity,
        transform: `${e.transform} translateY(${dy.toFixed(2)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ----------------------------------------------------------------- Avatar ---

export const Avatar: React.FC<{
  size: number;
  photo?: string;
  initials?: string;
  bg?: string;
  color?: string;
  badge?: 'whatsapp' | 'online' | 'none';
  delay?: number;
  fontSize?: number;
}> = ({
  size,
  photo,
  initials,
  bg = COLORS.lavenderDeep,
  color = COLORS.primary,
  badge = 'none',
  delay = 0,
  fontSize,
}) => {
  const frame = useCurrentFrame();
  const g = s(frame, { delay, config: SPRING.bouncy });
  const badgeG = s(frame, { delay: delay + 5, config: SPRING.bouncy });
  return (
    <div style={{ position: 'relative', width: size, height: size, transform: `scale(${g})` }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: bg,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {photo ? (
          <Img
            src={staticFile(`photos/${photo}`)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span
            style={{
              fontFamily: FONT.family,
              fontWeight: FONT.bold,
              fontSize: fontSize ?? size * 0.38,
              color,
              letterSpacing: '-0.02em',
            }}
          >
            {initials}
          </span>
        )}
      </div>

      {badge === 'whatsapp' ? (
        <div
          style={{
            position: 'absolute',
            right: -size * 0.04,
            bottom: -size * 0.04,
            transform: `scale(${badgeG})`,
            border: `${Math.max(2, size * 0.05)}px solid ${COLORS.white}`,
            borderRadius: '50%',
            lineHeight: 0,
          }}
        >
          <WhatsappIcon size={size * 0.42} />
        </div>
      ) : null}

      {badge === 'online' ? (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 2,
            width: size * 0.26,
            height: size * 0.26,
            borderRadius: '50%',
            background: COLORS.greenDot,
            border: `${Math.max(2, size * 0.05)}px solid ${COLORS.white}`,
            transform: `scale(${badgeG})`,
          }}
        />
      ) : null}
    </div>
  );
};

// --------------------------------------------------------------- Skeleton ---

/** Barra "placeholder" lavanda, com crescimento e brilho passando. */
export const SkeletonLine: React.FC<{
  width: number;
  height?: number;
  delay?: number;
  color?: string;
  radius?: number;
  shine?: boolean;
}> = ({ width, height = 14, delay = 0, color = COLORS.lavender, radius, shine = true }) => {
  const frame = useCurrentFrame();
  const g = s(frame, { delay, config: SPRING.soft });
  const shinePos = ((frame - delay) % 90) / 90;
  return (
    <div
      style={{
        width: width * g,
        height,
        borderRadius: radius ?? height / 2,
        background: color,
        position: 'relative',
        overflow: 'hidden',
        opacity: iv(frame, [delay, delay + 6], [0, 1]),
      }}
    >
      {shine && frame > delay ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: height * 4,
            left: `${shinePos * 160 - 40}%`,
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)`,
          }}
        />
      ) : null}
    </div>
  );
};

// ------------------------------------------------------------ Chat bubble ---

export const ChatBubble: React.FC<{
  text: string;
  time?: string;
  side: 'left' | 'right';
  delay?: number;
  maxWidth?: number;
  fontSize?: number;
  background?: string;
  color?: string;
  checks?: boolean;
  radius?: number;
  padding?: string;
  style?: React.CSSProperties;
}> = ({
  text,
  time,
  side,
  delay = 0,
  maxWidth = 420,
  fontSize = 26,
  background,
  color = COLORS.body,
  checks = false,
  radius = 20,
  padding = '18px 22px 14px',
  style,
}) => {
  const frame = useCurrentFrame();
  const e = enter(frame, {
    delay,
    y: 16,
    x: side === 'left' ? -18 : 18,
    scale: 0.9,
    config: SPRING.pop,
    fade: 7,
  });
  const bg = background ?? (side === 'right' ? '#DCF8C6' : COLORS.white);
  const checkProg = s(frame, { delay: delay + 10, config: SPRING.soft });

  return (
    <div
      style={{
        maxWidth,
        background: bg,
        borderRadius: radius,
        borderBottomRightRadius: side === 'right' ? 6 : radius,
        borderBottomLeftRadius: side === 'left' ? 6 : radius,
        padding,
        boxShadow: '0 3px 10px rgba(24,22,78,0.07)',
        opacity: e.opacity,
        transform: e.transform,
        alignSelf: side === 'right' ? 'flex-end' : 'flex-start',
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: FONT.family,
          fontWeight: FONT.regular,
          fontSize,
          lineHeight: 1.32,
          color,
          letterSpacing: '-0.01em',
        }}
      >
        {text}
      </div>
      {time ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 8,
            marginTop: 6,
          }}
        >
          <span
            style={{
              fontFamily: FONT.family,
              fontWeight: FONT.medium,
              fontSize: fontSize * 0.66,
              color: COLORS.muted,
            }}
          >
            {time}
          </span>
          {checks ? <DoubleCheck size={fontSize * 0.9} progress={checkProg} /> : null}
        </div>
      ) : null}
    </div>
  );
};

/** Indicador "digitando…" com três bolinhas em onda. */
export const TypingDots: React.FC<{
  delay?: number;
  size?: number;
  color?: string;
  background?: string;
}> = ({ delay = 0, size = 18, color = COLORS.primary, background = COLORS.lavender }) => {
  const frame = useCurrentFrame();
  const e = enter(frame, { delay, scale: 0.6, y: 10, config: SPRING.pop, fade: 6 });
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: size * 0.6,
        alignItems: 'center',
        padding: `${size}px ${size * 1.5}px`,
        background,
        borderRadius: size * 2,
        borderBottomLeftRadius: size * 0.5,
        opacity: e.opacity,
        transform: e.transform,
      }}
    >
      {[0, 1, 2].map((i) => {
        const t = ((frame - delay) / 12 + i * 0.28) % 1;
        const up = Math.sin(t * Math.PI * 2) * size * 0.3;
        return (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              transform: `translateY(${-Math.max(0, up).toFixed(2)}px)`,
              opacity: 0.55 + 0.45 * Math.max(0, Math.sin(t * Math.PI * 2)),
            }}
          />
        );
      })}
    </div>
  );
};

// ----------------------------------------------------- Notification card ----

export const NotificationCard: React.FC<{
  name: string;
  text: string;
  time?: string;
  photo?: string;
  initials?: string;
  badge?: number;
  delay?: number;
  width: number;
  from?: 'left' | 'right';
  fontSize?: number;
  drift?: number;
  driftPhase?: number;
}> = ({
  name,
  text,
  time,
  photo,
  initials,
  badge,
  delay = 0,
  width,
  from = 'left',
  fontSize = 26,
  drift = 4,
  driftPhase = 0,
}) => {
  const frame = useCurrentFrame();
  const badgeG = s(frame, { delay: delay + 8, config: SPRING.bouncy });
  const badgeBeat = pulse(frame, delay + 8, 0.16, 20);
  return (
    <Card
      delay={delay}
      x={from === 'left' ? -70 : 70}
      y={18}
      scale={0.92}
      radius={26}
      drift={drift}
      driftPhase={driftPhase}
      style={{ width, position: 'relative', padding: '22px 26px' }}
    >
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <Avatar
          size={fontSize * 2.5}
          photo={photo}
          initials={initials}
          badge="whatsapp"
          delay={delay + 3}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: FONT.family,
              fontWeight: FONT.bold,
              fontSize: fontSize * 1.05,
              color: COLORS.dark,
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: FONT.family,
              fontWeight: FONT.regular,
              fontSize,
              lineHeight: 1.3,
              color: COLORS.body,
              letterSpacing: '-0.01em',
            }}
          >
            {text}
          </div>
          {time ? (
            <div
              style={{
                fontFamily: FONT.family,
                fontWeight: FONT.medium,
                fontSize: fontSize * 0.72,
                color: COLORS.muted,
                textAlign: 'right',
                marginTop: 6,
              }}
            >
              {time}
            </div>
          ) : null}
        </div>
      </div>

      {badge ? (
        <div
          style={{
            position: 'absolute',
            top: -14,
            right: -10,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: COLORS.primary,
            color: COLORS.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT.family,
            fontWeight: FONT.bold,
            fontSize: 28,
            transform: `scale(${badgeG * (1 + badgeBeat)})`,
            boxShadow: SHADOW.chip,
          }}
        >
          {badge}
        </div>
      ) : null}
    </Card>
  );
};

// ------------------------------------------------------------------ Phone ---

export const PhoneFrame: React.FC<{
  width: number;
  height: number;
  delay?: number;
  children?: React.ReactNode;
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
  style?: React.CSSProperties;
  y?: number;
  scale?: number;
  notch?: boolean;
  drift?: number;
  /** Botões laterais do aparelho. */
  buttons?: boolean;
}> = ({
  width,
  height,
  delay = 0,
  children,
  borderColor = COLORS.primary,
  borderWidth = 12,
  radius = 62,
  style,
  y = 70,
  scale = 0.94,
  notch = true,
  drift = 5,
  buttons = true,
}) => {
  const frame = useCurrentFrame();
  const e = enter(frame, { delay, y, scale, config: SPRING.soft, fade: 10 });
  const dy = float(frame, drift, 150);
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: borderColor,
        padding: borderWidth,
        boxShadow: SHADOW.phone,
        opacity: e.opacity,
        transform: `${e.transform} translateY(${dy.toFixed(2)}px)`,
        position: 'relative',
        ...style,
      }}
    >
      {buttons ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: -borderWidth * 0.45,
              top: height * 0.19,
              width: borderWidth * 0.5,
              height: height * 0.045,
              borderRadius: borderWidth,
              background: borderColor,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: -borderWidth * 0.45,
              top: height * 0.27,
              width: borderWidth * 0.5,
              height: height * 0.075,
              borderRadius: borderWidth,
              background: borderColor,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: -borderWidth * 0.45,
              top: height * 0.24,
              width: borderWidth * 0.5,
              height: height * 0.06,
              borderRadius: borderWidth,
              background: borderColor,
            }}
          />
        </>
      ) : null}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: radius - borderWidth,
          background: COLORS.white,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {notch ? (
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 120,
              height: 12,
              borderRadius: 6,
              background: COLORS.lavenderDeep,
              zIndex: 5,
            }}
          />
        ) : null}
        {children}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------- Chip ---

export const Chip: React.FC<{
  children: React.ReactNode;
  delay?: number;
  background?: string;
  color?: string;
  fontSize?: number;
  padding?: string;
  radius?: number;
  style?: React.CSSProperties;
  from?: 'left' | 'right' | 'none';
}> = ({
  children,
  delay = 0,
  background = COLORS.lavender,
  color = COLORS.primary,
  fontSize = 26,
  padding = '14px 26px',
  radius = 999,
  style,
  from = 'none',
}) => {
  const frame = useCurrentFrame();
  const e = enter(frame, {
    delay,
    scale: 0.82,
    x: from === 'left' ? -30 : from === 'right' ? 30 : 0,
    config: SPRING.pop,
    fade: 7,
  });
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        background,
        color,
        borderRadius: radius,
        padding,
        fontFamily: FONT.family,
        fontWeight: FONT.semi,
        fontSize,
        letterSpacing: '-0.02em',
        opacity: e.opacity,
        transform: e.transform,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Traço tracejado que se desenha (usado na seta da cena 5 e na órbita 24h). */
export const DashPath: React.FC<{
  d: string;
  progress: number;
  length: number;
  color?: string;
  width?: number;
  dash?: string;
  style?: React.CSSProperties;
  svgProps?: React.SVGProps<SVGSVGElement>;
}> = ({ d, progress, length, color = COLORS.lavenderDeep, width = 10, dash = '20 18', style, svgProps }) => (
  <svg style={{ overflow: 'visible', ...style }} {...svgProps}>
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dash}
      style={{
        strokeDashoffset: 0,
        clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
      }}
    />
    <path
      d={d}
      fill="none"
      stroke="transparent"
      strokeWidth={width}
      strokeDasharray={length}
      strokeDashoffset={length * (1 - progress)}
    />
  </svg>
);

/** Contador numérico grande. */
export const Counter: React.FC<{
  value: number;
  delay?: number;
  fontSize: number;
  color?: string;
  duration?: number;
}> = ({ value, delay = 0, fontSize, color = COLORS.dark, duration = 40 }) => {
  const frame = useCurrentFrame();
  const n = Math.round(
    iv(frame, [delay, delay + duration], [0, value], EASE.out),
  );
  const beat = pulse(frame, delay + duration, 0.14, 16);
  return (
    <span
      style={{
        fontFamily: FONT.family,
        fontWeight: FONT.black,
        fontSize,
        color,
        letterSpacing: '-0.04em',
        display: 'inline-block',
        transform: `scale(${1 + beat})`,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {n}
    </span>
  );
};
