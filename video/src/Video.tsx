/**
 * Montagem principal: encadeia as cenas, sobrepõe as transições e a
 * trilha de efeitos sonoros. A ordem e a duração vêm de config/timeline.
 */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { SCENES, SCENE_STARTS, sec } from "./config/timeline";
import { SCENE_COMPONENTS } from "./scenes";
import { SfxTrack } from "./components/SfxTrack";
import { EASE, tween } from "./lib/anim";
import "./lib/fonts";

/**
 * Transição: varredura de luz + leve deslocamento, cobrindo a emenda
 * entre cenas. Não corta seco — atravessa a virada.
 */
const Whip: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const span = 13;
  if (frame < at - span || frame > at + span) return null;

  const p = tween(frame, at - span, at + span, { ease: EASE.inOutExpo });
  const intensity = Math.max(0, 1 - Math.abs(frame - at) / span);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50 }}>
      {/* faixa de luz atravessando */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: `${-70 + p * 200}%`,
          width: "58%",
          height: "140%",
          background:
            "linear-gradient(100deg, rgba(199,125,255,0) 0%, rgba(224,170,255,0.42) 45%, rgba(255,255,255,0.6) 52%, rgba(199,125,255,0) 100%)",
          transform: "rotate(9deg)",
          filter: "blur(26px)",
          mixBlendMode: "screen",
          opacity: intensity,
        }}
      />
      {/* escurecimento curtíssimo no ponto exato do corte */}
      <AbsoluteFill
        style={{
          background: "#0C0024",
          opacity: Math.max(0, intensity - 0.82) * 2.2,
        }}
      />
    </AbsoluteFill>
  );
};

export const NubankReels: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0C0024" }}>
    {SCENES.map((scene, i) => {
      const Comp = SCENE_COMPONENTS[scene.id];
      if (!Comp) return null;
      return (
        <Sequence
          key={scene.id}
          from={SCENE_STARTS[i]}
          durationInFrames={sec(scene.durationInSeconds)}
          name={scene.id}
        >
          <Comp />
        </Sequence>
      );
    })}

    {/* transições nas emendas (a primeira cena abre sem varredura) */}
    {SCENE_STARTS.slice(1).map((start) => (
      <Whip key={start} at={start} />
    ))}

    {/* 0,82 dá headroom: sub-boom + impacto somados chegavam a clipar */}
    <SfxTrack masterVolume={0.82} />
  </AbsoluteFill>
);
