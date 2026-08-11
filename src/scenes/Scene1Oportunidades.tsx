/**
 * ============================================================================
 *  CENA 1 — 2/8 "Quantas oportunidades você perdeu?"
 * ============================================================================
 *  Ajuste `B` (beats, em frames) para mudar o timing interno da cena e
 *  `L` (layout) para mudar posições. A duração total vem de config/timeline.ts.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE1 } from "../config/copy";
import { Cue, cue } from "../config/sfx";
import { C, FW, TEXT_GLOW_WHITE } from "../config/theme";
import { EASE, float, glowPulse, ip, popIn, prog, spr, typewriter } from "../lib/anim";
import { fontFamily } from "../lib/fonts";
import { SfxTrack } from "../lib/SfxTrack";
import { SlideHeader } from "../components/Brand";
import { BureauLogo, BureauName } from "../components/Bureaus";
import { Asterisk, ClockOutline, CurvedArrow, GlowBlob } from "../components/Decor";
import { Chip, GlassCard, SearchField, SkeletonLine } from "../components/Primitives";
import { RevealText, SceneShell } from "../components/SceneShell";

// ---------------------------------------------------------------------------
// BEATS (frames @30fps) — ancorados nos inícios de frase da narração
// ---------------------------------------------------------------------------
const B = {
  header: 2,
  h1: 4,
  h2: 15,
  h3: 27,
  h4: 38,
  clock: 58,
  spc: 80,
  avatar: 93,
  chipFast: 106,
  search: 118,
  typing: 132,
  chipTrust: 176,
  serasa: 190,
  squares: 205,
  boavista: 220,
  dots: 242,
  receita: 280,
  chipAlert: 302,
  arrow: 352,
  asterisk: 408,
  shine: 470,
};

// ---------------------------------------------------------------------------
// LAYOUT (px em 1080x1920)
// ---------------------------------------------------------------------------
const L = {
  headline: { x: 78, y: 262, size: 108, lh: 1.16, ls: -4 },
  clock: { x: 772, y: 566, size: 428 },
  spc: { x: 92, y: 786, w: 342, h: 208, rot: -3.5 },
  avatar: { x: 468, y: 866, w: 300, h: 152, rot: 1.6 },
  chipFast: { x: 34, y: 1036, rot: -1.2 },
  search: { x: 336, y: 1044, w: 448 },
  chipTrust: { x: 812, y: 1024, rot: 2 },
  serasa: { x: 50, y: 1148, w: 352, h: 238, rot: -2 },
  squares: { x: 298, y: 1158, w: 288, h: 208, rot: 1.2 },
  boavista: { x: 702, y: 1152, w: 326, h: 228, rot: -1 },
  dots: { x: 518, y: 1332, w: 212, h: 136, rot: 2.2 },
  chipAlert: { x: 476, y: 1488, rot: -1.4 },
  receita: { x: 690, y: 1452, w: 352, h: 242, rot: 1.6 },
  arrow: { x: 244, y: 1414, w: 264, h: 208 },
  asterisk: { x: -58, y: 1686, size: 336 },
};

export const scene1Cues: Cue[] = [
  cue(B.h1 - 3, "whoosh", 0.9),
  cue(B.h2 - 3, "whoosh", 0.85, 1.12),
  cue(B.h3 - 3, "whoosh", 0.8, 1.05),
  cue(B.h4 - 3, "impact", 0.85),
  cue(B.h4 + 1, "sub", 0.55),
  cue(B.clock - 12, "reverse", 0.8),
  cue(B.spc, "pop"),
  cue(B.avatar, "popSoft"),
  cue(B.chipFast, "pop", 0.9, 1.08),
  cue(B.search - 4, "swipe", 0.8),
  cue(B.typing, "click"),
  cue(B.typing + 8, "tick", 0.8),
  cue(B.typing + 16, "tick", 0.7),
  cue(B.chipTrust, "popSoft", 1, 1.06),
  cue(B.serasa, "pop", 0.95),
  cue(B.squares, "popSoft"),
  cue(B.boavista, "pop", 0.95, 1.05),
  cue(B.dots, "popSoft", 0.9),
  cue(B.receita, "pop", 0.95, 0.98),
  cue(B.chipAlert, "notify"),
  cue(B.arrow, "swipe", 0.75, 0.9),
  cue(B.asterisk, "glitch", 0.9),
  cue(B.shine, "sparkle", 0.8),
];

// ---------------------------------------------------------------------------
// cards auxiliares
// ---------------------------------------------------------------------------
const BureauCard: React.FC<{
  name: BureauName;
  w: number;
  h: number;
  variant?: "white" | "glass";
  lines?: number;
  bar?: boolean;
  logoScale?: number;
}> = ({ name, w, h, variant = "white", lines = 3, bar = false, logoScale = 1.35 }) => {
  const white = variant === "white";
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 22,
        padding: "26px 28px",
        background: white
          ? "linear-gradient(155deg, rgba(255,255,255,0.97) 0%, rgba(240,243,249,0.92) 100%)"
          : "linear-gradient(155deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
        border: `1.5px solid ${white ? "rgba(255,255,255,0.5)" : C.glassStroke}`,
        boxShadow: white
          ? "0 26px 60px rgba(0,0,0,0.45)"
          : "0 22px 54px rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        overflow: "hidden",
      }}
    >
      <BureauLogo name={name} scale={logoScale} />
      <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 4 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === 0 ? "88%" : i === lines - 1 ? "54%" : "72%"}
            height={13}
            color={white ? "rgba(120,132,150,0.28)" : C.skeletonDim}
          />
        ))}
        {bar && (
          <SkeletonLine width="46%" height={15} color={C.blue} style={{ marginTop: 4 }} />
        )}
      </div>
    </div>
  );
};

const AvatarCard: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <GlassCard style={{ width: w, height: h, padding: "26px 28px" }} radius={20}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.22)",
          flexShrink: 0,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <SkeletonLine width="72%" height={12} />
        <SkeletonLine width="48%" height={12} color={C.skeletonDim} />
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 22 }}>
      <SkeletonLine width="92%" height={11} color={C.skeletonDim} />
      <SkeletonLine width="64%" height={11} color={C.skeletonDim} />
    </div>
  </GlassCard>
);

const SquaresCard: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <GlassCard style={{ width: w, height: h, padding: "26px 26px" }} radius={20}>
    <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            width: 54,
            height: 34,
            borderRadius: 9,
            background: "rgba(255,255,255,0.85)",
          }}
        />
      ))}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SkeletonLine width="86%" height={12} />
      <SkeletonLine width="68%" height={12} color={C.skeletonDim} />
      <SkeletonLine width="44%" height={12} color={C.skeletonDim} />
    </div>
  </GlassCard>
);

const DotsCard: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <GlassCard style={{ width: w, height: h, padding: "24px 24px" }} radius={18} strong>
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.75)",
            }}
          />
          <SkeletonLine width={i === 2 ? 70 : 118} height={10} />
        </div>
      ))}
    </div>
  </GlassCard>
);

// ---------------------------------------------------------------------------
// cena
// ---------------------------------------------------------------------------
export const Scene1Oportunidades: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headline = SCENE1.headline;
  const typed = typewriter(SCENE1.search, frame, B.typing, 0.82);

  /** helper: entrada de card flutuante com mola + flutuação contínua */
  const drop = (delay: number, opts: { rot?: number; y?: number; x?: number; phase?: number } = {}) => {
    const { rot = 0, y = 72, x = 0, phase = 0 } = opts;
    const p = spr(frame, fps, delay, "snappy");
    const inv = 1 - p;
    const idle = float(frame - delay, 6, 150, phase);
    return {
      opacity: ip(frame, [delay, delay + 7], [0, 1], EASE.out),
      transform: `translate(${inv * x}px, ${inv * y + idle}px) rotate(${rot * p + inv * (rot > 0 ? 6 : -6)}deg) scale(${0.9 + 0.1 * p})`,
      filter: inv > 0.02 ? `blur(${inv * 7}px)` : undefined,
    };
  };

  return (
    <SceneShell
      duration={duration}
      enter="none"
      exit="zoom"
      cameraZoom={0.032}
      cameraY={-10}
      background={
        <AbsoluteFill style={{ background: C.bgDark }}>
          <GlowBlob
            size={1000}
            color="rgba(27,92,255,0.20)"
            style={{ position: "absolute", left: 380, top: 260, opacity: 0.9 }}
          />
          <GlowBlob
            size={760}
            color="rgba(27,92,255,0.16)"
            style={{ position: "absolute", left: -180, top: 1180 }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)",
            }}
          />
        </AbsoluteFill>
      }
    >
      <SfxTrack cues={scene1Cues} />

      {/* header */}
      <div style={{ opacity: ip(frame, [B.header, B.header + 12], [0, 1]) }}>
        <SlideHeader badge={SCENE1.badge} />
      </div>

      {/* relógio */}
      <div
        style={{
          position: "absolute",
          left: L.clock.x,
          top: L.clock.y,
          opacity: ip(frame, [B.clock, B.clock + 14], [0, 0.95]),
          transform: `scale(${0.86 + 0.14 * spr(frame, fps, B.clock, "soft")}) translateY(${float(frame, 8, 220)}px)`,
        }}
      >
        <ClockOutline
          size={L.clock.size}
          progress={prog(frame, B.clock, 44)}
          handAngle={ip(frame, [B.clock, duration], [0, 168], (n) => n)}
        />
      </div>

      {/* headline — cada palavra é uma camada */}
      <div
        style={{
          position: "absolute",
          left: L.headline.x,
          top: L.headline.y,
          fontFamily,
          fontWeight: FW.bold,
          fontSize: L.headline.size,
          lineHeight: L.headline.lh,
          letterSpacing: L.headline.ls,
        }}
      >
        {headline.map((w, i) => {
          const delay = [B.h1, B.h2, B.h3, B.h4][i];
          const isBlue = w.color === "blue";
          const emph = glowPulse(frame - delay, 0.75, 1, 150, i);
          return (
            <RevealText key={w.text} delay={delay} frame={frame} fps={fps} rise={0.55}>
              <div
                style={{
                  color: isBlue ? C.blue : C.white,
                  textShadow: isBlue
                    ? `0 0 ${44 * emph}px rgba(27,92,255,${0.34 * emph})`
                    : TEXT_GLOW_WHITE,
                  paddingBottom: 4,
                }}
              >
                {w.text}
              </div>
            </RevealText>
          );
        })}
      </div>

      {/* cards de bureaus e elementos flutuantes */}
      <div style={{ position: "absolute", left: L.spc.x, top: L.spc.y, zIndex: 3, ...drop(B.spc, { rot: L.spc.rot, y: 80, x: -40, phase: 0.4 }) }}>
        <BureauCard name="spc" w={L.spc.w} h={L.spc.h} variant="white" lines={3} />
      </div>

      <div style={{ position: "absolute", left: L.avatar.x, top: L.avatar.y, zIndex: 2, ...drop(B.avatar, { rot: L.avatar.rot, y: 60, x: 30, phase: 1.1 }) }}>
        <AvatarCard w={L.avatar.w} h={L.avatar.h} />
      </div>

      <div style={{ position: "absolute", left: L.chipFast.x, top: L.chipFast.y, zIndex: 5, ...drop(B.chipFast, { rot: L.chipFast.rot, y: 40, x: -60, phase: 2.0 }) }}>
        <Chip label={SCENE1.chips[0].label} icon={SCENE1.chips[0].icon} variant="dark" fontSize={24} />
      </div>

      {/* campo de busca com digitação */}
      <div
        style={{
          position: "absolute",
          left: L.search.x,
          top: L.search.y,
          zIndex: 6,
          ...popIn(frame, fps, B.search, 0.8),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.search, 5, 170, 0.7)}px)` }}>
          <SearchField
            text={typed.visible}
            variant="light"
            width={L.search.w}
            fontSize={31}
            caret={frame > B.typing && !typed.done}
          />
        </div>
      </div>

      <div style={{ position: "absolute", left: L.chipTrust.x, top: L.chipTrust.y, zIndex: 5, ...drop(B.chipTrust, { rot: L.chipTrust.rot, y: 40, x: 60, phase: 3.1 }) }}>
        <Chip
          label={"Dados\nconfiáveis"}
          icon="shield"
          variant="glass"
          fontSize={25}
          style={{ width: 224 }}
        />
      </div>

      <div style={{ position: "absolute", left: L.serasa.x, top: L.serasa.y, zIndex: 3, ...drop(B.serasa, { rot: L.serasa.rot, y: 84, x: -50, phase: 0.9 }) }}>
        <BureauCard name="serasa" w={L.serasa.w} h={L.serasa.h} variant="white" lines={3} bar />
      </div>

      <div style={{ position: "absolute", left: L.squares.x, top: L.squares.y, zIndex: 2, ...drop(B.squares, { rot: L.squares.rot, y: 66, phase: 1.7 }) }}>
        <SquaresCard w={L.squares.w} h={L.squares.h} />
      </div>

      <div style={{ position: "absolute", left: L.boavista.x, top: L.boavista.y, zIndex: 3, ...drop(B.boavista, { rot: L.boavista.rot, y: 78, x: 46, phase: 2.4 }) }}>
        <BureauCard name="boavista" w={L.boavista.w} h={L.boavista.h} variant="white" lines={3} logoScale={1.15} />
      </div>

      <div style={{ position: "absolute", left: L.dots.x, top: L.dots.y, zIndex: 2, ...drop(B.dots, { rot: L.dots.rot, y: 54, phase: 3.6 }) }}>
        <DotsCard w={L.dots.w} h={L.dots.h} />
      </div>

      <div style={{ position: "absolute", left: L.receita.x, top: L.receita.y, zIndex: 3, ...drop(B.receita, { rot: L.receita.rot, y: 88, x: 52, phase: 1.3 }) }}>
        <BureauCard name="receita" w={L.receita.w} h={L.receita.h} variant="white" lines={4} logoScale={1.1} />
      </div>

      <div style={{ position: "absolute", left: L.chipAlert.x, top: L.chipAlert.y, zIndex: 5, ...drop(B.chipAlert, { rot: L.chipAlert.rot, y: 40, phase: 4.2 }) }}>
        <Chip label={SCENE1.chips[2].label} icon={SCENE1.chips[2].icon} variant="dark" fontSize={24} />
      </div>

      {/* seta curva */}
      <div style={{ position: "absolute", left: L.arrow.x, top: L.arrow.y, zIndex: 2 }}>
        <CurvedArrow
          width={L.arrow.w}
          height={L.arrow.h}
          variant="upRight"
          progress={prog(frame, B.arrow, 26)}
          thickness={7}
        />
      </div>

      {/* asterisco */}
      <div
        style={{
          position: "absolute",
          left: L.asterisk.x,
          top: L.asterisk.y,
          transform: `rotate(${ip(frame, [B.asterisk, B.asterisk + 40], [-40, 0], EASE.out) + frame * 0.05}deg) scale(${0.6 + 0.4 * spr(frame, fps, B.asterisk, "bouncy")})`,
          opacity: ip(frame, [B.asterisk, B.asterisk + 10], [0, 1]),
        }}
      >
        <Asterisk size={L.asterisk.size} color={C.blue} />
      </div>

      {/* brilho final de destaque */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 40% at 50% 34%, rgba(27,92,255,0.22) 0%, rgba(27,92,255,0) 70%)",
          opacity: ip(frame, [B.shine, B.shine + 10, B.shine + 34], [0, 1, 0]),
          mixBlendMode: "screen",
        }}
      />
    </SceneShell>
  );
};
