/**
 * CENA 6 - Encerramento: "TRÊS ESTRELAS - Logística para quem vende grande."
 *
 * A cena mais dinamica: o galpao sobe, o logo desce, o nome bate na tela em
 * duas batidas, a tarja vermelha abre da esquerda para a direita e as
 * notificacoes entram nos quatro cantos. Fecha com sting de marca.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  Backdrop,
  Build,
  Flash,
  Piece,
  Sweep,
  band,
  slice,
  type Step,
} from "../lib/Art";
import { Sfx } from "../lib/Sfx";
import { camera, pulse, punch, ramp } from "../lib/anim";
import { type SceneConfig } from "../config";

const T = {
  ware: 0,
  logo: 8,
  big1: 24,
  big2: 36,
  tag: 50,
  notifs: [62, 68, 74, 80],
  props: 58,
  sting: 108,
  sweep: 96,
};

const STEPS: Step[] = [
  // galpao e caminhao sobem da base
  { r: band(1388, 1920), at: T.ware, dur: 20, dir: "up", dy: 70 },
  // topo e laterais do fundo
  { r: slice(400, 0, 780, 440), at: T.ware + 2, dur: 12, dir: "down" },
  { r: band(440, 700), at: T.logo, dur: 14, dir: "down", dy: -40 },
  // "TRÊS" e "ESTRELAS" batem na tela
  { r: band(700, 890), at: T.big1, dur: 9, dir: "down", dy: -34 },
  { r: band(890, 1110), at: T.big2, dur: 9, dir: "up", dy: 34 },
  // tarja vermelha abre da esquerda para a direita
  { r: band(1110, 1250), at: T.tag, dur: 12, dir: "right", soft: 14 },
  { r: slice(300, 1250, 780, 1388), at: T.props, dur: 10, dir: "down" },
  // notificacoes nos quatro cantos
  { r: slice(0, 0, 400, 440), at: T.notifs[0], dur: 10, dir: "right", dx: -70 },
  { r: slice(780, 0, 1080, 440), at: T.notifs[1], dur: 10, dir: "left", dx: 70 },
  { r: slice(0, 1250, 300, 1388), at: T.notifs[2], dur: 10, dir: "right", dx: -70 },
  { r: slice(780, 1250, 1080, 1388), at: T.notifs[3], dur: 10, dir: "left", dx: 70 },
];

export const Scene6: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const cam = camera(frame, cfg);

  const hit1 = pulse(frame, T.big1 + 6, 3, 20);
  const hit2 = pulse(frame, T.big2 + 6, 3, 20);
  const sting = pulse(frame, T.sting, 6, 40);

  return (
    <AbsoluteFill>
      <Backdrop scene="s6" />
      <Build scene="s6" steps={STEPS} frame={frame} cam={cam} fillAt={T.notifs[3] + 12} />

      <Piece scene="s6" name="logo" scale={punch(frame, T.logo + 10, 1.07)} cam={cam} />
      <Piece
        scene="s6"
        name="big1"
        scale={punch(frame, T.big1 + 6, 1.06, 3, 18)}
        glow={hit1 * 0.32}
        cam={cam}
      />
      <Piece
        scene="s6"
        name="big2"
        scale={punch(frame, T.big2 + 6, 1.06, 3, 18)}
        glow={hit2 * 0.32}
        cam={cam}
      />
      <Piece scene="s6" name="tag" scale={punch(frame, T.tag + 11, 1.05)} cam={cam} />
      {(["ntl", "ntr", "nbl", "nbr"] as const).map((n, i) => (
        <Piece key={n} scene="s6" name={n} scale={punch(frame, T.notifs[i] + 8, 1.09)} cam={cam} />
      ))}
      {(["boxTR", "boxBL", "pinL", "pinR"] as const).map((n, i) => (
        <Piece key={n} scene="s6" name={n} scale={punch(frame, T.props + i * 5, 1.12)} cam={cam} />
      ))}

      <Flash p={hit1 + hit2 + sting} strength={0.24} />
      <Sweep p={ramp(frame, T.sweep, T.sweep + 28)} strength={0.36} />

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={0} name="sub_boom" />
      <Sfx at={T.logo} name="impact" gain={0.8} />
      <Sfx at={T.big1 - 5} name="reverse_whoosh" />
      <Sfx at={T.big1 + 6} name="impact" />
      <Sfx at={T.big1 + 6} name="bass_hit" />
      <Sfx at={T.big2 - 4} name="whoosh_short" />
      <Sfx at={T.big2 + 6} name="impact" />
      <Sfx at={T.big2 + 6} name="sub_boom" gain={0.8} />
      <Sfx at={T.tag - 3} name="swipe" />
      <Sfx at={T.tag + 10} name="pop_ui" />
      {T.notifs.map((f) => (
        <React.Fragment key={f}>
          <Sfx at={f - 2} name="whoosh_short" gain={0.6} />
          <Sfx at={f + 8} name="notif" gain={0.85} />
        </React.Fragment>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} at={T.props + i * 5} name="soft_pop" gain={0.7} />
      ))}
      <Sfx at={T.sting - 22} name="riser" />
      <Sfx at={T.sting} name="logo_sting" />
      <Sfx at={T.sting} name="sparkle" gain={0.8} />
    </AbsoluteFill>
  );
};
