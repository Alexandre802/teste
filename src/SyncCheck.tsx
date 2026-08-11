/**
 * Composição de CONFERÊNCIA de sincronia (não é a peça final).
 *
 * Mostra o vídeo com timecode, nome da cena, contador de frases e um pisca a
 * cada palavra falada — serve para apontar exatamente em que segundo uma tela
 * deveria entrar ("em 0:34 já era a tela 100+").
 *
 * No Studio: composição `ConsulTechReel-sync`.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BEATS, PHRASES } from "./config/speechMap";
import { FPS, SCENES, TOTAL_FRAMES } from "./config/timeline";
import { C, FW } from "./config/theme";
import { fontFamily } from "./lib/fonts";
import { ConsulTechVideo } from "./Video";

const timecode = (frame: number) => {
  const t = frame / FPS;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const f = Math.round(frame % FPS);
  return `${m}:${String(s).padStart(2, "0")}.${String(f).padStart(2, "0")}`;
};

export const SyncCheck: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;

  const scene = [...SCENES].reverse().find((s) => frame >= s.from) ?? SCENES[0];
  const phraseIndex = PHRASES.findIndex((p) => sec >= p.start && sec <= p.end);
  const speaking = phraseIndex >= 0;
  const lastBeat = BEATS.filter((b) => b <= sec).pop() ?? -1;
  const onBeat = lastBeat >= 0 && sec - lastBeat < 0.09;

  return (
    <AbsoluteFill>
      <ConsulTechVideo />

      {/* faixa de informação */}
      <AbsoluteFill style={{ zIndex: 200, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "22px 28px 28px",
            background: "linear-gradient(0deg, rgba(0,0,0,0.85), rgba(0,0,0,0))",
            display: "flex",
            alignItems: "center",
            gap: 26,
            fontFamily,
          }}
        >
          <span
            style={{
              fontWeight: FW.bold,
              fontSize: 46,
              color: C.white,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {timecode(frame)}
          </span>
          <span style={{ fontWeight: FW.medium, fontSize: 30, color: C.blueSoft }}>
            {scene.label}
          </span>
          <span style={{ fontWeight: FW.regular, fontSize: 26, color: "rgba(255,255,255,0.7)" }}>
            frase {speaking ? phraseIndex + 1 : "—"}/{PHRASES.length}
          </span>
          <div
            style={{
              marginLeft: "auto",
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: onBeat ? C.green : "rgba(255,255,255,0.18)",
              boxShadow: onBeat ? `0 0 22px ${C.green}` : "none",
            }}
          />
        </div>

        {/* régua de frases */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 96, height: 10 }}>
          {PHRASES.map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${(p.start / (TOTAL_FRAMES / FPS)) * 100}%`,
                width: `${((p.end - p.start) / (TOTAL_FRAMES / FPS)) * 100}%`,
                top: 0,
                height: 10,
                background: i === phraseIndex ? C.green : "rgba(120,160,255,0.55)",
                borderRadius: 3,
              }}
            />
          ))}
          {SCENES.map((s) => (
            <div
              key={s.id}
              style={{
                position: "absolute",
                left: `${(s.from / TOTAL_FRAMES) * 100}%`,
                top: -12,
                width: 3,
                height: 34,
                background: C.red,
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
