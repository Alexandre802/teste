/**
 * CENA 5 - "ENTREGAR BEM TAMBÉM É VENDER."
 *
 * Primeiro a imagem inteira se monta: titulo palavra por palavra, domo,
 * caixa, escudo e os quatro cards entrando pelas laterais. So depois a
 * linha do card de status percorre Pedido enviado -> Em transporte ->
 * ENTREGUE, e a camera aproxima para acompanhar esse percurso.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { L, Plate, box, words } from "../lib/Layer";
import { Sfx } from "../lib/Sfx";
import { fadeInUp, float, popIn, pulse, ramp, slideIn3d, sp, zoomIn } from "../lib/anim";
import { CARD_STEP, WORD_STEP, type SceneConfig } from "../config";

const T = {
  logo: 2,
  h1: 10,
  h2: 26,
  dome: 34,
  cbox: 42,
  shield: 58,
  cards: 44,
  status: 82,
  /** rastreio: bolinha e texto de cada etapa + trecho de linha */
  step: [
    { dot: 106, txt: 110, line: 118 },
    { dot: 142, txt: 146, line: 154 },
    { dot: 178, txt: 182, line: -1 },
  ],
  lineRun: 22,
  stars: 196,
  zoomIn: 104,
  zoomOut: 190,
};

const CARDS = [
  { name: "c_tl", dir: -1 as const },
  { name: "c_tr", dir: 1 as const },
  { name: "c_bl", dir: -1 as const },
  { name: "c_br", dir: 1 as const },
];

export const Scene5: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const h1 = words("s5", "h1");
  const h2 = words("s5", "h2");
  const prog = ramp(frame, 0, cfg.duration);

  const lineB = box("s5", "s_line");
  /** A linha e um traco unico: cada etapa revela a sua metade. */
  const lineP = (i: number) =>
    T.step[i].line < 0 ? 1 : ramp(frame, T.step[i].line, T.step[i].line + T.lineRun);
  const reveal = Math.min(1, (lineP(0) + lineP(1)) / 2);

  // aproximacao acompanhando o percurso da linha
  const zoom = interpolate(
    frame,
    [T.zoomIn, T.zoomIn + 30, T.zoomOut, T.zoomOut + 26],
    [1, 1.2, 1.2, 1.02],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const focusX = lineB.x + lineB.w / 2 + 60;
  const focusY = lineB.y + lineB.h / 2;
  const camX = interpolate(zoom, [1, 1.2], [0, (540 - focusX) * 0.45]);
  const camY = interpolate(zoom, [1, 1.2], [0, (960 - focusY) * 0.45]);

  // o topo abre espaco quando a camera fecha no percurso da linha
  const focusFade =
    1 - 0.92 * ramp(frame, T.zoomIn, T.zoomIn + 26) * (1 - ramp(frame, T.zoomOut, T.zoomOut + 20));

  const domeP = sp(frame, fps, T.dome, "heavy");
  const shieldGlow = pulse(frame, T.shield, 4, 26);
  const delivered = pulse(frame, T.step[2].dot, 4, 30);

  return (
    <AbsoluteFill>
      <Plate scene="s5" zoom={cfg.bgZoom[0] + (cfg.bgZoom[1] - cfg.bgZoom[0]) * prog} />

      <AbsoluteFill
        style={{
          transform: `translate3d(${camX.toFixed(1)}px,${camY.toFixed(1)}px,0) scale(${zoom.toFixed(3)})`,
          transformOrigin: `${focusX}px ${focusY}px`,
        }}
      >
        <L
          scene="s5"
          name="logo"
          a={{ ...fadeInUp(sp(frame, fps, T.logo, "snappy"), -60), opacity: fadeInUp(sp(frame, fps, T.logo, "snappy"), -60).opacity * focusFade }}
        />

        {/* titulo palavra por palavra */}
        {h1.map((n, i) => (
          <L
            key={n}
            scene="s5"
            name={n}
            a={{
              ...fadeInUp(sp(frame, fps, T.h1 + i * (WORD_STEP + 2), "punch"), 44),
              opacity:
                fadeInUp(sp(frame, fps, T.h1 + i * (WORD_STEP + 2), "punch"), 44).opacity *
                focusFade,
            }}
          />
        ))}
        {h2.map((n, i) => (
          <L
            key={n}
            scene="s5"
            name={n}
            a={{
              ...fadeInUp(sp(frame, fps, T.h2 + i * (WORD_STEP + 2), "punch"), 44),
              opacity:
                fadeInUp(sp(frame, fps, T.h2 + i * (WORD_STEP + 2), "punch"), 44).opacity *
                focusFade,
            }}
          />
        ))}

        {/* domo -> caixa -> escudo, nessa ordem de profundidade */}
        <L
          scene="s5"
          name="dome"
          a={{
            opacity: Math.min(1, domeP * 1.5),
            transform: `scale(${(0.82 + 0.18 * domeP).toFixed(3)})`,
          }}
          extra={`rotate(${(Math.sin(frame / 60) * 1.2).toFixed(2)}deg)`}
        />
        <L
          scene="s5"
          name="cbox"
          origin="center bottom"
          a={zoomIn(sp(frame, fps, T.cbox, "punch"), 0.6)}
          extra={float(frame - T.cbox, 3, 6, 0.45)}
        />
        <L
          scene="s5"
          name="shield"
          a={popIn(sp(frame, fps, T.shield, "punch"), 0.35)}
          extra={float(frame - T.shield, 2, 5, 0.6)}
          style={{
            filter: `drop-shadow(0 0 ${(shieldGlow * 26).toFixed(1)}px rgba(120,200,255,.95))`,
          }}
        />

        {/* os quatro cards entram pelas laterais, em cascata */}
        {CARDS.map((c, i) => (
          <L
            key={c.name}
            scene="s5"
            name={c.name}
            a={slideIn3d(sp(frame, fps, T.cards + i * CARD_STEP, "snappy"), c.dir, 200)}
            extra={float(frame - T.cards - i * CARD_STEP, 3, 5, 0.4, i * 2)}
          />
        ))}

        {/* card de status sobe */}
        <L
          scene="s5"
          name="status"
          origin="center bottom"
          a={fadeInUp(sp(frame, fps, T.status, "heavy"), 150)}
        />

        {/* a linha percorre as etapas */}
        <L
          scene="s5"
          name="s_line"
          a={{ opacity: reveal > 0 ? 1 : 0, transform: "none" }}
          style={{ clipPath: `inset(0 0 ${((1 - reveal) * 100).toFixed(2)}% 0)` }}
        />
        {reveal > 0 && reveal < 1 && (
          <div
            style={{
              position: "absolute",
              left: lineB.x + lineB.w / 2 - 15,
              top: lineB.y + lineB.h * reveal - 15,
              width: 30,
              height: 30,
              borderRadius: 15,
              background:
                "radial-gradient(circle, #ffffff 0%, #4fd8ff 45%, rgba(60,180,255,0) 74%)",
            }}
          />
        )}

        {T.step.map((st, i) => (
          <React.Fragment key={i}>
            <L
              scene="s5"
              name={`s_d${i + 1}`}
              a={popIn(sp(frame, fps, st.dot, "punch"), 0.25)}
              style={
                i === 2
                  ? {
                      filter: `drop-shadow(0 0 ${(delivered * 24).toFixed(1)}px rgba(70,240,120,.95))`,
                    }
                  : undefined
              }
            />
            <L
              scene="s5"
              name={`s_t${i + 1}`}
              a={fadeInUp(sp(frame, fps, st.txt, "snappy"), 18)}
            />
          </React.Fragment>
        ))}

        {/* estrelas acendendo uma a uma */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 ${(
              (1 - ramp(frame, T.stars, T.stars + 20)) *
              100
            ).toFixed(2)}% 0 0)`,
          }}
        >
          <L scene="s5" name="stars" a={popIn(sp(frame, fps, T.stars, "punch"), 0.8)} />
        </div>
      </AbsoluteFill>

      {/* clarao no ENTREGUE */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(40% 20% at 50% 84%, #9dffc0, rgba(60,220,120,0) 70%)",
          opacity: delivered * 0.34,
          mixBlendMode: "screen",
        }}
      />

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={1} name="sub_boom" gain={0.7} />
      {h1.map((n, i) => (
        <React.Fragment key={n}>
          <Sfx at={T.h1 + i * (WORD_STEP + 2) - 2} name="whoosh_short" gain={0.6} />
          <Sfx at={T.h1 + i * (WORD_STEP + 2)} name="pop_ui" />
        </React.Fragment>
      ))}
      {h2.map((n, i) => (
        <React.Fragment key={n}>
          <Sfx at={T.h2 + i * (WORD_STEP + 2) - 2} name="whoosh_short" gain={0.6} />
          <Sfx at={T.h2 + i * (WORD_STEP + 2)} name="pop_ui" />
        </React.Fragment>
      ))}
      <Sfx at={T.dome} name="riser" gain={0.55} />
      <Sfx at={T.cbox} name="bass_hit" />
      <Sfx at={T.shield} name="success" gain={0.7} />
      <Sfx at={T.shield} name="sparkle" gain={0.6} />
      {CARDS.map((c, i) => (
        <React.Fragment key={c.name}>
          <Sfx at={T.cards + i * CARD_STEP - 2} name="whoosh_short" gain={0.7} />
          <Sfx at={T.cards + i * CARD_STEP} name="soft_pop" />
        </React.Fragment>
      ))}
      <Sfx at={T.status - 4} name="reverse_whoosh" gain={0.7} />
      <Sfx at={T.status} name="impact" gain={0.6} />
      <Sfx at={T.zoomIn} name="riser" gain={0.5} />
      {T.step.map((st, i) => (
        <React.Fragment key={i}>
          <Sfx at={st.dot} name="tap" />
          <Sfx at={st.dot} name={i === 2 ? "success" : "soft_pop"} />
          {st.line > 0 && <Sfx at={st.line} name="swipe" gain={0.6} />}
        </React.Fragment>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <Sfx key={i} at={T.stars + i * 4} name="tick" gain={0.9} />
      ))}
      <Sfx at={T.stars + 2} name="sparkle" />
      <Sfx at={cfg.duration - 16} name="riser" gain={0.7} />
    </AbsoluteFill>
  );
};
