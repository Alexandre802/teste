/**
 * Ícones vetoriais redesenhados a partir das imagens de referência.
 * Todos usam `currentColor` e `strokeWidth` configurável para poderem ser
 * animados (cor, traço, desenho progressivo).
 */
import React from "react";

export type IconName =
  | "car"
  | "gauge"
  | "doc"
  | "scales"
  | "gavel"
  | "dollar"
  | "shield"
  | "shieldCheck"
  | "bolt"
  | "bell"
  | "chart"
  | "search"
  | "check"
  | "warning"
  | "lock"
  | "sliders"
  | "person"
  | "tag"
  | "exclam";

type P = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

const Svg: React.FC<P & { children: React.ReactNode; box?: number }> = ({
  size = 34,
  color = "currentColor",
  strokeWidth = 2,
  style,
  children,
  box = 24,
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
    style={{ display: "block", overflow: "visible", ...style }}
  >
    {children}
  </svg>
);

export const IconCar: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4.5 13.2 6 8.6A2 2 0 0 1 7.9 7.2h8.2A2 2 0 0 1 18 8.6l1.5 4.6" />
    <rect x="3" y="13" width="18" height="5.4" rx="1.9" />
    <circle cx="7.2" cy="18.4" r="1.5" fill={p.color ?? "currentColor"} stroke="none" />
    <circle cx="16.8" cy="18.4" r="1.5" fill={p.color ?? "currentColor"} stroke="none" />
    <path d="M6.4 15.6h1.9M15.7 15.6h1.9" />
  </Svg>
);

export const IconGauge: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3.4 17.2a9 9 0 1 1 17.2 0" />
    <path d="M12 16.4 16.6 9.9" strokeWidth={(p.strokeWidth ?? 2) * 1.05} />
    <circle cx="12" cy="17" r="1.35" fill={p.color ?? "currentColor"} stroke="none" />
    <path d="M5.6 13.2h1.3M17.1 13.2h1.3M8.1 9.4l.9.9M15.9 9.4l-.9.9M12 7.6v1.3" />
  </Svg>
);

export const IconDoc: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M6.6 3.4h7l4.4 4.4v12.8H6.6z" />
    <path d="M13.4 3.4v4.6H18" />
    <path d="M9.4 12.4h5.4M9.4 15.4h5.4M9.4 18h3.2" />
  </Svg>
);

export const IconScales: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 3.6v16.8M7.4 20.4h9.2" />
    <path d="M4.2 8.2h15.6M12 5.6 4.2 8.2M12 5.6l7.8 2.6" />
    <path d="M1.9 8.2 4.2 13.6h4.6L6.5 8.2" />
    <path d="M17.5 8.2 15.2 13.6h4.6L22.1 8.2" />
  </Svg>
);

export const IconGavel: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="11.2" y="2.6" width="7.6" height="4.6" rx="1.2" transform="rotate(45 15 4.9)" />
    <path d="M13.1 8.9 6.4 15.6a2 2 0 1 0 2.8 2.8l6.7-6.7" />
    <path d="M4.2 20.6h7.4" strokeWidth={(p.strokeWidth ?? 2) * 1.1} />
  </Svg>
);

export const IconDollar: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 3.6v16.8" />
    <path d="M15.9 7.6c0-1.6-1.7-2.4-3.9-2.4s-3.9.9-3.9 2.8c0 1.8 1.6 2.5 3.9 3 2.4.5 4.1 1.2 4.1 3.2 0 2-1.9 2.9-4.1 2.9s-4.1-.9-4.1-2.7" />
  </Svg>
);

export const IconShield: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 2.9 4.8 5.6v6.1c0 4.4 3 7.9 7.2 9.4 4.2-1.5 7.2-5 7.2-9.4V5.6z" />
    <path d="M8.9 12.1l2.2 2.2 4.1-4.4" />
  </Svg>
);

export const IconShieldCheck: React.FC<P> = IconShield;

export const IconBolt: React.FC<P> = (p) => (
  <Svg {...p}>
    <path
      d="M13.6 2.4 5.9 13.1h4.7l-1.2 8.5 8-11h-4.9z"
      fill={p.color ?? "currentColor"}
      stroke="none"
    />
  </Svg>
);

export const IconBell: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 3.1c-3 0-5 2.2-5 5.1 0 3.6-.9 5-1.8 6.1-.5.6-.1 1.6.7 1.6h12.2c.8 0 1.2-1 .7-1.6-.9-1.1-1.8-2.5-1.8-6.1 0-2.9-2-5.1-5-5.1z" />
    <path d="M10 19.1a2.2 2.2 0 0 0 4 0" />
  </Svg>
);

export const IconChart: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="4" y="12.6" width="3.6" height="7.4" rx="1.2" fill={p.color ?? "currentColor"} stroke="none" />
    <rect x="10.2" y="8.2" width="3.6" height="11.8" rx="1.2" fill={p.color ?? "currentColor"} stroke="none" />
    <rect x="16.4" y="4.2" width="3.6" height="15.8" rx="1.2" fill={p.color ?? "currentColor"} stroke="none" />
  </Svg>
);

export const IconSearch: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="10.8" cy="10.8" r="6.6" />
    <path d="M15.8 15.8 20.6 20.6" strokeWidth={(p.strokeWidth ?? 2) * 1.1} />
  </Svg>
);

export const IconCheck: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.4l2.7 2.7L16.2 9.4" />
  </Svg>
);

export const IconWarning: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 3.9 2.6 20.1h18.8z" />
    <path d="M12 9.6v5.1" />
    <circle cx="12" cy="17.4" r="0.9" fill={p.color ?? "currentColor"} stroke="none" />
  </Svg>
);

export const IconLock: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 2.9 4.8 5.6v6.1c0 4.4 3 7.9 7.2 9.4 4.2-1.5 7.2-5 7.2-9.4V5.6z" />
    <rect x="9" y="11.3" width="6" height="5" rx="1.1" />
    <path d="M10.4 11.3v-1.4a1.6 1.6 0 0 1 3.2 0v1.4" />
  </Svg>
);

export const IconSliders: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3.4 7.4h16.2M3.4 12h16.2M3.4 16.6h16.2" />
    <circle cx="8.6" cy="7.4" r="2.1" fill="#fff" />
    <circle cx="14.8" cy="12" r="2.1" fill="#fff" />
    <circle cx="7.2" cy="16.6" r="2.1" fill="#fff" />
  </Svg>
);

export const IconPerson: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="7.9" r="3.9" />
    <path d="M4.9 20.4c0-3.9 3.2-6.4 7.1-6.4s7.1 2.5 7.1 6.4" />
  </Svg>
);

export const IconTag: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M11.4 3.4H19a1.6 1.6 0 0 1 1.6 1.6v7.6a1.6 1.6 0 0 1-.5 1.1l-6.4 6.4a1.6 1.6 0 0 1-2.3 0l-7-7a1.6 1.6 0 0 1 0-2.3l6.4-6.4a1.6 1.6 0 0 1 1.1-.5z" />
    <circle cx="16.2" cy="7.8" r="1.5" fill={p.color ?? "currentColor"} stroke="none" />
  </Svg>
);

export const IconExclam: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 5.4v9" strokeWidth={(p.strokeWidth ?? 2) * 1.3} />
    <circle cx="12" cy="18.4" r="1.3" fill={p.color ?? "currentColor"} stroke="none" />
  </Svg>
);

const MAP: Record<IconName, React.FC<P>> = {
  car: IconCar,
  gauge: IconGauge,
  doc: IconDoc,
  scales: IconScales,
  gavel: IconGavel,
  dollar: IconDollar,
  shield: IconShield,
  shieldCheck: IconShieldCheck,
  bolt: IconBolt,
  bell: IconBell,
  chart: IconChart,
  search: IconSearch,
  check: IconCheck,
  warning: IconWarning,
  lock: IconLock,
  sliders: IconSliders,
  person: IconPerson,
  tag: IconTag,
  exclam: IconExclam,
};

export const Icon: React.FC<P & { name: IconName }> = ({ name, ...rest }) => {
  const Cmp = MAP[name];
  return <Cmp {...rest} />;
};
