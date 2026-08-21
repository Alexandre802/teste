import React from 'react';

type P = { size?: number; color?: string };

const S: React.FC<React.PropsWithChildren<P & { vb?: string }>> = ({
  size = 24, color = 'currentColor', vb = '0 0 24 24', children,
}) => (
  <svg width={size} height={size} viewBox={vb} fill="none" stroke={color} strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {children}
  </svg>
);

export const IconBox: React.FC<P> = (p) => (
  <S {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></S>
);

export const IconTruck: React.FC<P> = (p) => (
  <S {...p}><path d="M1 6h12v9H1z" /><path d="M13 9h4l4 4v2h-8z" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></S>
);

export const IconCheck: React.FC<P> = (p) => (
  <S {...p}><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></S>
);

export const IconShield: React.FC<P> = (p) => (
  <S {...p}><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" /></S>
);

export const IconEye: React.FC<P> = (p) => (
  <S {...p}><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.6" /></S>
);

export const IconPin: React.FC<P> = (p) => (
  <S {...p}><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></S>
);

export const IconStar: React.FC<P> = ({ size = 24, color = '#ffc21a' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
    <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z" />
  </svg>
);
