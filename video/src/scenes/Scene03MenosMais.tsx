/**
 * CENA 3 — 0:05 a 0:07,5
 * "Menos burocracia. Mais liberdade."
 * Motion: "MENOS" é expulso da tela e "MAIS" entra crescendo com impacto,
 * sobre a faixa branca angulada da referência 5FD796DB.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { EASE, impactShake, map, spr, tween, wobble } from "../lib/anim";
import { Backdrop } from "../components/Backdrop";
import { NuCard } from "../components/NuCard";
import { ExitWord, ImpactWord } from "../components/TextFX";
import { DISPLAY } from "../lib/fonts";

const EXIT_AT = 27; // "MENOS" dispara para fora
const IMPACT_AT = 55; // "MAIS" chega

export const Scene03MenosMais: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = impactShake(frame, IMPACT_AT + 6, 18, 12);

  const banner = spr(frame, 6, "heavy");
  const cardsIn = spr(frame, 74, "snappy");
  const flash = Math.max(0, 1 - Math.abs(frame - (IMPACT_AT + 6)) / 7);

  return (
    <AbsoluteFill>
      <Backdrop
        parallax={map(tween(frame, 0, 150, { ease: EASE.outSoft }), 24, -24)}
        leak={0.32}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 45% at 50% 44%, rgba(224,170,255,${
            flash * 0.55
          }), rgba(0,0,0,0))`,
          mixBlendMode: "screen",
        }}
      />

      {/* faixa branca angulada (assinatura visual da referência) */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 470,
          transform: `translate(${shake.x * 0.5}px, ${shake.y * 0.5}px)`,
        }}
      >
        <div
          style={{
            width: 1240,
            height: 232,
            background: COLORS.white,
            transform: `rotate(-4.2deg) scaleX(${map(banner, 0.12, 1)})`,
            transformOrigin: "left center",
            boxShadow: "0 26px 70px rgba(0,0,0,0.5)",
            opacity: banner > 0.02 ? 1 : 0,
          }}
        />
      </AbsoluteFill>

      {/* ── palavras ───────────────────────────────────────── */}
      <AbsoluteFill
        style={{
          padding: "0 84px",
          justifyContent: "flex-start",
          paddingTop: 300,
          transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.rot}deg)`,
        }}
      >
        {/* MENOS entra e é expulso */}
        <div
          style={{
            opacity: tween(frame, 4, 18),
            transform: `translateX(${map(tween(frame, 4, 20), -140, 0)}px)`,
          }}
        >
          <ExitWord at={EXIT_AT} direction="left" size={132} color={COLORS.white}>
            MENOS
          </ExitWord>
        </div>

        <div
          style={{
            marginTop: 34,
            opacity: tween(frame, 10, 24) * (1 - tween(frame, EXIT_AT + 4, EXIT_AT + 18)),
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 92,
              color: "#2A0A55",
              letterSpacing: "-0.03em",
            }}
          >
            BUROCRACIA
          </span>
        </div>
      </AbsoluteFill>

      {/* MAIS cresce com impacto, no lugar deixado por MENOS */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 468,
          transform: `translate(${shake.x}px, ${shake.y}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
          <ImpactWord delay={IMPACT_AT} size={210} color="#2A0A55" glowColor={COLORS.brand}>
            +MAIS
          </ImpactWord>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 726,
          opacity: tween(frame, IMPACT_AT + 16, IMPACT_AT + 34),
          transform: `translateY(${map(tween(frame, IMPACT_AT + 16, IMPACT_AT + 36), 40, 0)}px)`,
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 104,
            color: COLORS.white,
            letterSpacing: "-0.03em",
            textShadow: `0 0 44px ${COLORS.brand}`,
          }}
        >
          LIBERDADE.
        </span>
      </AbsoluteFill>

      {/* dupla de cartões fecha a cena, como no anúncio de referência */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 96,
          perspective: 1500,
        }}
      >
        <div style={{ position: "relative", width: 640, height: 470 }}>
          {[
            { variant: "purple" as const, x: -128, y: 0, rot: -9, delay: 0 },
            { variant: "night" as const, x: 128, y: 46, rot: 8, delay: 6 },
          ].map((c, i) => {
            const p = spr(frame, 74 + c.delay, "bouncy");
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 320 + c.x - 145,
                  top: c.y,
                  transform: `translateY(${map(p, 210, 0)}px) rotate(${
                    map(p, c.rot * 2.4, c.rot) + wobble(frame, i, 0.032, 0.8)
                  }deg) scale(${map(p, 0.86, 1)})`,
                  opacity: p,
                  filter: cardsIn < 0.85 ? `blur(${(1 - p) * 7}px)` : undefined,
                }}
              >
                <NuCard
                  variant={c.variant}
                  width={290}
                  name={i === 0 ? "Gabriela Lima" : "Joan Olimcira"}
                  glow={0.7}
                />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
