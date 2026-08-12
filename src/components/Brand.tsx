import React from "react";
import { BRAND } from "../config/copy";
import { C, FW } from "../config/theme";
import { fontFamily } from "../lib/fonts";

/**
 * Ícone da marca: anel hexagonal vazado formado por duas fitas que se dobram
 * (uma cobre o topo e o lado esquerdo, a outra o lado direito e a base), com
 * duas frestas diagonais entre elas e o centro hexagonal aberto.
 *
 * Geometria em viewBox 100 × 115,5 — hexágono regular de pontas em cima/embaixo
 * e lados verticais, como no logo oficial.
 */
export const LogoMark: React.FC<{
  size?: number;
  style?: React.CSSProperties;
  glow?: number;
  /** versão monocromática (ex.: branco sobre o círculo azul do selo) */
  mono?: string;
}> = ({ size = 64, style, glow = 0.55, mono }) => {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");

  /**
   * O anel é (hexágono externo − hexágono interno), cortado em dois pontos
   * opostos por frestas radiais. Cada fita termina numa dobra (faceta mais
   * clara no topo, mais escura na base), que é o que dá o efeito 3D do logo.
   */
  // fita A — do corte de cima, passando pelo topo e descendo toda a esquerda
  const bandA =
    "M73.44 13.54 L50 0 L0 28.87 L0 86.6 L23.44 100.14 L36.94 76.75 L27 71.01 L27 44.46 L50 31.18 L59.94 36.92 Z";
  // fita B — do mesmo corte, descendo a direita e passando pela base
  const bandB =
    "M76.56 15.34 L100 28.87 L100 86.6 L50 115.47 L26.56 101.94 L40.06 78.55 L50 84.29 L73 71.01 L73 44.46 L63.06 38.72 Z";
  // dobras nas pontas das fitas
  const foldA = "M73.44 13.54 L63.04 7.54 L49.54 30.92 L59.94 36.92 Z";
  const foldB = "M26.56 101.94 L36.96 107.94 L50.46 84.55 L40.06 78.55 Z";

  return (
    <svg
      width={size}
      height={size * 1.155}
      viewBox="0 0 100 115.5"
      style={{ display: "block", overflow: "visible", ...style }}
    >
      <defs>
        {/* dobra do topo — faceta mais clara */}
        <linearGradient id={`t-${id}`} x1="50" y1="4" x2="70" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#63ADFF" />
          <stop offset="1" stopColor="#3B8FFF" />
        </linearGradient>
        {/* fita A — topo + esquerda */}
        <linearGradient id={`l-${id}`} x1="56" y1="2" x2="10" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3D93FF" />
          <stop offset="0.55" stopColor="#2A7CF7" />
          <stop offset="1" stopColor="#1B6BEE" />
        </linearGradient>
        {/* fita B — direita + base */}
        <linearGradient id={`r-${id}`} x1="98" y1="22" x2="44" y2="114" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2A80F8" />
          <stop offset="0.6" stopColor="#1560E4" />
          <stop offset="1" stopColor="#0C4ACC" />
        </linearGradient>
        {/* dobra da base — faceta mais escura */}
        <linearGradient id={`b2-${id}`} x1="50" y1="80" x2="28" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1053D6" />
          <stop offset="1" stopColor="#0A3FB8" />
        </linearGradient>
        <filter id={`gl-${id}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {glow > 0 && (
        <path
          d="M50 0 100 28.87v57.73L50 115.47 0 86.6V28.87z"
          fill={C.blue}
          opacity={glow * 0.5}
          filter={`url(#gl-${id})`}
        />
      )}

      <path d={bandA} fill={mono ?? `url(#l-${id})`} opacity={mono ? 0.92 : 1} />
      <path d={bandB} fill={mono ?? `url(#r-${id})`} opacity={mono ? 1 : 1} />
      <path d={foldA} fill={mono ?? `url(#t-${id})`} opacity={mono ? 0.72 : 1} />
      <path d={foldB} fill={mono ?? `url(#b2-${id})`} opacity={mono ? 0.72 : 1} />
    </svg>
  );
};

/** Logo completo: ícone + wordmark "ConsulTech". */
export const Logo: React.FC<{
  size?: number;
  dark?: boolean;
  style?: React.CSSProperties;
  markStyle?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
  gap?: number;
}> = ({ size = 62, dark = false, style, markStyle, wordStyle, gap = 16 }) => (
  <div style={{ display: "flex", alignItems: "center", gap, ...style }}>
    <LogoMark size={size} style={markStyle} glow={dark ? 0.25 : 0.5} />
    <div
      style={{
        fontFamily,
        fontWeight: FW.bold,
        fontSize: size * 0.8,
        letterSpacing: -1.6,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...wordStyle,
      }}
    >
      <span style={{ color: dark ? C.ink : C.white }}>{BRAND.name1}</span>
      <span style={{ color: C.blue }}>{BRAND.name2}</span>
    </div>
  </div>
);

/** Header padrão das telas: só o logo (sem contador de páginas). */
export const SlideHeader: React.FC<{
  dark?: boolean;
  logoStyle?: React.CSSProperties;
  logoSize?: number;
}> = ({ dark = false, logoStyle, logoSize = 70 }) => (
  <div style={{ position: "absolute", left: 56, top: 78, ...logoStyle }}>
    <Logo size={logoSize} dark={dark} />
  </div>
);

/** Mini-logo usado dentro do painel de dashboard. */
export const DashboardLogo: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    <LogoMark size={size} glow={0.18} />
    <div
      style={{
        fontFamily,
        fontWeight: FW.bold,
        fontSize: size * 0.78,
        letterSpacing: -0.6,
        lineHeight: 1,
      }}
    >
      <span style={{ color: C.white }}>{BRAND.name1}</span>
      <span style={{ color: C.blueSoft }}>{BRAND.name2}</span>
    </div>
  </div>
);
