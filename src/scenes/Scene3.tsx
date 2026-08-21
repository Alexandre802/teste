/**
 * CENA 3 - "QUEM VENDE MAIS NÃO PODE ESPERAR MAIS."
 *
 * A tela de "Envio em andamento" ganha vida: a linha do rastreio desce de
 * Pedido vendido -> Separado -> Enviado, acendendo cada bolinha na chegada.
 * Os titulos da direita entram palavra por palavra.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { L, Plate, Clip, box, words } from "../lib/Layer";
import { Sfx } from "../lib/Sfx";
import { fadeInUp, float, popIn, pulse, ramp, slideIn3d, sp } from "../lib/anim";
import { WORD_STEP, type SceneConfig } from "../config";

/** Area branca da lista - o conteudo entra recortado por ela. */
const SCREEN: [number, number, number, number] = [86, 660, 440, 950];

const T = {
  phone: 0,
  logo: 8,
  hdr: 18,
  h1: 30,
  h2: 46,
  sub: 62,
  /** Passos do rastreio: [bolinha, titulo, corpo, inicio da linha] */
  step: [
    { dot: 76, txt: 80, line: 92 },
    { dot: 112, txt: 116, line: 128 },
    { dot: 148, txt: 152, line: -1 },
  ],
  lineRun: 18,
  eta: 168,
};

/** Cabeca luminosa que corre junto com o traco. */
const Head: React.FC<{ name: "lineA" | "lineB"; p: number }> = ({ name, p }) => {
  const b = box("s3", name);
  if (p <= 0 || p >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: b.x + b.w / 2 - 17,
        top: b.y + b.h * p - 17,
        width: 34,
        height: 34,
        borderRadius: 17,
        background: "radial-gradient(circle, #dfffe9 0%, #35c14a 45%, rgba(53,193,74,0) 72%)",
        opacity: 0.95,
      }}
    />
  );
};

export const Scene3: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const h1 = words("s3", "h1");
  const h2 = words("s3", "h2");
  const sub = words("s3", "sub");

  const lineP = (i: number) =>
    T.step[i].line < 0 ? 0 : ramp(frame, T.step[i].line, T.step[i].line + T.lineRun);

  const phoneP = sp(frame, fps, T.phone, "heavy");
  const prog = ramp(frame, 0, cfg.duration);
  // leve aproximacao no celular ao longo da cena
  const push = 1 + prog * 0.022;

  return (
    <AbsoluteFill>
      <Plate scene="s3" zoom={cfg.bgZoom[0] + (cfg.bgZoom[1] - cfg.bgZoom[0]) * prog} />

      <L scene="s3" name="logo" a={fadeInUp(sp(frame, fps, T.logo, "snappy"), -50)} />

      {/* o celular entra pela esquerda com giro em Y */}
      <L
        scene="s3"
        name="phone"
        origin="8% 58%"
        a={slideIn3d(phoneP, -1, 320)}
        extra={`scale(${push.toFixed(3)}) ${float(frame - T.phone, 3, 6, 0.5)}`}
      />

      {/* conteudo do app, recortado pela tela */}
      <Clip rect={SCREEN}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: Math.min(1, phoneP * 2),
            transform: `${slideIn3d(phoneP, -1, 320).transform} scale(${push.toFixed(3)})`,
            transformOrigin: "8% 58%",
          }}
        >
          <L scene="s3" name="hdr_t" a={fadeInUp(sp(frame, fps, T.hdr, "snappy"), 26)} />
          <L scene="s3" name="hdr_s" a={fadeInUp(sp(frame, fps, T.hdr + 5, "snappy"), 22)} />

          {/* tracos do rastreio, revelados de cima para baixo */}
          {(["lineA", "lineB"] as const).map((n, i) => (
            <L
              key={n}
              scene="s3"
              name={n}
              a={{ opacity: lineP(i) > 0 ? 1 : 0, transform: "none" }}
              style={{ clipPath: `inset(0 0 ${((1 - lineP(i)) * 100).toFixed(2)}% 0)` }}
            />
          ))}
          {(["lineA", "lineB"] as const).map((n, i) => (
            <Head key={`h${n}`} name={n} p={lineP(i)} />
          ))}

          {/* bolinhas e textos de cada etapa */}
          {T.step.map((st, i) => {
            const glow = pulse(frame, st.dot, 3, 18);
            return (
              <React.Fragment key={i}>
                <L
                  scene="s3"
                  name={`dot${i + 1}`}
                  a={popIn(sp(frame, fps, st.dot, "punch"), 0.3)}
                  style={{
                    filter: `drop-shadow(0 0 ${(glow * 16).toFixed(1)}px rgba(60,210,90,.95))`,
                  }}
                />
                <L
                  scene="s3"
                  name={`st${i + 1}_t`}
                  a={fadeInUp(sp(frame, fps, st.txt, "snappy"), 18)}
                />
                <L
                  scene="s3"
                  name={`st${i + 1}_b`}
                  a={fadeInUp(sp(frame, fps, st.txt + 4, "snappy"), 16)}
                />
              </React.Fragment>
            );
          })}

          <L scene="s3" name="eta" a={popIn(sp(frame, fps, T.eta, "snappy"), 0.82)} />
        </div>
      </Clip>

      {/* titulos a direita, palavra por palavra */}
      {h1.map((n, i) => (
        <L
          key={n}
          scene="s3"
          name={n}
          a={fadeInUp(sp(frame, fps, T.h1 + i * WORD_STEP, "punch"), 40)}
        />
      ))}
      {h2.map((n, i) => (
        <L
          key={n}
          scene="s3"
          name={n}
          a={fadeInUp(sp(frame, fps, T.h2 + i * WORD_STEP, "punch"), 40)}
        />
      ))}
      {sub.map((n, i) => (
        <L
          key={n}
          scene="s3"
          name={n}
          a={fadeInUp(sp(frame, fps, T.sub + i * WORD_STEP, "soft"), 26)}
        />
      ))}

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={2} name="bass_hit" gain={0.8} />
      <Sfx at={T.logo} name="soft_pop" />
      <Sfx at={T.h1 - 3} name="whoosh_short" gain={0.7} />
      <Sfx at={T.h2 - 3} name="whoosh_short" gain={0.7} />
      {h1.map((n, i) => (
        <Sfx key={`a${n}`} at={T.h1 + i * WORD_STEP} name="pop_ui" gain={0.8} />
      ))}
      {h2.map((n, i) => (
        <Sfx key={`b${n}`} at={T.h2 + i * WORD_STEP} name="pop_ui" gain={0.8} />
      ))}
      {sub.map((n, i) => (
        <Sfx key={`c${n}`} at={T.sub + i * WORD_STEP} name="soft_pop" gain={0.7} />
      ))}
      <Sfx at={T.hdr} name="click" />
      {T.step.map((st, i) => (
        <React.Fragment key={i}>
          <Sfx at={st.dot} name="tap" />
          <Sfx at={st.dot} name={i === 2 ? "success" : "soft_pop"} gain={0.9} />
          {st.line > 0 && <Sfx at={st.line} name="swipe" gain={0.7} />}
        </React.Fragment>
      ))}
      <Sfx at={T.eta} name="notif" />
      <Sfx at={cfg.duration - 15} name="riser" gain={0.6} />
    </AbsoluteFill>
  );
};
