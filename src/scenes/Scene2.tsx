/**
 * CENA 2 - "+100.000 VOLUMES TODOS OS MESES"
 *
 * O numero e o da arte, intocado. A contagem vem da ordem em que ele e
 * revelado: o "+" entra, depois cada casa, e o valor sobe 1 -> 10 -> 100 ->
 * 1.000 -> 10.000 -> 100.000. As caixas que formam os digitos sao sempre as
 * originais - nenhum digito foi desenhado.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  Backdrop,
  Build,
  Flash,
  Piece,
  Reveal,
  Sweep,
  band,
  rect,
  slice,
  type Step,
} from "../lib/Art";
import { Sfx } from "../lib/Sfx";
import { camera, pulse, punch, ramp } from "../lib/anim";
import { COUNTER, type SceneConfig } from "../config";

/** Borda direita de cada casa do numero, medida na propria arte. */
const DIGIT_EDGES = [196, 290, 454, 608, 668, 802, 927, 1072];

const T = {
  logo: 0,
  boxes: 8,
  count: COUNTER.start,
  stepDur: COUNTER.stepDur,
  sub: 96,
  sweep: 118,
};

const STEPS: Step[] = [
  { r: band(0, 490), at: T.logo, dur: 12, dir: "down", dy: -24 },
  { r: band(490, 620), at: T.boxes, dur: 10, dir: "down" },
  { r: band(1140, 1290), at: T.sub, dur: 6, dir: "right" },
  { r: band(1290, 1920), at: T.boxes + 6, dur: 14, dir: "up", dy: 40 },
];

/** Palavras da legenda entram uma a uma. */
const SUB_EDGES = [476, 695, 792, 1004];

export const Scene2: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const cam = camera(frame, cfg);
  const num = rect("s2", "number");

  // a contagem: cada casa do numero e revelada em sequencia
  const stepAt = (i: number) => T.count + i * T.stepDur;
  let p = 0;
  DIGIT_EDGES.forEach((edge, i) => {
    const local = ramp(frame, stepAt(i), stepAt(i) + T.stepDur);
    p = Math.max(p, ((edge - num.x) / num.w) * local + (i > 0 ? p * (1 - local) : 0));
  });
  const done = stepAt(DIGIT_EDGES.length - 1) + T.stepDur;
  const land = pulse(frame, done, 3, 22);

  return (
    <AbsoluteFill>
      <Backdrop scene="s2" />
      <Build scene="s2" steps={STEPS} frame={frame} cam={cam} fillAt={done + 4} />

      {/* o numero da arte, revelado casa a casa */}
      <Reveal scene="s2" r={num} p={p} dir="right" soft={10} cam={cam} />

      {/* batida quando crava o valor */}
      <Piece
        scene="s2"
        name="number"
        scale={punch(frame, done, 1.06, 3, 20)}
        glow={land * 0.3}
        cam={cam}
      />

      {/* legenda palavra por palavra */}
      {SUB_EDGES.map((e, i) => (
        <Reveal
          key={e}
          scene="s2"
          r={slice(i === 0 ? 160 : SUB_EDGES[i - 1], 1136, e, 1266)}
          p={ramp(frame, T.sub + i * 5, T.sub + i * 5 + 7)}
          dir="right"
          soft={12}
          cam={cam}
        />
      ))}

      <Flash p={land} spread="48% 24% at 50% 46%" strength={0.42} />
      <Sweep p={ramp(frame, T.sweep, T.sweep + 24)} strength={0.34} />

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={0} name="glitch" gain={0.8} />
      <Sfx at={T.logo + 3} name="impact" gain={0.7} />
      <Sfx at={T.count - 8} name="riser" />
      {DIGIT_EDGES.map((_, i) => (
        <React.Fragment key={i}>
          <Sfx at={stepAt(i)} name="tick" gain={0.9} />
          {i % 2 === 1 && <Sfx at={stepAt(i)} name="soft_pop" gain={0.5} />}
        </React.Fragment>
      ))}
      <Sfx at={done} name="impact" />
      <Sfx at={done} name="sub_boom" />
      <Sfx at={done + 3} name="sparkle" gain={0.8} />
      {SUB_EDGES.map((_, i) => (
        <Sfx key={i} at={T.sub + i * 5} name="pop_ui" gain={0.8} />
      ))}
      <Sfx at={cfg.duration - 14} name="reverse_whoosh" />
    </AbsoluteFill>
  );
};
