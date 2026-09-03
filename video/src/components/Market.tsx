import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { beat, overshoot } from '../config/beat';
import { font } from '../config/theme';

export type Brand = 'shopee' | 'mercadolivre' | 'shein';

const BRANDS: Record<Brand, {
  name: string; bar: string; ink: string; title: string; accent: string; dark?: boolean;
}> = {
  shopee: { name: 'Shopee', bar: '#ee4d2d', ink: '#ffffff', title: 'Novas compras', accent: '#ee4d2d' },
  mercadolivre: { name: 'mercado livre', bar: '#ffe600', ink: '#2d3277', title: 'Novas vendas', accent: '#3483fa' },
  shein: { name: 'SHEIN', bar: '#000000', ink: '#ffffff', title: 'Novos pedidos', accent: '#111827', dark: true },
};

type Order = { id: string; city: string; status: string };

/**
 * Tela de marketplace. Cada pedido entra empurrando a lista para baixo, num
 * tempo próprio por aparelho — é a "notificação de nova compra dentro de cada
 * celular de forma individual" que o roteiro pede.
 */
export const MarketScreen: React.FC<{
  brand: Brand;
  width: number;
  start: number;
  /** Intervalo entre pedidos, em tempos musicais. */
  every?: number;
  orders: Order[];
}> = ({ brand, width, start, every = 1, orders }) => {
  const frame = useCurrentFrame();
  const b = BRANDS[brand];
  const bg = b.dark ? '#0a0a0a' : '#ffffff';
  const cardBg = b.dark ? '#161616' : '#ffffff';
  const textMain = b.dark ? '#f5f5f5' : '#111827';
  const textSub = b.dark ? '#9aa0aa' : '#6b7285';

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, fontFamily: font.body }}>
      <div
        style={{
          height: width * 0.2, background: b.bar,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          padding: `0 ${width * 0.05}px ${width * 0.03}px`,
        }}
      >
        <div style={{ fontSize: width * 0.062, fontWeight: 800, color: b.ink, letterSpacing: brand === 'shein' ? '0.14em' : '-0.01em' }}>
          {b.name}
        </div>
        <div style={{ fontSize: width * 0.05, color: b.ink, opacity: 0.9 }}>●</div>
      </div>

      <div style={{ padding: width * 0.05 }}>
        <div style={{ fontSize: width * 0.055, fontWeight: 800, color: textMain, marginBottom: width * 0.04 }}>
          {b.title}
        </div>

        {orders.map((o, i) => {
          const at = start + beat(i * every);
          const p = overshoot(frame, at, 1);
          if (frame < at - 2) return null;
          return (
            <div
              key={o.id}
              style={{
                display: 'flex', gap: width * 0.035, alignItems: 'center',
                background: cardBg,
                border: `1px solid ${b.dark ? '#242424' : '#eceef4'}`,
                borderRadius: width * 0.03,
                padding: width * 0.03,
                marginBottom: width * 0.028,
                opacity: interpolate(p, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(p, [0, 1], [-width * 0.12, 0])}px)`,
                boxShadow: `0 ${width * 0.01}px ${width * 0.04}px rgba(0,0,0,${b.dark ? 0.6 : 0.08})`,
              }}
            >
              <div
                style={{
                  width: width * 0.13, height: width * 0.13, borderRadius: width * 0.02,
                  background: b.dark ? '#232323' : '#f1f3f8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: width * 0.06,
                }}
              >
                📦
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: width * 0.042, fontWeight: 700, color: textMain }}>{o.id}</div>
                <div style={{ fontSize: width * 0.034, color: textSub }}>{o.status}</div>
                <div style={{ fontSize: width * 0.034, color: textSub }}>{o.city}</div>
              </div>
              <div style={{ fontSize: width * 0.032, color: b.accent, fontWeight: 700 }}>Agora</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
