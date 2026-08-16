/**
 * CENA 5 — 0:10 a 0:12,5
 * "Seu dinheiro merece mais."
 * Motion: destaque luminoso sobre "MAIS" + linha e contador crescendo.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { EASE, idle, impactShake, map, pulse, spr, tween } from "../lib/anim";
import { Backdrop } from "../components/Backdrop";
import { MaskLine, ImpactWord } from "../components/TextFX";
import { Counter } from "../components/Widgets";
import { NuCard } from "../components/NuCard";
import { BODY } from "../lib/fonts";

const HIT = 51; // 0,85s — impacto de "MAIS"

export const Scene05MereceMais: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = impactShake(frame, HIT, 15, 8);

  const lineGrow = tween(frame, HIT + 4, HIT + 46, { ease: EASE.outQuint });
  const glowPulse = 0.55 + pulse(frame, HIT, HIT + 10, HIT + 46) * 0.45;
  const cardIn = spr(frame, 96, "bouncy");

  return (
    <AbsoluteFill>
      <Backdrop parallax={map(tween(frame, 0, 150), 18, -18)} leak={0.3} />

      {/* facho de luz que desce sobre a palavra em destaque */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(46% 28% at 50% 40%, rgba(224,170,255,${
            0.42 * glowPulse * tween(frame, HIT - 10, HIT + 8)
          }), rgba(0,0,0,0))`,
          mixBlendMode: "screen",
        }}
      />

      <AbsoluteFill
        style={{
          padding: "0 84px",
          paddingTop: 420,
          transform: `translate(${shake.x}px, ${shake.y}px)`,
        }}
      >
        <MaskLine delay={8} size={96}>
          SEU DINHEIRO
        </MaskLine>

        <div style={{ display: "flex", alignItems: "baseline", gap: 30, marginTop: 18 }}>
          <MaskLine delay={20} size={96} style={{ flex: "0 0 auto" }}>
            MERECE
          </MaskLine>
          <ImpactWord delay={HIT} size={168} color={COLORS.neonHot} glowColor={COLORS.neon}>
            MAIS.
          </ImpactWord>
        </div>

        {/* linha luminosa crescendo sob o texto */}
        <div style={{ marginTop: 44, position: "relative", height: 8 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: `${lineGrow * 100}%`,
              height: 8,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${COLORS.brand}, ${COLORS.neonHot})`,
              boxShadow: `0 0 26px ${COLORS.neon}`,
            }}
          />
          {/* ponta brilhante correndo na frente da linha */}
          {lineGrow > 0.01 && lineGrow < 0.999 ? (
            <div
              style={{
                position: "absolute",
                left: `calc(${lineGrow * 100}% - 9px)`,
                top: -5,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: COLORS.white,
                boxShadow: `0 0 30px ${COLORS.neonHot}`,
              }}
            />
          ) : null}
        </div>

        {/* contador acompanhando o crescimento */}
        <div style={{ marginTop: 54 }}>
          <span
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.66)",
              opacity: tween(frame, HIT + 8, HIT + 24),
            }}
          >
            RENDIMENTO ACUMULADO
          </span>
          <Counter
            to={1356.98}
            at={HIT + 12}
            duration={62}
            size={104}
            color={COLORS.white}
            glow={`${COLORS.neon}88`}
            style={{ marginTop: 10 }}
          />
        </div>
      </AbsoluteFill>

      {/* cartão flutuando ao fundo, fechando a composição */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 92,
          perspective: 1400,
        }}
      >
        <div
          style={{
            transform: `translateY(${map(cardIn, 190, 0)}px) rotateZ(${map(
              cardIn,
              -10,
              -4,
            )}deg) translateY(${idle(frame, 0.05, 8)}px)`,
            opacity: cardIn * 0.98,
          }}
        >
          <NuCard variant="purple" width={296} name="Gabriela Lima" glow={0.9} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
