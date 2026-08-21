/**
 * CENA 4 - "FULL DE VERDADE. Envie hoje, receba amanhã em São Paulo."
 *
 * Os textos entram palavra por palavra e a camera aproxima do mapa. A rota
 * ja existe na arte - o que anima e um brilho percorrendo o traco original
 * (nenhuma linha e desenhada por cima) e a caixa ganhando batida e rastro
 * de velocidade quando o brilho chega nela.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  Backdrop,
  Build,
  Flash,
  Glint,
  Piece,
  Sweep,
  rect,
  slice,
  type Step,
} from "../lib/Art";
import { Sfx } from "../lib/Sfx";
import { camera, pulse, punch, pushTo, ramp } from "../lib/anim";
import { type SceneConfig } from "../config";
import ROUTE from "../../public/art/route.json";

const PTS = ROUTE.points as [number, number][];
const at = (t: number): [number, number] => {
  const i = Math.min(PTS.length - 1, Math.max(0, t * (PTS.length - 1)));
  const a = PTS[Math.floor(i)];
  const b = PTS[Math.min(PTS.length - 1, Math.ceil(i))];
  const k = i - Math.floor(i);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
};

const T = {
  map: 4,
  h1: 14,
  h2: 26,
  sub: 42,
  labels: 62,
  route: 78,
  routeRun: 52,
  zoom: [92, 124, 156, 178] as [number, number, number, number],
  sweep: 150,
};

const STEPS: Step[] = [
  // mapa e fundo
  { r: slice(530, 0, 1080, 1920), at: T.map, dur: 22, dir: "left", dx: 60 },
  { r: slice(0, 0, 530, 660), at: T.map, dur: 16, dir: "down" },
  // "FULL DE" / "VERDADE."
  { r: slice(0, 660, 298, 818), at: T.h1, dur: 8, dir: "right", dx: -34 },
  { r: slice(298, 660, 530, 818), at: T.h1 + 7, dur: 8, dir: "right", dx: -34 },
  { r: slice(0, 818, 530, 976), at: T.h2, dur: 9, dir: "right", dx: -34 },
  // as quatro linhas de apoio, palavra por palavra
  { r: slice(0, 976, 161, 1042), at: T.sub, dur: 6, dir: "right", dx: -18 },
  { r: slice(161, 976, 530, 1042), at: T.sub + 4, dur: 6, dir: "right", dx: -18 },
  { r: slice(0, 1042, 200, 1098), at: T.sub + 9, dur: 6, dir: "right", dx: -18 },
  { r: slice(200, 1042, 530, 1098), at: T.sub + 13, dur: 6, dir: "right", dx: -18 },
  { r: slice(0, 1098, 199, 1154), at: T.sub + 18, dur: 6, dir: "right", dx: -18 },
  { r: slice(199, 1098, 530, 1154), at: T.sub + 22, dur: 6, dir: "right", dx: -18 },
  { r: slice(0, 1154, 260, 1230), at: T.sub + 27, dur: 6, dir: "right", dx: -18 },
  { r: slice(260, 1154, 530, 1230), at: T.sub + 31, dur: 6, dir: "right", dx: -18 },
  { r: slice(0, 1230, 530, 1920), at: T.map + 8, dur: 16, dir: "up", dy: 40 },
];

export const Scene4: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const mid = at(0.5);
  // aproximacao centrada: deslocar o quadro cortaria o titulo da esquerda
  const cam = camera(frame, cfg, pushTo(frame, T.zoom, 1.09, [540, 960], 1.02));

  const rp = ramp(frame, T.route, T.route + T.routeRun);
  const head = at(rp);
  const box = rect("s4", "box");
  // o brilho "entrega" a caixa quando passa por ela
  const boxT = (box.x + box.w * 0.15 - PTS[0][0]) / (PTS[PTS.length - 1][0] - PTS[0][0]);
  const boxHit = T.route + Math.round(T.routeRun * Math.max(0.1, Math.min(0.95, boxT)));
  const arrive = pulse(frame, T.route + T.routeRun, 3, 24);
  const streak = pulse(frame, boxHit, 4, 26);

  return (
    <AbsoluteFill>
      <Backdrop scene="s4" />
      <Build scene="s4" steps={STEPS} frame={frame} cam={cam} fillAt={T.sub + 40} />

      {/* rastro de velocidade atras da caixa - overlay, nao toca a arte */}
      {streak > 0.01 && (
        <AbsoluteFill style={{ transform: cam, mixBlendMode: "screen", opacity: streak * 0.7 }}>
          <div
            style={{
              position: "absolute",
              left: box.x - 230,
              top: box.y + 20,
              width: 300,
              height: box.h - 50,
              background:
                "linear-gradient(90deg, rgba(120,190,255,0) 0%, rgba(150,210,255,.55) 60%, rgba(230,245,255,.9) 100%)",
              filter: "blur(6px)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* brilho percorrendo a rota que ja esta na arte */}
      {rp > 0.001 && rp < 0.999 && (
        <>
          <Glint at={head} size={62} cam={cam} />
          <Glint at={at(Math.max(0, rp - 0.05))} size={40} opacity={0.5} cam={cam} />
          <Glint at={at(Math.max(0, rp - 0.1))} size={26} opacity={0.25} cam={cam} />
        </>
      )}

      <Piece scene="s4" name="dot_go" scale={punch(frame, T.labels, 1.35)} cam={cam} />
      <Piece
        scene="s4"
        name="dot_sp"
        scale={punch(frame, T.route + T.routeRun, 1.35)}
        glow={arrive * 0.5}
        cam={cam}
      />
      <Piece
        scene="s4"
        name="box"
        scale={punch(frame, boxHit, 1.07, 3, 20)}
        glow={streak * 0.22}
        cam={cam}
      />

      <Flash p={arrive} spread="36% 20% at 88% 56%" strength={0.3} />
      <Sweep p={ramp(frame, T.sweep, T.sweep + 24)} strength={0.3} />

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={1} name="glitch" gain={0.7} />
      <Sfx at={T.map} name="bass_hit" gain={0.7} />
      {[0, 7].map((d) => (
        <React.Fragment key={d}>
          <Sfx at={T.h1 + d - 2} name="whoosh_short" gain={0.6} />
          <Sfx at={T.h1 + d} name="pop_ui" />
        </React.Fragment>
      ))}
      <Sfx at={T.h2 - 2} name="whoosh_short" gain={0.7} />
      <Sfx at={T.h2} name="impact" gain={0.55} />
      {[0, 4, 9, 13, 18, 22, 27, 31].map((d) => (
        <Sfx key={d} at={T.sub + d} name="soft_pop" gain={0.55} />
      ))}
      <Sfx at={T.labels} name="tap" />
      <Sfx at={T.zoom[0]} name="riser" gain={0.6} />
      <Sfx at={T.route} name="swipe" />
      <Sfx at={T.route} name="whoosh_short" />
      <Sfx at={boxHit} name="whoosh_trans" gain={0.6} />
      <Sfx at={T.route + T.routeRun} name="impact" gain={0.7} />
      <Sfx at={T.route + T.routeRun} name="success" gain={0.7} />
      <Sfx at={T.route + T.routeRun + 4} name="sparkle" gain={0.6} />
      <Sfx at={cfg.duration - 14} name="reverse_whoosh" />
    </AbsoluteFill>
  );
};
