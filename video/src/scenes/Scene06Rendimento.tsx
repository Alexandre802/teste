/**
 * CENA 6 — 0:12,5 a 0:15
 * "Seu dinheiro rende enquanto você segue em frente."
 * Motion: números contando e gráfico crescendo rápido.
 * (Ref.: 637A3CA6 — "rende mais que a poupança")
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../config/theme";
import { EASE, idle, map, spr, tween } from "../lib/anim";
import { Backdrop } from "../components/Backdrop";
import { MaskLine } from "../components/TextFX";
import { Counter, GrowthChart } from "../components/Widgets";
import { NuCard } from "../components/NuCard";
import { BODY, DISPLAY } from "../lib/fonts";

const CHART_AT = 34;

export const Scene06Rendimento: React.FC = () => {
  const frame = useCurrentFrame();
  const panel = spr(frame, 20, "heavy");
  const badge = spr(frame, 112, "bouncy");

  return (
    <AbsoluteFill>
      <Backdrop parallax={map(tween(frame, 0, 150), -16, 16)} leak={0.26} />

      <AbsoluteFill style={{ padding: "126px 84px" }}>
        <MaskLine delay={6} size={72}>
          SEU DINHEIRO <span style={{ color: COLORS.neonHot }}>RENDE</span>
        </MaskLine>
        <MaskLine delay={16} size={72}>
          ENQUANTO VOCÊ
        </MaskLine>
        <MaskLine delay={26} size={72}>
          SEGUE EM FRENTE.
        </MaskLine>
      </AbsoluteFill>

      {/* painel de dados */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 610,
        }}
      >
        <div
          style={{
            width: 912,
            borderRadius: 34,
            padding: "44px 46px 34px",
            background:
              "linear-gradient(160deg, rgba(76,26,140,0.62) 0%, rgba(30,8,66,0.72) 100%)",
            border: "1px solid rgba(199,125,255,0.32)",
            boxShadow: "0 30px 90px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.14)",
            // sem backdrop-filter: trava o compositor em render headless longo
            transform: `translateY(${map(panel, 90, 0)}px) scale(${map(panel, 0.94, 1)})`,
            opacity: panel,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 26,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: BODY,
                  fontWeight: 600,
                  fontSize: 26,
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                SEU SALDO RENDENDO
              </div>
              <Counter
                to={1356.98}
                at={CHART_AT - 6}
                duration={70}
                size={86}
                glow={`${COLORS.neon}66`}
                style={{ marginTop: 6 }}
              />
            </div>
            <div style={{ textAlign: "right", opacity: tween(frame, CHART_AT + 20, CHART_AT + 40) }}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 900,
                  fontSize: 54,
                  color: COLORS.success,
                  textShadow: `0 0 26px ${COLORS.success}77`,
                }}
              >
                <Counter
                  to={110}
                  at={CHART_AT + 16}
                  duration={54}
                  decimals={0}
                  prefix=""
                  suffix="%"
                  size={54}
                  color={COLORS.success}
                />
              </div>
              <div
                style={{
                  fontFamily: BODY,
                  fontSize: 22,
                  color: "rgba(255,255,255,0.58)",
                  marginTop: 2,
                }}
              >
                do CDI
              </div>
            </div>
          </div>

          <GrowthChart width={820} height={286} at={CHART_AT} duration={72} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 14,
              fontFamily: BODY,
              fontSize: 21,
              color: "rgba(255,255,255,0.45)",
              opacity: tween(frame, CHART_AT + 26, CHART_AT + 46),
            }}
          >
            {["JAN", "MAR", "MAI", "JUL", "SET", "NOV"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </AbsoluteFill>

      {/* selo "rende mais que a poupança" */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 496,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "18px 34px",
            borderRadius: 99,
            background: "rgba(0,214,143,0.14)",
            border: `2px solid ${COLORS.success}`,
            boxShadow: `0 0 40px rgba(0,214,143,0.4)`,
            transform: `scale(${map(badge, 0.7, 1)}) translateY(${idle(frame, 0.06, 4)}px)`,
            opacity: badge,
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 900,
              fontSize: 34,
              color: COLORS.white,
              letterSpacing: "-0.01em",
            }}
          >
            RENDE MAIS QUE A POUPANÇA
          </span>
        </div>
      </AbsoluteFill>

      {/* par de cartões fechando a base da cena */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 128,
          perspective: 1400,
        }}
      >
        <div style={{ position: "relative", width: 560, height: 250 }}>
          {[
            { variant: "purple" as const, x: -108, rot: -8, delay: 60 },
            { variant: "night" as const, x: 108, rot: 7, delay: 66 },
          ].map((c, i) => {
            const p = spr(frame, c.delay, "heavy");
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 280 + c.x - 112,
                  top: map(p, 210, 26),
                  transform: `rotate(${c.rot}deg)`,
                  opacity: p * 0.95,
                }}
              >
                <NuCard variant={c.variant} width={224} name={null} glow={0.55} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
