/**
 * CENA 1 — 0:00 a 0:02,5
 * "O futuro do dinheiro é simples."
 * Motion: os cartões entram em profundidade com rotação 3D, se empilham
 * e abrem em leque mostrando as cores da linha. (Ref.: IMG_4434 + 637A3CA6)
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { EASE, idle, impactShake, map, spr, tween, wobble } from "../lib/anim";
import { Backdrop } from "../components/Backdrop";
import { NuCard, CardVariant, NuLogo } from "../components/NuCard";
import { Kicker, MaskLine } from "../components/TextFX";

/**
 * O leque gira em torno de um pivô abaixo da base dos cartões
 * (transformOrigin 50% 132%), então o espalhamento vem da rotação —
 * `x` só corrige o encaixe fino de cada carta.
 */
const FAN: { variant: CardVariant; angle: number; x: number; y: number; z: number }[] = [
  { variant: "night", angle: -25, x: -18, y: 6, z: -70 },
  { variant: "dark", angle: -12.5, x: -8, y: -2, z: -35 },
  { variant: "purple", angle: 0, x: 0, y: -14, z: 0 },
  { variant: "silver", angle: 12.5, x: 8, y: -2, z: -35 },
  { variant: "rose", angle: 25, x: 18, y: 6, z: -70 },
];

const CARD_W = 352;

const IMPACT = 93; // 1,55s — bate junto com o SFX de impacto

export const Scene01Leque: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = impactShake(frame, IMPACT, 16, 7);

  // brilho especular varrendo os cartões logo após o leque abrir
  const shine = tween(frame, 84, 122, { ease: EASE.inOutCubic });
  const flash = Math.max(0, 1 - Math.abs(frame - IMPACT) / 6);

  return (
    <AbsoluteFill>
      <Backdrop parallax={map(tween(frame, 0, 150, { ease: EASE.outSoft }), 30, -30)} />

      {/* clarão do impacto */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 40% at 50% 62%, rgba(199,125,255,${
            flash * 0.5
          }), rgba(0,0,0,0))`,
          mixBlendMode: "screen",
        }}
      />

      {/* ── texto ──────────────────────────────────────────── */}
      <AbsoluteFill
        style={{
          padding: "158px 84px",
          transform: `translate(${shake.x * 0.3}px, ${shake.y * 0.3}px)`,
        }}
      >
        <Kicker delay={12}>01</Kicker>
        <div style={{ height: 34 }} />
        <MaskLine delay={22} size={118}>
          O FUTURO
        </MaskLine>
        <MaskLine delay={32} size={118} color={COLORS.neonHot}>
          DO DINHEIRO
        </MaskLine>
        <MaskLine delay={42} size={118}>
          É SIMPLES.
        </MaskLine>
      </AbsoluteFill>

      {/* ── leque de cartões ───────────────────────────────── */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 360,
          perspective: 1600,
          transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.rot}deg)`,
        }}
      >
        <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
          {FAN.map((card, i) => {
            // 1) entrada em profundidade, 2) abertura do leque
            const enter = spr(frame, 6 + i * 3, "heavy");
            const open = spr(frame, 46 + i * 4, "bouncy");

            const x = map(open, 0, card.x);
            const y = map(open, 0, card.y) + map(1 - enter, 0, 260);
            const z = map(enter, -900, 0) + map(1 - open, 0, card.z);
            const rot = map(open, 0, card.angle) + map(1 - enter, 0, -22);
            const rotY = map(1 - enter, 0, 34) * (i % 2 ? -1 : 1);

            const bump = Math.max(0, 1 - Math.abs(frame - IMPACT) / 12);
            const blur = (1 - enter) * 9;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: -CARD_W / 2,
                  bottom: 0,
                  transformOrigin: "50% 132%",
                  transform: [
                    `translate3d(${x}px, ${y - bump * 26}px, ${z}px)`,
                    `rotateZ(${rot + wobble(frame, i, 0.03, 0.7)}deg)`,
                    `rotateY(${rotY}deg)`,
                    `scale(${map(enter, 0.55, 1)})`,
                  ].join(" "),
                  opacity: enter,
                  filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
                  zIndex: 10 - Math.abs(i - 2),
                }}
              >
                <NuCard
                  variant={card.variant}
                  width={CARD_W}
                  name={i === 2 ? "Gabriela Lima" : null}
                  showContactless={i === 2}
                  shine={i === 2 ? shine : 0}
                  glow={i === 2 ? 0.85 : 0.3}
                />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* piso luminoso sob o leque, ancorando os cartões na cena */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 270,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 760,
            height: 26,
            borderRadius: "50%",
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(224,170,255,0.75), rgba(199,125,255,0))",
            opacity: tween(frame, 58, 92) * (0.75 + idle(frame, 0.08, 0.12)),
            filter: "blur(9px)",
          }}
        />
      </AbsoluteFill>

      {/* assinatura discreta */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 72,
          opacity: tween(frame, 110, 135) * 0.9,
          transform: `translateY(${idle(frame, 0.05, 3)}px)`,
        }}
      >
        <NuLogo size={88} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
