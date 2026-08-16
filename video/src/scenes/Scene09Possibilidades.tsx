/**
 * CENA 9 — 0:20 a 0:22,5
 * "Menos complicação. Mais possibilidades."
 * Motion: MENOS e MAIS trocam de posição cruzando na tela; MAIS ganha
 * destaque roxo e a peça fecha na assinatura da marca.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { EASE, idle, impactShake, map, spr, tween, wobble } from "../lib/anim";
import { Backdrop } from "../components/Backdrop";
import { NuCard, NuLogo } from "../components/NuCard";
import { MaskLine } from "../components/TextFX";
import { DISPLAY } from "../lib/fonts";

const SWAP_START = 20;
const SWAP_END = 50;
const IMPACT = 48;
const LOGO_AT = 96; // dá ~0,9 s de assinatura no fim

/** Posições X das duas palavras que trocam de lugar. */
const SLOT_LEFT = 96;
const SLOT_RIGHT = 604;

export const Scene09Possibilidades: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = impactShake(frame, IMPACT, 18, 10);

  // 0 → posições iniciais, 1 → posições trocadas
  const swap = interpolate(frame, [SWAP_START, SWAP_END], [0, 1], {
    easing: EASE.outExpo,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // as palavras cruzam por caminhos verticais opostos, sem se sobrepor
  const arc = Math.sin(swap * Math.PI);

  const menosX = map(swap, SLOT_LEFT, SLOT_RIGHT);
  const maisX = map(swap, SLOT_RIGHT, SLOT_LEFT);
  const menosY = -arc * 96;
  const maisY = arc * 96;

  const maisScale = map(swap, 0.82, 1.16);
  const menosScale = map(swap, 1.05, 0.84);
  const flash = Math.max(0, 1 - Math.abs(frame - IMPACT) / 8);

  // no fecho, todo o bloco de texto recua e entra a assinatura
  // o texto some antes do logo entrar, sem sobreposição turva
  const outro = tween(frame, LOGO_AT - 26, LOGO_AT - 4, { ease: EASE.inOutCubic });
  const logo = spr(frame, LOGO_AT, "bouncy");

  return (
    <AbsoluteFill>
      <Backdrop parallax={map(tween(frame, 0, 150), -22, 22)} leak={0.34} />

      <AbsoluteFill
        style={{
          background: `radial-gradient(64% 38% at 50% 40%, rgba(224,170,255,${
            flash * 0.45
          }), rgba(0,0,0,0))`,
          mixBlendMode: "screen",
        }}
      />

      {/* ── palavras que trocam de posição ─────────────────── */}
      <AbsoluteFill
        style={{
          transform: `translate(${shake.x}px, ${shake.y}px) scale(${map(outro, 1, 0.93)})`,
          opacity: 1 - outro,
        }}
      >
        {/* MENOS */}
        <div
          style={{
            position: "absolute",
            left: menosX,
            top: 470 + menosY,
            transform: `scale(${menosScale}) rotate(${wobble(frame, 1, 0.03, 0.8)}deg)`,
            transformOrigin: "left center",
            opacity: tween(frame, 4, 18) * map(swap, 1, 0.55),
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 116,
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "-0.03em",
            }}
          >
            MENOS
          </span>
        </div>

        {/* MAIS — chega no lugar de MENOS e ganha o destaque roxo */}
        <div
          style={{
            position: "absolute",
            left: maisX,
            top: 470 + maisY,
            transform: `scale(${maisScale}) rotate(${wobble(frame, 2, 0.03, 0.8)}deg)`,
            transformOrigin: "left center",
            opacity: tween(frame, 8, 22),
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 116,
              color: COLORS.neonHot,
              letterSpacing: "-0.03em",
              textShadow: `0 0 ${46 * swap + 14}px ${COLORS.neon}, 0 0 ${
                90 * flash
              }px ${COLORS.neonHot}`,
            }}
          >
            MAIS
          </span>
        </div>

        {/* complementos das duas palavras */}
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 646,
            opacity: (1 - swap) * tween(frame, 10, 22),
            transform: `translateY(${map(swap, 0, -26)}px)`,
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 84,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "-0.03em",
            }}
          >
            COMPLICAÇÃO.
          </span>
        </div>

        <div style={{ position: "absolute", left: 96, top: 640 }}>
          <MaskLine delay={SWAP_END + 2} size={92} color={COLORS.white}>
            POSSIBILIDADES.
          </MaskLine>
        </div>

        {/* linha de apoio */}
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 792,
            width: map(tween(frame, SWAP_END + 10, SWAP_END + 40), 0, 560),
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${COLORS.brand}, ${COLORS.neonHot})`,
            boxShadow: `0 0 24px ${COLORS.neon}`,
          }}
        />
      </AbsoluteFill>

      {/* ── cartões ao fundo ───────────────────────────────── */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 300,
          perspective: 1500,
          opacity: 1 - outro * 0.55,
        }}
      >
        <div style={{ position: "relative", width: 700, height: 420 }}>
          {[
            { variant: "purple" as const, x: -150, rot: -11, delay: 62 },
            { variant: "night" as const, x: 40, rot: 5, delay: 68 },
            { variant: "silver" as const, x: 224, rot: 17, delay: 74 },
          ].map((c, i) => {
            const p = spr(frame, c.delay, "bouncy");
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 350 + c.x - 122,
                  top: map(outro, 0, 90),
                  transform: `translateY(${map(p, 260, 0)}px) rotate(${
                    map(p, c.rot * 2, c.rot) + wobble(frame, i, 0.03, 0.7)
                  }deg) scale(${map(p, 0.88, 1)})`,
                  opacity: p,
                  zIndex: 3 - i,
                }}
              >
                <NuCard variant={c.variant} width={244} name={null} glow={0.6} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* ── assinatura de fecho ────────────────────────────── */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 340,
          opacity: logo,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
            transform: `scale(${map(logo, 0.72, 1)}) translateY(${idle(frame, 0.05, 5)}px)`,
            filter: `drop-shadow(0 0 60px ${COLORS.neon}bb)`,
          }}
        >
          <NuLogo size={280} />
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 46,
              letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.92)",
              opacity: tween(frame, LOGO_AT + 10, LOGO_AT + 26),
            }}
          >
            FEITO PRA VOCÊ.
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
