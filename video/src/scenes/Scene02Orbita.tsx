/**
 * CENA 2 — 0:02,5 a 0:05
 * "Uma conta feita para dar mais controle a você."
 * Motion: o cartão central sobe do pódio e os elementos (moeda, robô,
 * escudo, Pix) orbitam ao redor. (Ref.: CE32367F)
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { EASE, idle, map, spr, tween, wobble } from "../lib/anim";
import { Backdrop } from "../components/Backdrop";
import { NuCard } from "../components/NuCard";
import { MaskLine } from "../components/TextFX";
import { NeonPodium, NeonRing } from "../components/Widgets";
import { BotIcon, CoinIcon, PixIcon, ShieldIcon } from "../components/Icons";

const CENTER_X = 540;
const CENTER_Y = 1075;

/** Satélites em órbita: fase inicial, raio e achatamento da elipse. */
const SATELLITES = [
  { Icon: CoinIcon, phase: 0, radius: 385, squash: 0.3, size: 128, delay: 52 },
  { Icon: BotIcon, phase: Math.PI, radius: 385, squash: 0.3, size: 128, delay: 60 },
  { Icon: ShieldIcon, phase: Math.PI * 0.55, radius: 300, squash: 0.24, size: 96, delay: 72 },
  { Icon: PixIcon, phase: Math.PI * 1.5, radius: 300, squash: 0.24, size: 96, delay: 80 },
];

export const Scene02Orbita: React.FC = () => {
  const frame = useCurrentFrame();

  const rise = spr(frame, 22, "heavy");
  const podium = spr(frame, 10, "heavy");
  const spin = frame * 0.028; // velocidade da órbita
  const shine = tween(frame, 74, 118, { ease: EASE.inOutCubic });

  return (
    <AbsoluteFill>
      <Backdrop parallax={map(tween(frame, 0, 150, { ease: EASE.outSoft }), -20, 20)} leak={0.34} />

      {/* halo por trás do cartão */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(34% 22% at 50% ${(CENTER_Y / 1920) * 100}%, rgba(170,75,233,${
            0.5 * rise
          }), rgba(0,0,0,0))`,
          mixBlendMode: "screen",
        }}
      />

      {/* ── texto ──────────────────────────────────────────── */}
      <AbsoluteFill style={{ padding: "150px 84px" }}>
        <MaskLine delay={14} size={78}>
          UMA CONTA FEITA
        </MaskLine>
        <MaskLine delay={24} size={78}>
          PARA DAR <span style={{ color: COLORS.neonHot }}>MAIS</span>
        </MaskLine>
        <MaskLine delay={34} size={78}>
          CONTROLE A VOCÊ.
        </MaskLine>
      </AbsoluteFill>

      {/* ── órbitas (atrás do cartão) ──────────────────────── */}
      <AbsoluteFill style={{ perspective: 1400 }}>
        <div
          style={{
            position: "absolute",
            left: CENTER_X,
            top: CENTER_Y + 120,
            transformStyle: "preserve-3d",
            opacity: tween(frame, 30, 62),
          }}
        >
          <NeonRing size={790} rotate={spin * 40} opacity={0.45} thickness={2.5} />
          <NeonRing size={620} tiltDeg={78} rotate={-spin * 30} opacity={0.3} thickness={2} />
        </div>
      </AbsoluteFill>

      {/* satélites atrás */}
      {SATELLITES.map(({ Icon, phase, radius, squash, size, delay }, i) => {
        const a = spin + phase;
        const behind = Math.cos(a) < 0;
        if (!behind) return null;
        return (
          <Satellite
            key={`b${i}`}
            Icon={Icon}
            angle={a}
            radius={radius}
            squash={squash}
            size={size}
            delay={delay}
            frame={frame}
            seed={i}
          />
        );
      })}

      {/* ── pódio + cartão ─────────────────────────────────── */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: CENTER_Y + 218 }}>
          <NeonPodium width={520} at={10} />
        </div>
        <div
          style={{
            position: "absolute",
            top: CENTER_Y - 300,
            transform: `translateY(${map(rise, 190, 0) + idle(frame, 0.045, 9)}px) scale(${map(
              rise,
              0.78,
              1,
            )}) rotateZ(${wobble(frame, 2, 0.03, 1.1)}deg)`,
            opacity: rise,
            filter: podium < 0.9 ? `blur(${(1 - podium) * 5}px)` : undefined,
          }}
        >
          <NuCard variant="dark" width={382} name={null} shine={shine} glow={1} />
        </div>
      </AbsoluteFill>

      {/* satélites à frente */}
      {SATELLITES.map(({ Icon, phase, radius, squash, size, delay }, i) => {
        const a = spin + phase;
        if (Math.cos(a) < 0) return null;
        return (
          <Satellite
            key={`f${i}`}
            Icon={Icon}
            angle={a}
            radius={radius}
            squash={squash}
            size={size}
            delay={delay}
            frame={frame}
            seed={i}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Satellite: React.FC<{
  Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>;
  angle: number;
  radius: number;
  squash: number;
  size: number;
  delay: number;
  frame: number;
  seed: number;
}> = ({ Icon, angle, radius, squash, size, delay, frame, seed }) => {
  const pop = spr(frame, delay, "bouncy");
  const x = CENTER_X + Math.sin(angle) * radius;
  const y = CENTER_Y + 120 + Math.cos(angle) * radius * squash;
  // quem está à frente aparece maior — dá a sensação de profundidade
  const depth = 0.82 + Math.cos(angle) * 0.18;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + idle(frame + seed * 20, 0.06, 7),
        transform: `translate(-50%,-50%) scale(${pop * depth})`,
        opacity: pop * (0.55 + depth * 0.45),
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.3,
          background: "linear-gradient(150deg, rgba(150,70,220,0.92), rgba(70,20,130,0.85))",
          border: "2px solid rgba(224,170,255,0.75)",
          display: "grid",
          placeItems: "center",
          boxShadow: `0 0 ${size * 0.4}px rgba(199,125,255,0.55), inset 0 2px 0 rgba(255,255,255,0.3)`,
          transform: `rotate(${wobble(frame, seed, 0.04, 4)}deg)`,
        }}
      >
        <Icon size={size * 0.5} color={COLORS.white} strokeWidth={1.9} />
      </div>
    </div>
  );
};
