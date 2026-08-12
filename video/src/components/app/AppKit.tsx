import React from 'react';
import { FONT } from '../../theme';
import { enter, iv, pulse, s, SPRING } from '../../lib/anim';
import { useSceneFrame } from '../../lib/timing';

/**
 * Tokens do aplicativo Waatzo, amostrados das quatro telas de referência
 * (Início, Conversas, Interesses, Agenda). As telas são web/landscape; aqui
 * elas são remontadas para o viewport vertical do vídeo, preservando ordem,
 * cores, textos e hierarquia.
 */
export const APP = {
  bg: '#F6F7FB',
  surface: '#FFFFFF',
  border: '#E9EBF2',
  borderSoft: '#F0F1F6',

  text: '#101828',
  muted: '#667085',
  faint: '#98A2B3',

  blue: '#4B45F1',
  blueSoft: '#EEF0FE',
  blueText: '#3B31F2',

  amber: '#F59E0B',
  amberBg: '#FDF4E4',
  amberBorder: '#F6DCAE',
  amberText: '#946010',

  green: '#16A34A',
  greenText: '#FFFFFF',

  teal: '#0F9E8E',
  tealBg: '#DFF5F1',

  red: '#E5484D',
  redSoft: '#FDECEC',

  gray: '#F2F4F7',
} as const;

export const PAD = 58;

// ------------------------------------------------------------------ ícones ---

type IcoProps = { size?: number; color?: string; strokeWidth?: number; fill?: boolean };

const svg =
  (viewBox: string, draw: (c: string, w: number, fill: boolean) => React.ReactNode) =>
  ({ size = 30, color = APP.muted, strokeWidth = 2, fill = false }: IcoProps) => (
    <svg width={size} height={size} viewBox={viewBox} style={{ display: 'block' }}>
      {draw(color, strokeWidth, fill)}
    </svg>
  );

export const HomeIco = svg('0 0 24 24', (c, w, fill) => (
  <path
    d="M 3 10.5 L 12 3.5 L 21 10.5 L 21 20 A 1 1 0 0 1 20 21 L 15 21 L 15 15 L 9 15 L 9 21 L 4 21 A 1 1 0 0 1 3 20 Z"
    fill={fill ? c : 'none'}
    stroke={c}
    strokeWidth={w}
    strokeLinejoin="round"
  />
));

export const ChatIco = svg('0 0 24 24', (c, w, fill) => (
  <path
    d="M 4 5 L 20 5 A 1 1 0 0 1 21 6 L 21 15 A 1 1 0 0 1 20 16 L 10 16 L 5.5 20 L 5.5 16 L 4 16 A 1 1 0 0 1 3 15 L 3 6 A 1 1 0 0 1 4 5 Z"
    fill={fill ? c : 'none'}
    stroke={c}
    strokeWidth={w}
    strokeLinejoin="round"
  />
));

export const PeopleIco = svg('0 0 24 24', (c, w, fill) => (
  <g fill={fill ? c : 'none'} stroke={c} strokeWidth={w} strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2" />
    <circle cx="16.5" cy="9" r="2.4" />
    <path d="M 3 19 C 3 15.6 5.7 13.6 9 13.6 C 12.3 13.6 15 15.6 15 19 Z" />
    <path d="M 16 13.4 C 18.6 13.6 21 15 21 18 L 17 18" />
  </g>
));

export const CalendarIco = svg('0 0 24 24', (c, w, fill) => (
  <g fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2.5" fill={fill ? c : 'none'} />
    <path d="M 3 10 L 21 10" stroke={fill ? '#FFF' : c} />
    <path d="M 8 3 L 8 6 M 16 3 L 16 6" strokeLinecap="round" />
  </g>
));

export const ChartIco = svg('0 0 24 24', (c, w) => (
  <g stroke={c} strokeWidth={w} strokeLinecap="round">
    <path d="M 5 20 L 5 12" />
    <path d="M 10 20 L 10 6" />
    <path d="M 15 20 L 15 10" />
    <path d="M 20 20 L 20 14" />
  </g>
));

export const GearIco = svg('0 0 24 24', (c, w) => (
  <g fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M 12 2.6 L 13.4 5.2 L 16.3 4.6 L 16.6 7.5 L 19.4 8.6 L 17.8 11 L 19.4 13.4 L 16.6 14.5 L 16.3 17.4 L 13.4 16.8 L 12 19.4 L 10.6 16.8 L 7.7 17.4 L 7.4 14.5 L 4.6 13.4 L 6.2 11 L 4.6 8.6 L 7.4 7.5 L 7.7 4.6 L 10.6 5.2 Z" />
  </g>
));

export const SearchIco = svg('0 0 24 24', (c, w) => (
  <g fill="none" stroke={c} strokeWidth={w} strokeLinecap="round">
    <circle cx="11" cy="11" r="6.5" />
    <path d="M 16 16 L 21 21" />
  </g>
));

export const BackIco = svg('0 0 24 24', (c, w) => (
  <path
    d="M 15 4 L 7 12 L 15 20"
    fill="none"
    stroke={c}
    strokeWidth={w}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
));

export const BellIco = svg('0 0 24 24', (c, w) => (
  <g fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round">
    <path d="M 6 16 L 6 10.5 C 6 7 8.7 4.5 12 4.5 C 15.3 4.5 18 7 18 10.5 L 18 16 L 20 18.5 L 4 18.5 Z" />
    <path d="M 10 21 C 10.5 21.8 11.2 22.2 12 22.2 C 12.8 22.2 13.5 21.8 14 21" />
  </g>
));

export const DownloadIco = svg('0 0 24 24', (c, w) => (
  <g fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d="M 12 3.5 L 12 15" />
    <path d="M 7 10.5 L 12 15.5 L 17 10.5" />
    <path d="M 4 19.5 L 20 19.5" />
  </g>
));

export const TrashIco = svg('0 0 24 24', (c, w) => (
  <g fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d="M 4 6.5 L 20 6.5" />
    <path d="M 9 6.5 L 9 4.5 L 15 4.5 L 15 6.5" />
    <path d="M 6.5 6.5 L 7.5 20 L 16.5 20 L 17.5 6.5" />
  </g>
));

export const PlusIco = svg('0 0 24 24', (c, w) => (
  <g stroke={c} strokeWidth={w} strokeLinecap="round">
    <path d="M 12 5 L 12 19" />
    <path d="M 5 12 L 19 12" />
  </g>
));

export const BriefcaseIco = svg('0 0 24 24', (c, w) => (
  <g fill="none" stroke={c} strokeWidth={w} strokeLinejoin="round">
    <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
    <path d="M 9 7.5 L 9 5.5 L 15 5.5 L 15 7.5" />
  </g>
));

export const MicIco = svg('0 0 24 24', (c, w) => (
  <g fill="none" stroke={c} strokeWidth={w} strokeLinecap="round">
    <rect x="9.5" y="3" width="5" height="10" rx="2.5" fill={c} stroke="none" />
    <path d="M 6 11.5 C 6 15 8.7 17 12 17 C 15.3 17 18 15 18 11.5" />
    <path d="M 12 17 L 12 21" />
  </g>
));

export const RefreshIco = svg('0 0 24 24', (c, w) => (
  <g fill="none" stroke={c} strokeWidth={w} strokeLinecap="round">
    <path d="M 20 12 A 8 8 0 1 1 17 6" />
    <path d="M 17 3 L 17 6.5 L 13.5 6.5" />
  </g>
));

export const ArrowUpRightIco = svg('0 0 24 24', (c, w) => (
  <g fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d="M 7 17 L 17 7" />
    <path d="M 9 7 L 17 7 L 17 15" />
  </g>
));

export const WarnIco: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M 12 3.6 L 22 20 L 2 20 Z"
      fill="none"
      stroke={APP.amber}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <path d="M 12 9.5 L 12 14" stroke={APP.amber} strokeWidth={2} strokeLinecap="round" />
    <circle cx="12" cy="16.6" r="1.2" fill={APP.amber} />
  </svg>
);

export const CheckIco = svg('0 0 24 24', (c, w) => (
  <path
    d="M 5 12.5 L 10 17.5 L 19 7"
    fill="none"
    stroke={c}
    strokeWidth={w + 0.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
));

// -------------------------------------------------------------- primitivas ---

const font = (weight: number, size: number, color: string) => ({
  fontFamily: FONT.family,
  fontWeight: weight,
  fontSize: size,
  color,
  letterSpacing: '-0.015em',
});

/** Bloco que entra com fade + subida, escalonável por índice. */
export const Reveal: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 20, children, style }) => {
  const frame = useSceneFrame();
  const e = enter(frame, { delay, y, scale: 0.985, config: SPRING.pop, fade: 6 });
  return <div style={{ opacity: e.opacity, transform: e.transform, ...style }}>{children}</div>;
};

/** Realce curto — usado quando o cursor aponta um elemento. */
export const useHighlight = (at: number | null, len = 26) => {
  const frame = useSceneFrame();
  if (at === null) return { scale: 1, glow: 0 };
  const beat = pulse(frame, at, 0.035, len);
  const glow = frame >= at && frame < at + len ? 1 - (frame - at) / len : 0;
  return { scale: 1 + beat, glow };
};

export const Avatar: React.FC<{
  size: number;
  photo?: string;
  bg?: string;
  delay?: number;
}> = ({ size, photo, bg = '#1A1C2B', delay = 0 }) => {
  const frame = useSceneFrame();
  const g = s(frame, { delay, config: SPRING.bouncy });
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: photo ? undefined : bg,
        backgroundImage: photo ? `url(${photo})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexShrink: 0,
        transform: `scale(${g})`,
      }}
    />
  );
};

/** Banner âmbar "IA pausada" presente em três das telas. */
export const AlertBanner: React.FC<{
  title: string;
  body?: string;
  action?: string;
  button?: string;
  delay?: number;
}> = ({ title, body, action, button, delay = 0 }) => (
  <Reveal delay={delay} y={-14}>
    <div
      style={{
        display: 'flex',
        gap: 22,
        alignItems: button ? 'flex-start' : 'center',
        background: APP.amberBg,
        border: `2px solid ${APP.amberBorder}`,
        borderRadius: 20,
        padding: '22px 26px',
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          background: '#F8E7C6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <WarnIco size={30} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={font(FONT.bold, 28, APP.text)}>{title}</div>
        {body ? (
          <div style={{ ...font(FONT.regular, 25, APP.amberText), marginTop: 6, lineHeight: 1.35 }}>
            {body}
          </div>
        ) : null}
        {button ? (
          <div
            style={{
              display: 'inline-block',
              marginTop: 18,
              background: APP.amber,
              borderRadius: 12,
              padding: '14px 24px',
              ...font(FONT.semi, 25, '#FFFFFF'),
            }}
          >
            {button}
          </div>
        ) : null}
      </div>
      {action ? (
        <div style={{ ...font(FONT.semi, 26, APP.amberText), whiteSpace: 'nowrap' }}>{action}</div>
      ) : null}
    </div>
  </Reveal>
);

export const SearchField: React.FC<{ placeholder: string; delay?: number; caret?: boolean }> = ({
  placeholder,
  delay = 0,
  caret = false,
}) => {
  const frame = useSceneFrame();
  const blink = Math.floor((frame - delay) / 8) % 2 === 0;
  return (
    <Reveal delay={delay}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          background: '#F1F3F9',
          border: `2px solid ${APP.border}`,
          borderRadius: 16,
          padding: '22px 26px',
        }}
      >
        <SearchIco size={30} color={APP.faint} strokeWidth={2.2} />
        <span style={font(FONT.regular, 27, APP.faint)}>
          {placeholder}
          {caret ? (
            <span style={{ color: APP.blue, opacity: blink ? 1 : 0 }}>|</span>
          ) : null}
        </span>
      </div>
    </Reveal>
  );
};

export type TabSpec = {
  label: string;
  count?: number;
  tone?: 'active' | 'amber' | 'teal' | 'plain';
};

export const TabRow: React.FC<{ tabs: TabSpec[]; delay?: number; gap?: number }> = ({
  tabs,
  delay = 0,
  gap = 12,
}) => {
  const frame = useSceneFrame();
  return (
    <div style={{ display: 'flex', gap, overflow: 'hidden' }}>
      {tabs.map((t, i) => {
        const e = enter(frame, {
          delay: delay + i * 2.5,
          y: 12,
          scale: 0.94,
          config: SPRING.pop,
          fade: 5,
        });
        const tone = t.tone ?? 'plain';
        const bg =
          tone === 'active'
            ? APP.blue
            : tone === 'amber'
              ? '#FDF1DF'
              : tone === 'teal'
                ? APP.tealBg
                : APP.gray;
        const fg =
          tone === 'active'
            ? '#FFFFFF'
            : tone === 'amber'
              ? APP.amberText
              : tone === 'teal'
                ? APP.teal
                : APP.muted;
        return (
          <div
            key={t.label}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: bg,
              borderRadius: 14,
              padding: '18px 10px',
              whiteSpace: 'nowrap',
              opacity: e.opacity,
              transform: e.transform,
              ...font(FONT.semi, 24, fg),
            }}
          >
            {t.label}
            {t.count !== undefined ? (
              <span
                style={{
                  background: tone === 'active' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.07)',
                  borderRadius: 8,
                  padding: '2px 9px',
                  ...font(FONT.bold, 21, fg),
                }}
              >
                {t.count}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export const Pill: React.FC<{
  children: React.ReactNode;
  bg: string;
  color: string;
  delay?: number;
  size?: number;
  border?: string;
}> = ({ children, bg, color, delay = 0, size = 22, border }) => {
  const frame = useSceneFrame();
  const g = s(frame, { delay, config: SPRING.bouncy });
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: bg,
        border: border ? `2px solid ${border}` : undefined,
        borderRadius: 9,
        padding: '6px 14px',
        transform: `scale(${g})`,
        ...font(FONT.semi, size, color),
      }}
    >
      {children}
    </span>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  delay?: number;
  padding?: string;
  active?: boolean;
  style?: React.CSSProperties;
  highlight?: number;
}> = ({ children, delay = 0, padding = '30px', active = false, style, highlight }) => {
  const frame = useSceneFrame();
  const e = enter(frame, { delay, y: 26, scale: 0.985, config: SPRING.pop, fade: 6 });
  const hi = highlight !== undefined ? pulse(frame, highlight, 0.02, 26) : 0;
  const ring =
    highlight !== undefined && frame >= highlight && frame < highlight + 30
      ? 1 - (frame - highlight) / 30
      : 0;
  return (
    <div
      style={{
        background: APP.surface,
        border: `2px solid ${active ? APP.blue : APP.border}`,
        borderRadius: 22,
        padding,
        opacity: e.opacity,
        transform: `${e.transform} scale(${1 + hi})`,
        boxShadow: ring
          ? `0 0 0 ${(6 * ring).toFixed(1)}px rgba(75,69,241,${(0.16 * ring).toFixed(3)})`
          : '0 1px 2px rgba(16,24,40,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Menu inferior — igual em todas as telas, muda só o item ativo. */
export const BottomNav: React.FC<{ active: number; pressAt?: number | null }> = ({
  active,
  pressAt = null,
}) => {
  const frame = useSceneFrame();
  const items = [
    { label: 'Início', Ico: HomeIco },
    { label: 'Conversas', Ico: ChatIco, badge: 6 },
    { label: 'Interesses', Ico: PeopleIco },
    { label: 'Agenda', Ico: CalendarIco },
    { label: 'Relatório', Ico: ChartIco },
    { label: 'Config', Ico: GearIco },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 168,
        background: APP.surface,
        borderTop: `2px solid ${APP.border}`,
        display: 'flex',
        alignItems: 'center',
        paddingBottom: 14,
      }}
    >
      {items.map((it, i) => {
        const on = i === active;
        const pressed =
          pressAt !== null && i === active && frame >= pressAt && frame < pressAt + 5;
        const beat = on ? pulse(frame, pressAt ?? -999, 0.14, 20) : 0;
        return (
          <div
            key={it.label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              transform: `scale(${(1 + beat) * (pressed ? 0.94 : 1)})`,
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 76,
                height: 52,
                borderRadius: 26,
                background: on ? APP.blueSoft : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <it.Ico size={32} color={on ? APP.blue : APP.muted} strokeWidth={2} />
              {it.badge ? (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: 8,
                    minWidth: 26,
                    height: 26,
                    borderRadius: 13,
                    background: APP.amber,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...font(FONT.bold, 18, '#FFFFFF'),
                  }}
                >
                  {it.badge}
                </span>
              ) : null}
            </div>
            <span style={font(on ? FONT.semi : FONT.medium, 21, on ? APP.blue : APP.muted)}>
              {it.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/** Cabeçalho de tela interna: voltar + título + ação à direita. */
export const ScreenHeader: React.FC<{
  title: string;
  right?: React.ReactNode;
  delay?: number;
}> = ({ title, right, delay = 0 }) => (
  <Reveal delay={delay} y={-12}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: `26px ${PAD}px 24px`,
        background: APP.surface,
        borderBottom: `2px solid ${APP.border}`,
      }}
    >
      <BackIco size={34} color={APP.text} strokeWidth={2.4} />
      <span style={{ ...font(FONT.bold, 38, APP.text), flex: 1 }}>{title}</span>
      {right}
    </div>
  </Reveal>
);

export const TEXT = font;
