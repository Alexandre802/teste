/**
 * CENA 8 — 0:17,5 a 0:20
 * "Controle na palma da mão."
 * Motion: o aparelho sobe e as notificações/funções entram em stagger,
 * cada uma com seu próprio atraso e mola.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { EASE, idle, map, spr, tween, wobble } from "../lib/anim";
import { Backdrop } from "../components/Backdrop";
import { AppScreen } from "../components/AppScreen";
import { PhoneFrame } from "../components/PhoneFrame";
import { MaskLine } from "../components/TextFX";
import { CheckIcon, PixIcon, TransferIcon } from "../components/Icons";
import { BODY } from "../lib/fonts";

const PHONE_W = 470;

/** Notificações que sobrevoam o aparelho, entrando alternadamente. */
const NOTES = [
  {
    at: 46,
    side: "left" as const,
    y: 690,
    Icon: PixIcon,
    title: "Pix recebido",
    body: "R$ 250,00 de Marina S.",
    tone: COLORS.success,
  },
  {
    at: 64,
    side: "right" as const,
    y: 880,
    Icon: TransferIcon,
    title: "Transferência enviada",
    body: "R$ 120,00 · concluída",
    tone: COLORS.neonHot,
  },
  {
    at: 82,
    side: "left" as const,
    y: 1070,
    Icon: CheckIcon,
    title: "Compra aprovada",
    body: "Crédito · R$ 89,90",
    tone: COLORS.success,
  },
];

export const Scene08Notificacoes: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = spr(frame, 4, "heavy");
  const actionReveal = [0, 1, 2, 3, 4].map((i) => spr(frame, 88 + i * 4, "bouncy"));
  const glass = tween(frame, 26, 76, { ease: EASE.inOutCubic });

  return (
    <AbsoluteFill>
      <Backdrop parallax={map(tween(frame, 0, 150), 20, -20)} leak={0.28} />

      <AbsoluteFill style={{ padding: "126px 84px", zIndex: 6 }}>
        <MaskLine delay={6} size={104}>
          CONTROLE
        </MaskLine>
        <MaskLine delay={16} size={104}>
          NA <span style={{ color: COLORS.neonHot }}>PALMA</span>
        </MaskLine>
        <MaskLine delay={26} size={104}>
          DA MÃO.
        </MaskLine>
      </AbsoluteFill>

      {/* aparelho subindo */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            transform: `translateY(${map(rise, 620, 96)}px) rotateZ(${wobble(
              frame,
              1,
              0.028,
              0.9,
            )}deg) translateY(${idle(frame, 0.04, 7)}px)`,
            opacity: rise,
          }}
        >
          <PhoneFrame width={PHONE_W} glass={glass} glow={0.85}>
            <AppScreen
              width={PHONE_W - PHONE_W * 0.056}
              height={PHONE_W * 2.05 - PHONE_W * 0.056}
              actionReveal={actionReveal}
              scrollY={0}
            />
          </PhoneFrame>
        </div>
      </AbsoluteFill>

      {/* notificações sobrepostas */}
      {NOTES.map((n, i) => {
        const p = spr(frame, n.at, "bouncy");
        const dir = n.side === "left" ? -1 : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: n.y + idle(frame + i * 26, 0.05, 5),
              [n.side]: 26,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "20px 26px",
              borderRadius: 24,
              width: 470,
              background: "rgba(24,8,52,0.82)",
              border: `1px solid ${n.tone}66`,
              boxShadow: `0 18px 50px rgba(0,0,0,0.55), 0 0 34px ${n.tone}33`,
              // sem backdrop-filter: trava o compositor em render headless longo
              transform: `translateX(${map(p, dir * 420, 0)}px) scale(${map(p, 0.9, 1)})`,
              opacity: p,
              zIndex: 8,
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 18,
                background: `${n.tone}26`,
                border: `1px solid ${n.tone}88`,
                display: "grid",
                placeItems: "center",
                flex: "0 0 auto",
              }}
            >
              <n.Icon size={30} color={n.tone} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: BODY,
                  fontWeight: 700,
                  fontSize: 28,
                  color: COLORS.white,
                  whiteSpace: "nowrap",
                }}
              >
                {n.title}
              </div>
              <div
                style={{
                  fontFamily: BODY,
                  fontSize: 23,
                  color: "rgba(255,255,255,0.62)",
                  marginTop: 2,
                  whiteSpace: "nowrap",
                }}
              >
                {n.body}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
