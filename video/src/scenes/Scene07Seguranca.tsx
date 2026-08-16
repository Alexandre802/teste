/**
 * CENA 7 — 0:15 a 0:17,5
 * "Mais segurança. Sempre."
 * Motion: o escudo se desenha e o check chega com impacto.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { EASE, idle, impactShake, map, spr, tween } from "../lib/anim";
import { Backdrop } from "../components/Backdrop";
import { MaskLine, ImpactWord } from "../components/TextFX";
import { ShieldCheck } from "../components/Widgets";
import { LockIcon } from "../components/Icons";
import { BODY } from "../lib/fonts";

const SHIELD_AT = 26;
const CHECK_HIT = SHIELD_AT + 43; // ~1,15s, casa com o SFX de impacto

const CHIPS = [
  "Criptografia ponta a ponta",
  "Bloqueio pelo app",
  "Monitoramento 24 h",
];

export const Scene07Seguranca: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = impactShake(frame, CHECK_HIT, 16, 9);
  const flash = Math.max(0, 1 - Math.abs(frame - CHECK_HIT) / 8);

  return (
    <AbsoluteFill>
      <Backdrop parallax={map(tween(frame, 0, 150), 12, -12)} leak={0.24} />

      <AbsoluteFill
        style={{
          background: `radial-gradient(52% 32% at 50% 52%, rgba(0,214,143,${
            flash * 0.34
          }), rgba(0,0,0,0))`,
          mixBlendMode: "screen",
        }}
      />

      <AbsoluteFill
        style={{
          padding: "150px 84px",
          transform: `translate(${shake.x * 0.4}px, ${shake.y * 0.4}px)`,
        }}
      >
        <ImpactWord delay={10} size={148} color={COLORS.neonHot} glowColor={COLORS.neon}>
          MAIS
        </ImpactWord>
        <MaskLine delay={22} size={104} style={{ marginTop: 6 }}>
          SEGURANÇA.
        </MaskLine>
        <MaskLine delay={32} size={104}>
          SEMPRE.
        </MaskLine>
      </AbsoluteFill>

      {/* escudo */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 190,
          transform: `translate(${shake.x}px, ${shake.y}px) scale(${map(
            spr(frame, SHIELD_AT - 6, "heavy"),
            0.86,
            1,
          )})`,
        }}
      >
        <div style={{ transform: `translateY(${idle(frame, 0.04, 8)}px)` }}>
          <ShieldCheck size={470} at={SHIELD_AT} />
        </div>
      </AbsoluteFill>

      {/* selos de segurança entrando em stagger */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 168,
          gap: 18,
        }}
      >
        {CHIPS.map((chip, i) => {
          const p = spr(frame, CHECK_HIT + 8 + i * 7, "snappy");
          return (
            <div
              key={chip}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 30px",
                borderRadius: 99,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(199,125,255,0.35)",
                boxShadow: "0 10px 34px rgba(0,0,0,0.35)",
                transform: `translateY(${map(p, 44, 0)}px) scale(${map(p, 0.9, 1)})`,
                opacity: p,
              }}
            >
              <LockIcon size={26} color={COLORS.neonHot} />
              <span
                style={{
                  fontFamily: BODY,
                  fontWeight: 600,
                  fontSize: 30,
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {chip}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
