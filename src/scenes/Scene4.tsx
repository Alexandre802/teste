/**
 * CENA 4 - "FULL DE VERDADE. Envie hoje, receba amanhã em São Paulo."
 *
 * Os textos entram palavra por palavra; depois a camera aproxima do mapa
 * enquanto a rota Goiania -> Sao Paulo acende e a caixa atravessa o traco.
 * O caminho vem do proprio pixel da arte (tools/route.py), entao o brilho
 * corre exatamente em cima da linha original.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { L, Plate, box, words } from "../lib/Layer";
import { Sfx } from "../lib/Sfx";
import { fadeInUp, float, popIn, pulse, ramp, sp } from "../lib/anim";
import { WORD_STEP, type SceneConfig } from "../config";
import ROUTE from "../../public/layers/s4/route.json";

const PTS = ROUTE.points as [number, number][];

const T = {
  map: 4,
  h1: 12,
  h2: 22,
  sub: 34,
  labels: 56,
  /** zoom no mapa */
  zoomIn: 66,
  zoomHold: 150,
  zoomOut: 168,
  /** rota acendendo e caixa viajando */
  route: 74,
  routeRun: 54,
};

/** Ponto do caminho em t (0..1). */
const at = (t: number): [number, number] => {
  const i = Math.min(PTS.length - 1, Math.max(0, t * (PTS.length - 1)));
  const a = PTS[Math.floor(i)];
  const b = PTS[Math.min(PTS.length - 1, Math.ceil(i))];
  const k = i - Math.floor(i);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
};

const pathD = PTS.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
const LEN = PTS.reduce(
  (a, p, i) => (i ? a + Math.hypot(p[0] - PTS[i - 1][0], p[1] - PTS[i - 1][1]) : 0),
  0
);

export const Scene4: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const h1 = words("s4", "h1");
  const h2 = words("s4", "h2");
  const subs = [1, 2, 3, 4].flatMap((i) => words("s4", `s${i}`));
  const subStarts: number[] = [];
  {
    let acc = T.sub;
    [1, 2, 3, 4].forEach((i) => {
      words("s4", `s${i}`).forEach(() => {
        subStarts.push(acc);
        acc += WORD_STEP;
      });
      acc += 3; // respiro entre as linhas
    });
  }

  const prog = ramp(frame, 0, cfg.duration);
  const rp = ramp(frame, T.route, T.route + T.routeRun);

  // aproximacao: entra, segura, e solta no fim da cena
  const zoom = interpolate(
    frame,
    [T.zoomIn, T.zoomIn + 34, T.zoomHold, T.zoomOut + 20],
    [1, 1.2, 1.2, 1.06],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const mid = at(0.5);
  const camX = interpolate(zoom, [1, 1.2], [0, (540 - mid[0]) * 0.34]);
  const camY = interpolate(zoom, [1, 1.2], [0, (960 - mid[1]) * 0.34]);
  const cam = `translate3d(${camX.toFixed(1)}px,${camY.toFixed(1)}px,0) scale(${zoom.toFixed(3)})`;

  const mapP = sp(frame, fps, T.map, "heavy");
  const head = at(rp);
  // a caixa parte de Goiania e assenta na posicao original da arte
  const boxB = box("s4", "box");
  const homeX = boxB.x + boxB.w / 2;
  const homeY = boxB.y + boxB.h / 2;
  const travel = ramp(frame, T.route + 4, T.route + T.routeRun);
  const bx = interpolate(travel, [0, 1], [ROUTE.a[0] - homeX + 40, 0]);
  const by = interpolate(travel, [0, 1], [ROUTE.a[1] - homeY - 30, 0]);
  const boxBlur = (1 - travel) * (frame > T.route ? 9 : 0);
  const arrive = pulse(frame, T.route + T.routeRun, 3, 22);

  return (
    <AbsoluteFill>
      <Plate scene="s4" zoom={cfg.bgZoom[0] + (cfg.bgZoom[1] - cfg.bgZoom[0]) * prog} />

      {/* bloco do mapa: mapa + rota + pontos + caixa se movem juntos no zoom */}
      <AbsoluteFill style={{ transform: cam, transformOrigin: `${mid[0]}px ${mid[1]}px` }}>
        <L
          scene="s4"
          name="map"
          a={{
            opacity: Math.min(1, mapP * 1.6),
            transform: `scale(${(0.94 + 0.06 * mapP).toFixed(3)})`,
          }}
          extra={float(frame - T.map, 2, 4, 0.35)}
        />

        {/* rota acendendo por cima do traco original */}
        <svg
          width={1080}
          height={1920}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <defs>
            <filter id="rglow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={pathD}
            fill="none"
            stroke="#eaf4ff"
            strokeWidth={7}
            strokeLinecap="round"
            filter="url(#rglow)"
            strokeDasharray={LEN}
            strokeDashoffset={LEN * (1 - rp)}
            opacity={rp > 0 ? 0.95 : 0}
          />
          <path
            d={pathD}
            fill="none"
            stroke="#7fd0ff"
            strokeWidth={14}
            strokeLinecap="round"
            filter="url(#rglow)"
            strokeDasharray={`${LEN * 0.06} ${LEN}`}
            strokeDashoffset={LEN * (0.06 - rp)}
            opacity={rp > 0 && rp < 1 ? 0.85 : 0}
          />
        </svg>

        {/* cabeca luminosa do traco */}
        {rp > 0 && rp < 1 && (
          <div
            style={{
              position: "absolute",
              left: head[0] - 26,
              top: head[1] - 26,
              width: 52,
              height: 52,
              borderRadius: 26,
              background:
                "radial-gradient(circle, #ffffff 0%, #7fd0ff 40%, rgba(60,150,255,0) 72%)",
            }}
          />
        )}

        <L scene="s4" name="dot_go" a={popIn(sp(frame, fps, T.labels, "punch"), 0.2)} />
        <L scene="s4" name="lbl_go" a={fadeInUp(sp(frame, fps, T.labels + 2, "snappy"), 16)} />
        <L
          scene="s4"
          name="dot_sp"
          a={popIn(sp(frame, fps, T.route + T.routeRun - 6, "punch"), 0.2)}
          style={{
            filter: `drop-shadow(0 0 ${(arrive * 26).toFixed(1)}px rgba(140,210,255,.95))`,
          }}
        />
        <L
          scene="s4"
          name="lbl_sp"
          a={fadeInUp(sp(frame, fps, T.route + T.routeRun - 3, "snappy"), 16)}
        />

        {/* a caixa atravessa o mapa e para no lugar original */}
        <L
          scene="s4"
          name="box"
          a={{
            opacity: Math.min(1, ramp(frame, T.route, T.route + 8) * 1.2),
            transform: `translate3d(${bx.toFixed(1)}px,${by.toFixed(1)}px,0) scale(${(
              0.62 +
              0.38 * travel
            ).toFixed(3)})`,
          }}
          extra={float(frame - T.route - T.routeRun, 3, 5, 0.5)}
          style={{ filter: boxBlur > 0.1 ? `blur(${boxBlur.toFixed(1)}px)` : undefined }}
        />
      </AbsoluteFill>

      {/* textos da esquerda, palavra por palavra */}
      {h1.map((n, i) => (
        <L
          key={n}
          scene="s4"
          name={n}
          a={fadeInUp(sp(frame, fps, T.h1 + i * (WORD_STEP + 2), "punch"), 46)}
        />
      ))}
      {h2.map((n, i) => (
        <L
          key={n}
          scene="s4"
          name={n}
          a={fadeInUp(sp(frame, fps, T.h2 + i * (WORD_STEP + 2), "punch"), 46)}
        />
      ))}
      {subs.map((n, i) => (
        <L
          key={n}
          scene="s4"
          name={n}
          a={fadeInUp(sp(frame, fps, subStarts[i], "snappy"), 24)}
        />
      ))}

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={1} name="glitch" gain={0.7} />
      <Sfx at={T.map} name="bass_hit" gain={0.7} />
      {h1.map((n, i) => (
        <React.Fragment key={n}>
          <Sfx at={T.h1 + i * (WORD_STEP + 2) - 2} name="whoosh_short" gain={0.6} />
          <Sfx at={T.h1 + i * (WORD_STEP + 2)} name="pop_ui" />
        </React.Fragment>
      ))}
      {h2.map((n, i) => (
        <React.Fragment key={n}>
          <Sfx at={T.h2 + i * (WORD_STEP + 2) - 2} name="whoosh_short" gain={0.6} />
          <Sfx at={T.h2 + i * (WORD_STEP + 2)} name="impact" gain={0.55} />
        </React.Fragment>
      ))}
      {subs.map((n, i) => (
        <Sfx key={n} at={subStarts[i]} name="soft_pop" gain={0.6} />
      ))}
      <Sfx at={T.labels} name="tap" />
      <Sfx at={T.zoomIn} name="riser" gain={0.6} />
      <Sfx at={T.route} name="swipe" />
      <Sfx at={T.route} name="whoosh_short" />
      <Sfx at={T.route + T.routeRun} name="impact" gain={0.7} />
      <Sfx at={T.route + T.routeRun} name="success" gain={0.7} />
      <Sfx at={T.route + T.routeRun + 4} name="sparkle" gain={0.6} />
      <Sfx at={cfg.duration - 14} name="reverse_whoosh" />
    </AbsoluteFill>
  );
};
