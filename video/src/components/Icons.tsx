/**
 * Ícones da interface, redesenhados em SVG a partir da referência 430F957D.
 * Vetoriais para escalar no zoom da cena 4 sem serrilhado.
 */
import React from "react";

type IconProps = { size?: number; color?: string; strokeWidth?: number };

const base = (size: number, color: string, sw: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: color,
  strokeWidth: sw,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const PixIcon: React.FC<IconProps> = ({ size = 24, color = "#111", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M12 3.2 20.8 12 12 20.8 3.2 12z" />
    <path d="M8.4 8.4 12 4.8l3.6 3.6M8.4 15.6 12 19.2l3.6-3.6" />
  </svg>
);

export const BarcodeIcon: React.FC<IconProps> = ({ size = 24, color = "#111", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M4 5v14M8 5v14M12 5v14M16 5v14M20 5v14" />
  </svg>
);

export const TransferIcon: React.FC<IconProps> = ({ size = 24, color = "#111", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
    <path d="M12 15V9m0 0-2.4 2.4M12 9l2.4 2.4" />
  </svg>
);

export const DepositIcon: React.FC<IconProps> = ({ size = 24, color = "#111", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
    <path d="M12 9v6m0 0 2.4-2.4M12 15l-2.4-2.4" />
  </svg>
);

export const CardIcon: React.FC<IconProps> = ({ size = 24, color = "#111", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <rect x="7" y="3" width="13" height="18" rx="2.5" />
    <path d="M4.5 6.5v12a2.5 2.5 0 0 0 2.5 2.5" />
  </svg>
);

export const PhoneCardIcon: React.FC<IconProps> = ({ size = 24, color = "#111", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ size = 24, color = "#fff", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);

export const HelpIcon: React.FC<IconProps> = ({ size = 24, color = "#fff", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <circle cx="12" cy="12" r="9.2" />
    <path d="M9.6 9.4a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.4v.4" />
    <path d="M12 17.1h.01" />
  </svg>
);

export const MailIcon: React.FC<IconProps> = ({ size = 24, color = "#fff", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5z" />
    <path d="m3.6 6.9 8.4 5.6 8.4-5.6" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ size = 24, color = "#fff", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <circle cx="12" cy="8.4" r="3.6" />
    <path d="M4.8 20.2c1.1-3.7 3.9-5.6 7.2-5.6s6.1 1.9 7.2 5.6" />
  </svg>
);

export const ChevronIcon: React.FC<IconProps> = ({ size = 24, color = "#111", strokeWidth = 2 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="m9.5 5 7 7-7 7" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ size = 24, color = "#fff", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="M12 2.6 4.6 5.8v6.1c0 4.6 3.1 8.4 7.4 9.5 4.3-1.1 7.4-4.9 7.4-9.5V5.8z" />
  </svg>
);

export const LockIcon: React.FC<IconProps> = ({ size = 24, color = "#fff", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <rect x="4.8" y="10.4" width="14.4" height="10" rx="2.4" />
    <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" />
  </svg>
);

export const CoinIcon: React.FC<IconProps> = ({ size = 24, color = "#fff", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6.8v10.4M14.8 9.2c-.6-.9-1.6-1.3-2.8-1.3-1.7 0-2.9.9-2.9 2.2 0 3 5.8 1.6 5.8 4.5 0 1.4-1.3 2.3-3 2.3-1.3 0-2.4-.5-3-1.4" />
  </svg>
);

export const BotIcon: React.FC<IconProps> = ({ size = 24, color = "#fff", strokeWidth = 1.8 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <rect x="3.6" y="8" width="16.8" height="11.4" rx="3.4" />
    <path d="M12 8V4.6M12 4.6a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8z" />
    <circle cx="8.8" cy="13.6" r="1.5" fill={color} stroke="none" />
    <circle cx="15.2" cy="13.6" r="1.5" fill={color} stroke="none" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 24, color = "#fff", strokeWidth = 2.6 }) => (
  <svg {...base(size, color, strokeWidth)}>
    <path d="m5 12.6 4.6 4.6L19 7.4" />
  </svg>
);

/** Barra de status do iOS: relógio, sinal, wi-fi e bateria. */
export const StatusBar: React.FC<{ width: number; color?: string; time?: string }> = ({
  width,
  color = "#fff",
  time = "19:10",
}) => {
  const s = width / 390; // escala relativa à largura de referência
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${10 * s}px ${22 * s}px ${2 * s}px`,
        color,
        fontFamily: '"Inter", sans-serif',
        fontWeight: 600,
        fontSize: 15 * s,
        letterSpacing: 0.2,
      }}
    >
      <span>{time}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 * s }}>
        {/* sinal */}
        <svg width={18 * s} height={12 * s} viewBox="0 0 18 12">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 4.6}
              y={9 - i * 2.8}
              width="3.2"
              height={3 + i * 2.8}
              rx="1"
              fill={color}
            />
          ))}
        </svg>
        {/* wi-fi */}
        <svg width={16 * s} height={12 * s} viewBox="0 0 16 12" fill="none">
          <path d="M1 4.2a10 10 0 0 1 14 0" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M3.6 6.9a6.4 6.4 0 0 1 8.8 0" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="8" cy="10" r="1.3" fill={color} />
        </svg>
        {/* bateria */}
        <svg width={26 * s} height={12 * s} viewBox="0 0 26 12" fill="none">
          <rect x="0.7" y="0.7" width="21" height="10.6" rx="3" stroke={color} strokeWidth="1.3" opacity="0.6" />
          <rect x="2.4" y="2.4" width="17.6" height="7.2" rx="1.8" fill={color} />
          <path d="M23.6 4.2v3.6a2 2 0 0 0 0-3.6z" fill={color} opacity="0.7" />
        </svg>
      </div>
    </div>
  );
};
