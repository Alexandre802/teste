/**
 * CENA 2 - "+100.000 VOLUMES TODOS OS MESES"
 *
 * O numero conta ate 100.000 sem perder o visual de pilhas de caixa: os
 * digitos da contagem usam a MESMA textura recortada da arte. Ao chegar no
 * valor, o contador funde no recorte original - o repouso e pixel a pixel
 * igual a imagem de referencia.
 */
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { L, Plate, words } from "../lib/Layer";
import { Sfx, SfxEach } from "../lib/Sfx";
import { backInDown, fadeInUp, float, popIn, pulse, ramp, sp } from "../lib/anim";
import { COUNTER, WORD_STEP, type SceneConfig } from "../config";
import DIGITS from "../../public/layers/s2/digits.json";

const T = { logo: 2, sub: 96, boxes: 8 };

/** Caixas soltas ao fundo: cada uma com sua profundidade e fase. */
const FLOATERS = [
  { name: "boxA", at: 8, depth: 26, dir: -1 as const },
  { name: "boxB", at: 12, depth: -22, dir: 1 as const },
  { name: "boxC", at: 16, depth: 18, dir: -1 as const },
  { name: "boxD", at: 10, depth: -30, dir: -1 as const },
  { name: "boxE", at: 20, depth: 24, dir: 1 as const },
  { name: "boxF", at: 14, depth: -26, dir: 1 as const },
  { name: "boxG", at: 18, depth: 20, dir: 1 as const },
];

/** Formata no padrao brasileiro: 100000 -> "100.000". */
const brl = (n: number) =>
  Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/**
 * Contador com os digitos texturizados. A largura acompanha a quantidade de
 * casas, entao o numero "cresce" como um contador de verdade.
 */
const Counter: React.FC<{ value: number; opacity: number; scale: number; blur: number }> = ({
  value,
  opacity,
  scale,
  blur,
}) => {
  const chars = brl(value).split("");
  const [cw, ch] = DIGITS.cell as [number, number];
  const [dw, dh] = DIGITS.digit as [number, number];

  // avancos medidos no proprio numero da arte, para o contador ocupar
  // exatamente o mesmo espaco que "+100.000" ocupa no fim
  const advD = DIGITS.advDigit;
  const advDot = DIGITS.advDot;
  const imgW = advD * (cw / dw);
  const imgH = DIGITS.digitH * (ch / dh);

  const width = chars.reduce((a, c) => a + (c === "." ? advDot : advD), 0);
  let x = DIGITS.centerX - width / 2;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: `${DIGITS.centerX}px ${DIGITS.centerY}px`,
        filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
      }}
    >
      {chars.map((c, i) => {
        const left = x;
        x += c === "." ? advDot : advD;
        if (c === ".")
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: left + advDot * 0.16,
                top: DIGITS.centerY + DIGITS.digitH * 0.3,
                width: advDot * 0.62,
                height: advDot * 0.62,
                borderRadius: 8,
                background: "#2f6ff0",
                boxShadow: "0 12px 26px rgba(3,10,45,.7)",
              }}
            />
          );
        return (
          <Img
            key={i}
            src={staticFile(`layers/s2/digits/${c}.png`)}
            style={{
              position: "absolute",
              left: left - (imgW - advD) / 2,
              top: DIGITS.centerY - imgH / 2,
              width: imgW,
              height: imgH,
            }}
          />
        );
      })}
    </div>
  );
};

export const Scene2: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sub = words("s2", "sub");

  // curva da contagem: dispara rapido e freia no fim (easing de desaceleracao)
  const cp = ramp(frame, COUNTER.start, COUNTER.start + COUNTER.run);
  const eased = 1 - Math.pow(1 - cp, 3.2);
  const value = Math.min(COUNTER.target, Math.round(eased * COUNTER.target));

  // troca contador -> arte original
  const handoff = ramp(frame, COUNTER.settle - 5, COUNTER.settle + 5);
  const land = pulse(frame, COUNTER.settle, 3, 20);
  const speedBlur = (1 - cp) * (frame > COUNTER.start ? 5 : 0);

  const counterScale =
    interpolate(cp, [0, 1], [0.86, 1], { extrapolateRight: "clamp" }) +
    land * 0.04;

  const numberP = sp(frame, fps, COUNTER.settle - 4, "punch");
  const sceneProg = ramp(frame, 0, cfg.duration);

  return (
    <AbsoluteFill>
      <Plate
        scene="s2"
        zoom={cfg.bgZoom[0] + (cfg.bgZoom[1] - cfg.bgZoom[0]) * sceneProg}
      />

      {/* caixas soltas com paralaxe */}
      {FLOATERS.map((f) => (
        <L
          key={f.name}
          scene="s2"
          name={f.name}
          a={popIn(sp(frame, fps, f.at, "soft"), 0.4)}
          extra={`${float(frame - f.at, 7, 9, 0.5, f.at)} translate3d(0,${(
            sceneProg * f.depth
          ).toFixed(1)}px,0) rotate(${(Math.sin(frame / 42 + f.at) * 3 * f.dir).toFixed(2)}deg)`}
        />
      ))}

      <L scene="s2" name="logo" a={backInDown(sp(frame, fps, T.logo, "snappy"), 260)} />

      {/* fase 1: contando */}
      {handoff < 1 && (
        <Counter
          value={value}
          opacity={1 - handoff}
          scale={counterScale}
          blur={speedBlur}
        />
      )}

      {/* fase 2: o numero real da arte, intocado */}
      {handoff > 0 && (
        <L
          scene="s2"
          name="number"
          a={{
            opacity: handoff,
            transform: `scale(${(0.96 + 0.04 * Math.min(1, numberP)).toFixed(3)})`,
          }}
          extra={float(frame - COUNTER.settle, 2, 4, 0.4)}
          style={{ filter: `brightness(${1 + land * 0.35})` }}
        />
      )}

      {/* clarao no instante em que crava o valor */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(48% 26% at 50% 46%, #bcd8ff, rgba(60,120,255,0) 72%)",
          opacity: land * 0.5,
          mixBlendMode: "screen",
        }}
      />

      {/* legenda palavra por palavra */}
      {sub.map((n, i) => (
        <L
          key={n}
          scene="s2"
          name={n}
          a={fadeInUp(sp(frame, fps, T.sub + i * WORD_STEP, "punch"), 34)}
        />
      ))}

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={0} name="glitch" gain={0.8} />
      <Sfx at={T.logo + 2} name="impact" gain={0.7} />
      <Sfx at={COUNTER.start - 6} name="riser" />
      {/* ticks acompanhando a contagem, mais espacados conforme desacelera */}
      <SfxEach
        at={[0, 0.18, 0.34, 0.48, 0.6, 0.7, 0.79, 0.86, 0.92, 0.97].map(
          (t) => COUNTER.start + Math.round(t * COUNTER.run)
        )}
        name="tick"
        gain={0.8}
      />
      <Sfx at={COUNTER.settle} name="impact" />
      <Sfx at={COUNTER.settle} name="sub_boom" />
      <Sfx at={COUNTER.settle + 3} name="sparkle" gain={0.8} />
      {sub.map((n, i) => (
        <Sfx key={n} at={T.sub + i * WORD_STEP} name="pop_ui" gain={0.8} />
      ))}
      <Sfx at={cfg.duration - 14} name="reverse_whoosh" />
    </AbsoluteFill>
  );
};
