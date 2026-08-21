import React from 'react';
import { interpolate, spring, useCurrentFrame } from 'remotion';
import { FPS, beat, fade } from '../config/beat';
import { font } from '../config/theme';

export type Row = { id: string; status: string; city: string };

/**
 * Lista de pedidos dentro da tela de um aparelho da arte.
 *
 * O componente cobre exatamente a área branca (ou preta, na Shein) do mockup
 * e redesenha as linhas, que entram uma a uma — é o que dá vida à tela sem
 * precisar mexer na arte, que vem achatada.
 */
export const ScreenList: React.FC<{
  rows: Row[];
  start: number;
  /** Retângulo da lista no quadro, em pixels da composição. */
  rect: { x: number; y: number; w: number; h: number };
  tone?: 'light' | 'dark';
  accent: string;
  /** Intervalo entre linhas, em tempos musicais. */
  everyBeats?: number;
  /** Rótulo da última linha, como "Ver todos os pedidos". */
  footer?: string;
}> = ({ rows, start, rect, tone = 'light', accent, everyBeats = 0.75, footer }) => {
  const frame = useCurrentFrame();
  const dark = tone === 'dark';
  const rowH = (rect.h - 40) / rows.length;
  const k = rect.w / 181;

  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x, top: rect.y, width: rect.w, height: rect.h,
        background: dark ? '#0a0a0a' : '#ffffff',
        overflow: 'hidden',
        fontFamily: font.body,
      }}
    >
      {rows.map((r, i) => {
        const at = start + beat(i * everyBeats);
        const p = spring({
          frame: frame - at,
          fps: FPS,
          durationInFrames: beat(1),
          config: { damping: 15, mass: 0.8, stiffness: 130 },
        });
        return (
          <div
            key={r.id}
            style={{
              position: 'absolute',
              left: 0, right: 0, top: i * rowH,
              height: rowH,
              display: 'flex', alignItems: 'center', gap: 5 * k,
              padding: `0 ${6 * k}px`,
              borderBottom: `1px solid ${dark ? '#1c1c1c' : '#eef0f6'}`,
              opacity: fade(frame, at, 0.4),
              transform: `translateY(${interpolate(p, [0, 1], [-rowH * 0.7, 0])}px)`,
            }}
          >
            <div
              style={{
                width: rowH * 0.44, height: rowH * 0.44, borderRadius: 5 * k,
                background: dark ? '#1e1e1e' : '#f2f4f9',
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: rowH * 0.3,
              }}
            >
              📦
            </div>
            <div style={{ minWidth: 0, flex: 1, lineHeight: 1.24, overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 10.5 * k, fontWeight: 700, whiteSpace: 'nowrap',
                  color: dark ? '#f2f2f2' : '#101828',
                }}
              >
                {r.id}
              </div>
              <div style={{ fontSize: 8.2 * k, whiteSpace: 'nowrap', color: dark ? '#8b8f98' : '#6b7285' }}>
                {r.status}
              </div>
              <div style={{ fontSize: 8.2 * k, whiteSpace: 'nowrap', color: dark ? '#8b8f98' : '#6b7285' }}>
                {r.city}
              </div>
            </div>
            <div style={{ fontSize: 7.5 * k, fontWeight: 700, color: accent, whiteSpace: 'nowrap' }}>Agora</div>
          </div>
        );
      })}

      {footer ? (
        <div
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `0 ${6 * k}px`,
            borderTop: `1px solid ${dark ? '#1c1c1c' : '#eef0f6'}`,
            fontSize: 10.5 * k, fontWeight: 600, whiteSpace: 'nowrap',
            color: dark ? '#c9ccd2' : '#101828',
            opacity: fade(frame, start + beat(rows.length * everyBeats), 0.5),
          }}
        >
          {footer}
          <span style={{ color: dark ? '#8b8f98' : '#98a0b3' }}>›</span>
        </div>
      ) : null}
    </div>
  );
};
