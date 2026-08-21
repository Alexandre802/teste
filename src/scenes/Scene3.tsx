/**
 * CENA 3 - "QUEM VENDE MAIS NÃO PODE ESPERAR MAIS."
 *
 * O celular sobe e uma cortina da cor da tela recua de cima para baixo:
 * e a propria linha do rastreio descendo de Pedido vendido -> Separado ->
 * Enviado, acendendo cada etapa na ordem. Um brilho acompanha a borda.
 * Os titulos da direita entram palavra por palavra.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  Backdrop,
  Build,
  Curtain,
  Flash,
  Piece,
  Sweep,
  band,
  slice,
  Glint,
  Reveal,
  curtainEdge,
  wipeMask,
  type Step,
} from "../lib/Art";
import { Sfx } from "../lib/Sfx";
import { camera, pulse, punch, ramp } from "../lib/anim";
import { type SceneConfig } from "../config";

const T = {
  logo: 0,
  phone: 8,
  h1: 34,
  h2: 52,
  sub: 72,
  /** etapas do rastreio: quadro e altura relativa na tela do app */
  steps: [
    { at: 84, p: 0.34 },
    { at: 116, p: 0.56 },
    { at: 148, p: 0.78 },
    { at: 176, p: 1.0 },
  ],
  stepDur: 18,
  sweep: 172,
};

const HEAD_START = 0.148; // cabecalho "Envio em andamento" ja visivel
const PHONE = slice(0, 380, 520, 1920);

const STEPS: Step[] = [
  { r: band(0, 380), at: T.logo, dur: 12, dir: "down", dy: -24 },
  // celular sobe pela esquerda
  // coluna da direita: fundo, depois titulo palavra por palavra
  { r: slice(520, 380, 1080, 786), at: T.phone + 6, dur: 12, dir: "down" },
  { r: slice(520, 786, 705, 892), at: T.h1, dur: 7, dir: "right", dx: -26 },
  { r: slice(705, 786, 892, 892), at: T.h1 + 6, dur: 7, dir: "right", dx: -26 },
  { r: slice(892, 786, 1080, 892), at: T.h1 + 12, dur: 7, dir: "right", dx: -26 },
  { r: slice(520, 892, 632, 984), at: T.h2, dur: 6, dir: "right", dx: -20 },
  { r: slice(632, 892, 750, 984), at: T.h2 + 5, dur: 6, dir: "right", dx: -20 },
  { r: slice(750, 892, 937, 984), at: T.h2 + 10, dur: 6, dir: "right", dx: -20 },
  { r: slice(937, 892, 1080, 984), at: T.h2 + 15, dur: 6, dir: "right", dx: -20 },
  { r: slice(520, 984, 767, 1062), at: T.sub, dur: 6, dir: "right", dx: -16 },
  { r: slice(767, 984, 1080, 1062), at: T.sub + 5, dur: 6, dir: "right", dx: -16 },
  { r: slice(520, 1062, 1080, 1920), at: T.phone + 12, dur: 16, dir: "up", dy: 40 },
];

export const Scene3: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const cam = camera(frame, cfg);

  // o celular sobe e a cortina da tela usa a MESMA mascara: as duas nascem
  // juntas, sem a lista piscar antes de a cortina entrar
  const phoneP = Math.min(1, Math.max(0, (frame - T.phone) / 22));
  const phoneEased = 1 - Math.pow(1 - phoneP, 3);
  const phoneMask = wipeMask(PHONE, phoneEased, "up", 26);

  // a cortina recua em degraus: cada etapa do rastreio surge no seu tempo
  // acumula etapa a etapa: cada uma leva a cortina do ponto atual ao alvo
  let curtain = HEAD_START;
  T.steps.forEach((st) => {
    curtain += (st.p - curtain) * ramp(frame, st.at, st.at + T.stepDur);
  });

  const arrived = pulse(frame, T.steps[2].at + T.stepDur, 3, 24);
  const dots = ["dot1", "dot2", "dot3"] as const;

  return (
    <AbsoluteFill>
      <Backdrop scene="s3" />
      <Build scene="s3" steps={STEPS} frame={frame} cam={cam} fillAt={T.sub + 14} />

      {/* a tela do app abrindo etapa por etapa - so depois que o celular
          termina de subir, senao a cortina apareceria solta no fundo */}
      {/* celular subindo */}
      <Reveal scene="s3" r={PHONE} p={phoneEased} dir="up" soft={26} cam={cam} />
      {phoneEased > 0.001 && (
        <>
          <Curtain scene="s3" name="scr" p={curtain} cam={cam} mask={phoneMask} />
          {curtain > HEAD_START + 0.01 && curtain < 0.99 && (
            <Glint at={curtainEdge("s3", "scr", curtain, 0.17)} size={40} color="#7fffa8" cam={cam} />
          )}
        </>
      )}

      {/* cada bolinha do rastreio acende quando a linha chega nela */}
      {dots.map((n, i) => (
        <Piece
          key={n}
          scene="s3"
          name={n}
          scale={punch(frame, T.steps[i].at + T.stepDur - 4, 1.2)}
          glow={pulse(frame, T.steps[i].at + T.stepDur - 4, 3, 16) * 0.35}
          cam={cam}
        />
      ))}
      <Piece
        scene="s3"
        name="eta"
        scale={punch(frame, T.steps[3].at + 8, 1.05)}
        cam={cam}
      />

      <Flash p={arrived} spread="40% 22% at 22% 66%" strength={0.22} />
      <Sweep p={ramp(frame, T.sweep, T.sweep + 26)} strength={0.28} />

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={2} name="bass_hit" gain={0.8} />
      <Sfx at={T.logo + 3} name="soft_pop" />
      <Sfx at={T.phone} name="whoosh_short" />
      {[0, 6, 12].map((d) => (
        <Sfx key={d} at={T.h1 + d} name="pop_ui" gain={0.85} />
      ))}
      {[0, 5, 10, 15].map((d) => (
        <Sfx key={`b${d}`} at={T.h2 + d} name="pop_ui" gain={0.75} />
      ))}
      {[0, 5].map((d) => (
        <Sfx key={`c${d}`} at={T.sub + d} name="soft_pop" gain={0.7} />
      ))}
      {T.steps.map((st, i) => (
        <React.Fragment key={st.at}>
          <Sfx at={st.at} name="swipe" gain={0.6} />
          <Sfx at={st.at + T.stepDur - 4} name="tap" />
          <Sfx
            at={st.at + T.stepDur - 4}
            name={i === 2 ? "success" : i === 3 ? "notif" : "soft_pop"}
            gain={0.9}
          />
        </React.Fragment>
      ))}
      <Sfx at={T.sweep} name="sparkle" gain={0.5} />
      <Sfx at={cfg.duration - 15} name="riser" gain={0.6} />
    </AbsoluteFill>
  );
};
