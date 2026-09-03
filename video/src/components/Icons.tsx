import React from 'react';

type P = { size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties };

const S: React.FC<P & { children: React.ReactNode; box?: number }> = ({
  size = 40,
  color = 'currentColor',
  strokeWidth = 2.2,
  children,
  box = 24,
  style,
}) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${box} ${box}`}
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block', overflow: 'visible', ...style }}
  >
    {children}
  </svg>
);

export const ArrowUp: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </S>
);

export const ArrowDown: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M12 5v14" />
    <path d="M19 12l-7 7-7-7" />
  </S>
);

export const Equals: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M5 9h14" />
    <path d="M5 15h14" />
  </S>
);

export const TrendUp: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </S>
);

export const ArrowUpRight: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M7 17L17 7" />
    <path d="M8 7h9v9" />
  </S>
);

export const BarsIcon: React.FC<P> = ({ size = 40, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block', ...style }}>
    <rect x="4" y="13" width="3.4" height="7" rx="1.2" />
    <rect x="10.3" y="8" width="3.4" height="12" rx="1.2" />
    <rect x="16.6" y="4" width="3.4" height="16" rx="1.2" />
  </svg>
);

export const DownloadBox: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M12 4v9" />
    <path d="M8.5 9.5L12 13l3.5-3.5" />
    <path d="M4.5 15v2.5a2 2 0 002 2h11a2 2 0 002-2V15" />
  </S>
);

export const UploadBox: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M12 13V4" />
    <path d="M8.5 7.5L12 4l3.5 3.5" />
    <path d="M4.5 15v2.5a2 2 0 002 2h11a2 2 0 002-2V15" />
  </S>
);

export const Bell: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M18 8a6 6 0 10-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
    <path d="M10.5 20a2 2 0 003 0" />
  </S>
);

export const Menu: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h11" />
  </S>
);

export const HomeIcon: React.FC<P> = ({ size = 40, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block', ...style }}>
    <path d="M12 3.2L3.4 10.2c-.3.2-.4.6-.4.9V20c0 .6.4 1 1 1h5v-6h6v6h5c.6 0 1-.4 1-1v-8.9c0-.3-.1-.7-.4-.9L12 3.2z" />
  </svg>
);

export const PieIcon: React.FC<P> = ({ size = 40, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block', ...style }}>
    <path d="M11 3a9 9 0 108.9 10.4H11V3z" opacity="0.55" />
    <path d="M13 3v8h8a9 9 0 00-8-8z" />
  </svg>
);

export const UserIcon: React.FC<P> = ({ size = 40, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block', ...style }}>
    <circle cx="12" cy="8" r="3.8" />
    <path d="M4.6 20c.6-4 3.8-6.2 7.4-6.2S18.8 16 19.4 20H4.6z" />
  </svg>
);

export const Check: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </S>
);

export const Sparkle: React.FC<P> = ({ size = 40, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block', overflow: 'visible', ...style }}>
    <path d="M12 2.6l1.9 5.4 5.5 2-5.5 2-1.9 5.4-1.9-5.4-5.5-2 5.5-2z" />
    <path d="M19 15.2l.9 2.5 2.6.9-2.6.9-.9 2.5-.9-2.5-2.6-.9 2.6-.9z" opacity="0.75" />
  </svg>
);

export const Star: React.FC<P> = ({ size = 40, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block', ...style }}>
    <path d="M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.6l-5.8 3.1 1.1-6.5L2.6 9.6l6.5-.9z" />
  </svg>
);

export const Dollar: React.FC<P> = (p) => (
  <S {...p}>
    <path d="M12 3v18" />
    <path d="M16 7.2c-.9-1.3-2.4-2-4-2-2.2 0-3.8 1.2-3.8 3s1.4 2.6 3.8 3.2c2.6.6 4.2 1.5 4.2 3.4 0 2-1.8 3.2-4.2 3.2-1.9 0-3.5-.8-4.4-2.2" />
  </S>
);

export const Chevron: React.FC<P & { dir?: 'left' | 'right' }> = ({ dir = 'right', ...p }) => (
  <S {...p}>
    {dir === 'right' ? <path d="M9.5 5l7 7-7 7" /> : <path d="M14.5 5l-7 7 7 7" />}
  </S>
);

export const Search: React.FC<P> = (p) => (
  <S {...p}>
    <circle cx="11" cy="11" r="6.2" />
    <path d="M15.6 15.6L20 20" />
  </S>
);
