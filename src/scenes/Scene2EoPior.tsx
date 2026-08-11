/**
 * ============================================================================
 *  CENA 2 — 3/8 "E o pior..."
 * ============================================================================
 *  Ampulheta reconstruída em vetor (areia escoa durante a cena) + cards de
 *  alerta entrando em sequência.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE2 } from "../config/copy";
import { Cue, cue } from "../config/sfx";
import { C, FW, TEXT_GLOW_WHITE } from "../config/theme";
import { EASE, float, glowPulse, ip, popIn, prog, spr } from "../lib/anim";
import { fontFamily } from "../lib/fonts";
import { SfxTrack } from "../lib/SfxTrack";
import { SlideHeader } from "../components/Brand";
import { BoltTriangle, GlowBlob, Hourglass, Swoosh } from "../components/Decor";
import { Icon } from "../components/Icons";
import { BadgeCircle, SkeletonLine } from "../components/Primitives";
import { RevealText, SceneShell } from "../components/SceneShell";

// ---------------------------------------------------------------------------
const B = {
  header: 2,
  h1: 4,
  h2: 20,
  hourglass: 38,
  alert1: 58,
  exclam: 66,
  alert2: 96,
  curve: 110,
  alert3: 132,
  alert4: 162,
  bolt: 186,
  pulse: 204,
};

const L = {
  headline: { x: 76, y: 286, size: 170, lh: 1.34, ls: -7 },
  hourglass: { x: 546, y: 796, w: 474 },
  exclam: { x: 622, y: 926, size: 116 },
  alert1: { x: 66, y: 852, w: 396, h: 226, rot: -8, dim: true },
  alert2: { x: 262, y: 1150, w: 520, h: 238, rot: -4, dim: false },
  alert3: { x: 44, y: 1498, w: 412, h: 234, rot: -3, dim: false },
  alert4: { x: 548, y: 1506, w: 468, h: 226, rot: -2, dim: false },
  bolt: { x: 34, y: 1750, size: 122 },
};

export const scene2Cues: Cue[] = [
  cue(B.h1 - 3, "whoosh", 0.9),
  cue(B.h2 - 4, "reverse", 0.85),
  cue(B.h2, "impact", 1),
  cue(B.h2 + 2, "sub", 0.8),
  cue(B.hourglass, "riser", 0.55),
  cue(B.alert1, "glitch", 0.7),
  cue(B.exclam, "pop", 1.1),
  cue(B.alert2 - 3, "swipe", 0.85),
  cue(B.alert2, "notify", 0.9, 0.86),
  cue(B.curve, "whoosh", 0.6, 1.2),
  cue(B.alert3 - 3, "swipe", 0.8),
  cue(B.alert3, "notify", 0.85, 0.8),
  cue(B.alert4 - 3, "swipe", 0.8),
  cue(B.alert4, "notify", 0.85, 0.74),
  cue(B.bolt, "pop", 0.9),
  cue(B.pulse, "bass", 0.55),
];

// ---------------------------------------------------------------------------
const AlertCard: React.FC<{
  title: string;
  subtitle: string;
  w: number;
  h: number;
  dim?: boolean;
  glow?: number;
}> = ({ title, subtitle, w, h, dim = false, glow = 1 }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 22,
      padding: "26px 30px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      background:
        "linear-gradient(155deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 55%, rgba(255,255,255,0.015) 100%)",
      border: `1.6px solid ${dim ? "rgba(120,150,220,0.16)" : "rgba(140,175,255,0.30)"}`,
      boxShadow: `0 22px 56px rgba(0,0,0,0.55), 0 0 ${34 * glow}px rgba(27,92,255,${0.22 * glow})`,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      opacity: dim ? 0.5 : 1,
      overflow: "hidden",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Icon name="warning" size={38} color={C.red} strokeWidth={2.2} />
      <span
        style={{
          fontFamily,
          fontWeight: FW.semibold,
          fontSize: 31,
          color: C.red,
          letterSpacing: -0.4,
        }}
      >
        {title}
      </span>
    </div>
    <span
      style={{
        fontFamily,
        fontWeight: FW.regular,
        fontSize: 30,
        color: "rgba(232,238,250,0.92)",
        letterSpacing: -0.3,
        lineHeight: 1.15,
      }}
    >
      {subtitle}
    </span>
    <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: "auto" }}>
      <SkeletonLine width="86%" height={12} color={C.skeletonDim} />
      <SkeletonLine width="58%" height={12} color={C.skeletonDim} />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
export const Scene2EoPior: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /** entrada dos alertas: vêm de baixo/lado com rotação e desfoque */
  const alertIn = (delay: number, rot: number, dx: number, phase: number) => {
    const p = spr(frame, fps, delay, "snappy");
    const inv = 1 - p;
    return {
      opacity: ip(frame, [delay, delay + 8], [0, 1], EASE.out),
      transform: `translate(${inv * dx}px, ${inv * 70 + float(frame - delay, 5, 160, phase)}px) rotate(${rot * p + inv * 10}deg) scale(${0.88 + 0.12 * p})`,
      filter: inv > 0.02 ? `blur(${inv * 8}px)` : undefined,
    };
  };

  // areia escoa do início ao fim da cena
  const sandFall = ip(frame, [B.hourglass, duration + 10], [0.06, 0.92], (n) => n);

  return (
    <SceneShell
      duration={duration}
      enter="riseBlur"
      exit="punch"
      cameraZoom={0.045}
      cameraY={-14}
      background={
        <AbsoluteFill style={{ background: C.bgDark }}>
          <GlowBlob
            size={1120}
            color="rgba(27,92,255,0.26)"
            style={{ position: "absolute", left: 380, top: 700 }}
          />
          <GlowBlob
            size={620}
            color="rgba(27,92,255,0.14)"
            style={{ position: "absolute", left: -160, top: 1300 }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(110% 80% at 60% 55%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.8) 100%)",
            }}
          />
        </AbsoluteFill>
      }
    >
      <SfxTrack cues={scene2Cues} />

      <div style={{ opacity: ip(frame, [B.header, B.header + 12], [0, 1]) }}>
        <SlideHeader badge={SCENE2.badge} />
      </div>

      {/* ampulheta */}
      <div
        style={{
          position: "absolute",
          left: L.hourglass.x,
          top: L.hourglass.y,
          zIndex: 1,
          opacity: ip(frame, [B.hourglass, B.hourglass + 18], [0, 1]),
          transform: `scale(${0.9 + 0.1 * spr(frame, fps, B.hourglass, "soft")}) translateY(${float(frame, 7, 240)}px) rotate(${ip(frame, [B.hourglass, duration], [-2.5, 1.5], EASE.inOut)}deg)`,
          transformOrigin: "50% 40%",
        }}
      >
        <Hourglass width={L.hourglass.w} fall={sandFall} glow={glowPulse(frame, 0.7, 1.1, 130)} />
      </div>

      {/* curva azul de fundo */}
      <div style={{ position: "absolute", left: -40, top: 880, zIndex: 0, opacity: 0.9 }}>
        <Swoosh
          width={1100}
          height={1100}
          thickness={5}
          color={C.blueSoft}
          progress={prog(frame, B.curve, 40)}
          flip
          opacity={0.75}
        />
      </div>

      {/* headline */}
      <div
        style={{
          position: "absolute",
          left: L.headline.x,
          top: L.headline.y,
          zIndex: 4,
          fontFamily,
          fontWeight: FW.bold,
          fontSize: L.headline.size,
          lineHeight: L.headline.lh,
          letterSpacing: L.headline.ls,
        }}
      >
        {SCENE2.headline.map((w, i) => {
          const delay = [B.h1, B.h2][i];
          const isBlue = w.color === "blue";
          const emph = glowPulse(frame - delay, 0.7, 1.05, 120, i * 1.4);
          // "pior..." recebe um leve tremor de impacto
          const shake =
            i === 1 && frame > B.h2 && frame < B.h2 + 14
              ? Math.sin((frame - B.h2) * 2.2) * (14 - (frame - B.h2)) * 0.5
              : 0;
          return (
            <RevealText key={w.text} delay={delay} frame={frame} fps={fps} rise={0.5} duration={16}>
              <div
                style={{
                  color: isBlue ? C.blue : C.white,
                  textShadow: isBlue
                    ? `0 0 ${58 * emph}px rgba(27,92,255,${0.26 * emph})`
                    : TEXT_GLOW_WHITE,
                  transform: `translateX(${shake}px)`,
                  paddingBottom: 6,
                }}
              >
                {w.text}
              </div>
            </RevealText>
          );
        })}
      </div>

      {/* badge "!" */}
      <div
        style={{
          position: "absolute",
          left: L.exclam.x,
          top: L.exclam.y,
          zIndex: 5,
          ...popIn(frame, fps, B.exclam, 0.5, "bouncy"),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.exclam, 8, 130)}px)` }}>
          <BadgeCircle
            icon="exclam"
            size={L.exclam.size}
            iconSize={L.exclam.size * 0.42}
            glow={glowPulse(frame, 0.8, 1.3, 70)}
          />
        </div>
      </div>

      {/* alertas */}
      <div
        style={{
          position: "absolute",
          left: L.alert1.x,
          top: L.alert1.y,
          zIndex: 3,
          ...alertIn(B.alert1, L.alert1.rot, -60, 0.3),
        }}
      >
        <AlertCard
          title={SCENE2.alerts[0].title}
          subtitle={SCENE2.alerts[0].subtitle}
          w={L.alert1.w}
          h={L.alert1.h}
          dim
          glow={0.4}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: L.alert2.x,
          top: L.alert2.y,
          zIndex: 6,
          ...alertIn(B.alert2, L.alert2.rot, -90, 1.2),
        }}
      >
        <AlertCard
          title={SCENE2.alerts[1].title}
          subtitle={SCENE2.alerts[1].subtitle}
          w={L.alert2.w}
          h={L.alert2.h}
          glow={glowPulse(frame - B.alert2, 0.6, 1.1, 90)}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: L.alert3.x,
          top: L.alert3.y,
          zIndex: 5,
          ...alertIn(B.alert3, L.alert3.rot, -70, 2.1),
        }}
      >
        <AlertCard
          title={SCENE2.alerts[2].title}
          subtitle={SCENE2.alerts[2].subtitle}
          w={L.alert3.w}
          h={L.alert3.h}
          glow={0.8}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: L.alert4.x,
          top: L.alert4.y,
          zIndex: 5,
          ...alertIn(B.alert4, L.alert4.rot, 80, 3.0),
        }}
      >
        <AlertCard
          title={SCENE2.alerts[3].title}
          subtitle={SCENE2.alerts[3].subtitle}
          w={L.alert4.w}
          h={L.alert4.h}
          glow={0.8}
        />
      </div>

      {/* badge triangular com raio */}
      <div
        style={{
          position: "absolute",
          left: L.bolt.x,
          top: L.bolt.y,
          zIndex: 6,
          ...popIn(frame, fps, B.bolt, 0.55, "bouncy"),
        }}
      >
        <BoltTriangle size={L.bolt.size} />
      </div>

      {/* pulso final vermelho-azulado de tensão */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(70% 45% at 45% 70%, rgba(255,77,77,0.14) 0%, rgba(255,77,77,0) 70%)",
          opacity: ip(frame, [B.pulse, B.pulse + 12, B.pulse + 40], [0, 1, 0]),
          mixBlendMode: "screen",
          zIndex: 7,
        }}
      />
    </SceneShell>
  );
};
