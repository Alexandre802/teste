/**
 * CENA 5 - "ENTREGAR BEM TAMBÉM É VENDER."
 *
 * Primeiro a imagem inteira se monta: titulo palavra por palavra, o centro
 * subindo e os quatro cards entrando pelas laterais. So depois a cortina do
 * card de status recua e a linha percorre Pedido enviado -> Em transporte ->
 * ENTREGUE, com a camera fechando nesse percurso.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  Backdrop,
  Build,
  Curtain,
  Flash,
  Glint,
  Reveal,
  Piece,
  Sweep,
  band,
  slice,
  curtainEdge,
  surfaceBox,
  wipeMask,
  type Step,
} from "../lib/Art";
import { Sfx } from "../lib/Sfx";
import { camera, pulse, punch, pushTo, ramp } from "../lib/anim";
import { type SceneConfig } from "../config";

const T = {
  logo: 0,
  h1: 12,
  h2: 30,
  center: 42,
  cards: [52, 58, 64, 70],
  shield: 76,
  /** etapas do rastreio no card de status */
  steps: [
    { at: 104, p: 0.30 },
    { at: 140, p: 0.55 },
    { at: 176, p: 0.78 },
    { at: 200, p: 1.0 },
  ],
  stepDur: 20,
  zoom: [100, 132, 196, 216] as [number, number, number, number],
  sweep: 60,
};

const CARD_START = 0.04;
const CENTER = slice(290, 690, 800, 1920);

const STEPS: Step[] = [
  { r: band(0, 320), at: T.logo, dur: 12, dir: "down", dy: -24 },
  // "ENTREGAR BEM"
  { r: slice(0, 320, 754, 512), at: T.h1, dur: 9, dir: "right", dx: -30 },
  { r: slice(754, 320, 1080, 512), at: T.h1 + 8, dur: 9, dir: "right", dx: -30 },
  // "TAMBÉM É VENDER."
  { r: slice(0, 512, 530, 690), at: T.h2, dur: 8, dir: "right", dx: -26 },
  { r: slice(530, 512, 611, 690), at: T.h2 + 6, dur: 6, dir: "right", dx: -26 },
  { r: slice(611, 512, 1080, 690), at: T.h2 + 11, dur: 8, dir: "right", dx: -26 },
  // centro (domo, caixa, escudo) sobe
  // quatro cards, alternando os lados
  { r: slice(0, 690, 290, 1100), at: T.cards[0], dur: 12, dir: "right", dx: -80 },
  { r: slice(800, 690, 1080, 1100), at: T.cards[1], dur: 12, dir: "left", dx: 80 },
  { r: slice(0, 1100, 290, 1920), at: T.cards[2], dur: 12, dir: "right", dx: -80 },
  { r: slice(800, 1100, 1080, 1920), at: T.cards[3], dur: 12, dir: "left", dx: 80 },
];

export const Scene5: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const card = surfaceBox("s5", "card");
  const focus: [number, number] = [card.x + card.w / 2, card.y + card.h * 0.42];
  const cam = camera(frame, cfg, pushTo(frame, T.zoom, 1.09, focus, 1.01));

  // acumula etapa a etapa: cada uma leva a cortina do ponto atual ao alvo
  // o centro sobe e a cortina do card usa a MESMA mascara
  const centerP = Math.min(1, Math.max(0, (frame - T.center) / 22));
  const centerEased = 1 - Math.pow(1 - centerP, 3);
  const centerMask = wipeMask(CENTER, centerEased, "up", 26);

  let curtain = CARD_START;
  T.steps.forEach((st) => {
    curtain += (st.p - curtain) * ramp(frame, st.at, st.at + T.stepDur);
  });

  // brilho descendo junto com a borda da cortina
  const glintAt = curtainEdge("s5", "card", curtain, 0.15);
  const running = curtain > CARD_START + 0.01 && curtain < 0.99;

  const delivered = pulse(frame, T.steps[2].at + T.stepDur - 4, 4, 30);
  const dots = ["s_d1", "s_d2", "s_d3"] as const;

  return (
    <AbsoluteFill>
      <Backdrop scene="s5" />
      <Build scene="s5" steps={STEPS} frame={frame} cam={cam} fillAt={T.cards[3] + 14} />

      {/* centro subindo */}
      <Reveal scene="s5" r={CENTER} p={centerEased} dir="up" soft={26} cam={cam} />
      {/* card de status abrindo etapa por etapa, com a mesma mascara */}
      <Curtain scene="s5" name="card" p={curtain} cam={cam} mask={centerMask} />
      {running && <Glint at={glintAt} size={44} color="#7fe6ff" cam={cam} />}

      <Piece scene="s5" name="cbox" scale={punch(frame, T.center + 16, 1.05)} cam={cam} />
      <Piece
        scene="s5"
        name="shield"
        scale={punch(frame, T.shield, 1.14)}
        glow={pulse(frame, T.shield, 3, 22) * 0.4}
        cam={cam}
      />
      {(["c_tl", "c_tr", "c_bl", "c_br"] as const).map((n, i) => (
        <Piece key={n} scene="s5" name={n} scale={punch(frame, T.cards[i] + 9, 1.06)} cam={cam} />
      ))}

      {/* bolinhas do rastreio acendem quando a linha chega */}
      {dots.map((n, i) => (
        <Piece
          key={n}
          scene="s5"
          name={n}
          scale={punch(frame, T.steps[i].at + T.stepDur - 4, 1.22)}
          glow={pulse(frame, T.steps[i].at + T.stepDur - 4, 3, 18) * 0.4}
          cam={cam}
        />
      ))}
      <Piece scene="s5" name="stars" scale={punch(frame, T.steps[3].at + 10, 1.08)} cam={cam} />

      <Flash p={delivered} color="#9dffc0" spread="34% 18% at 50% 82%" strength={0.3} />
      <Sweep p={ramp(frame, T.sweep, T.sweep + 26)} strength={0.28} />

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={1} name="sub_boom" gain={0.7} />
      {[0, 8].map((d) => (
        <React.Fragment key={d}>
          <Sfx at={T.h1 + d - 2} name="whoosh_short" gain={0.6} />
          <Sfx at={T.h1 + d} name="pop_ui" />
        </React.Fragment>
      ))}
      {[0, 6, 11].map((d) => (
        <Sfx key={`b${d}`} at={T.h2 + d} name="pop_ui" gain={0.85} />
      ))}
      <Sfx at={T.center - 6} name="reverse_whoosh" gain={0.7} />
      <Sfx at={T.center} name="bass_hit" />
      {T.cards.map((f, i) => (
        <React.Fragment key={f}>
          <Sfx at={f - 2} name="whoosh_short" gain={0.65} />
          <Sfx at={f + 9} name="soft_pop" gain={0.85} />
        </React.Fragment>
      ))}
      <Sfx at={T.shield} name="success" gain={0.7} />
      <Sfx at={T.shield} name="sparkle" gain={0.6} />
      <Sfx at={T.zoom[0]} name="riser" gain={0.5} />
      {T.steps.map((st, i) => (
        <React.Fragment key={st.at}>
          <Sfx at={st.at} name="swipe" gain={0.55} />
          <Sfx at={st.at + T.stepDur - 4} name="tap" />
          <Sfx
            at={st.at + T.stepDur - 4}
            name={i === 2 ? "success" : i === 3 ? "sparkle" : "soft_pop"}
            gain={0.9}
          />
        </React.Fragment>
      ))}
      <Sfx at={cfg.duration - 16} name="riser" gain={0.7} />
    </AbsoluteFill>
  );
};
