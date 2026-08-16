/**
 * Atmosfera de fundo: gradiente base + ondas roxas com parallax,
 * light leak, vinheta e grão. É a camada que dá acabamento de
 * finalização e tira o aspecto de render "limpo demais".
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { idle, wobble } from "../lib/anim";

export const Grain: React.FC<{ opacity?: number; scale?: number }> = ({
  opacity = 0.11,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  // reposiciona o tile a cada frame para o grão "ferver" como em filme
  const step = 37;
  const x = (frame * step) % 512;
  const y = (frame * step * 1.7) % 512;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile("img/grain.png")})`,
        backgroundSize: `${512 * scale}px ${512 * scale}px`,
        backgroundPosition: `${-x}px ${-y}px`,
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

export const Vignette: React.FC<{ opacity?: number }> = ({ opacity = 0.85 }) => (
  <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
    <Img
      src={staticFile("img/vignette.png")}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </AbsoluteFill>
);

export const LightLeak: React.FC<{ opacity?: number; drift?: number }> = ({
  opacity = 0.3,
  drift = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "screen",
        pointerEvents: "none",
        transform: `translate(${idle(frame, 0.012, 26) * drift}px, ${
          idle(frame, 0.009, 18) * drift
        }px) scale(1.15)`,
      }}
    >
      <Img
        src={staticFile("img/light-leak.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};

/** Partículas de poeira em suspensão — profundidade barata e convincente. */
export const DustField: React.FC<{ count?: number; speed?: number; opacity?: number }> = ({
  count = 34,
  speed = 1,
  opacity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const dots = React.useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => ({
        x: ((i * 61.7) % 100) + wobble(0, i, 0, 0),
        y: (i * 37.3) % 100,
        size: 1.6 + ((i * 13) % 5),
        depth: 0.3 + ((i * 7) % 10) / 14,
        seed: i,
      })),
    [count],
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {dots.map((d, i) => {
        const drift = wobble(frame, d.seed, 0.014 * speed, 22 * d.depth);
        const rise = ((d.y - frame * 0.035 * speed * d.depth) % 110 + 110) % 110;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: `${rise - 5}%`,
              width: d.size * d.depth * 2.4,
              height: d.size * d.depth * 2.4,
              borderRadius: "50%",
              background: `rgba(224,170,255,${0.25 + d.depth * 0.5})`,
              transform: `translateX(${drift}px)`,
              filter: `blur(${(1 - d.depth) * 2.2}px)`,
              boxShadow: `0 0 ${d.size * 3}px rgba(199,125,255,0.5)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Backdrop: React.FC<{
  /** Deslocamento de parallax do plano de fundo. */
  parallax?: number;
  zoom?: number;
  tint?: string;
  showDust?: boolean;
  leak?: number;
  children?: React.ReactNode;
}> = ({ parallax = 0, zoom = 1, tint, showDust = true, leak = 0.28, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep, overflow: "hidden" }}>
      {/* ondas roxas — respiram devagar e recebem o parallax da cena */}
      <AbsoluteFill
        style={{
          transform: `translateY(${parallax}px) scale(${zoom * 1.08 + idle(frame, 0.01, 0.012)})`,
        }}
      >
        <Img
          src={staticFile("img/caustic-bg.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
        />
      </AbsoluteFill>

      {/* gradiente de profundidade */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(90% 60% at 50% 42%, rgba(88,20,150,0.55) 0%, rgba(12,0,36,0.2) 55%, ${COLORS.bgDeep} 100%)`,
        }}
      />
      {tint ? <AbsoluteFill style={{ background: tint }} /> : null}

      <LightLeak opacity={leak} />
      {showDust ? <DustField /> : null}

      {children}

      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
