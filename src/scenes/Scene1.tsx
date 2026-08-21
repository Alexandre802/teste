/**
 * CENA 1 - "VOCÊ VENDE. A GENTE FAZ CHEGAR."
 *
 * A arte se monta em faixas: logo, titulo palavra por palavra, os celulares
 * subindo e os cards de notificacao entrando pelas laterais. Dentro das
 * telas, uma cortina da cor do proprio app recua e os pedidos vao surgindo
 * um a um - sao os pixels originais aparecendo, nada foi recriado.
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
  slice,
  type Step,
} from "../lib/Art";
import { Sfx } from "../lib/Sfx";
import { camera, pulse, punch, ramp, stepWipe } from "../lib/anim";
import { type SceneConfig } from "../config";

const T = { logo: 0, h1: 12, h2: 28, cascade: 46, sweep: 156 };

/**
 * A metade de baixo se monta numa cascata so: a borda desce em degraus e
 * vai descobrindo, na ordem, o topo dos celulares, a primeira notificacao,
 * os cabecalhos, os pedidos e as demais notificacoes. Cada degrau tem som.
 */
const CASCADE = [
  { at: 46, to: 812, sfx: "notif" },      // topo dos celulares + 1a notificacao
  { at: 60, to: 956, sfx: "tap" },        // cabecalhos das listas
  { at: 72, to: 1014, sfx: "notif" },     // 2a notificacao
  { at: 84, to: 1128, sfx: "tap" },       // 1o pedido
  { at: 96, to: 1200, sfx: "notif" },     // 3a notificacao
  { at: 108, to: 1300, sfx: "tap" },      // 2o pedido
  { at: 120, to: 1432, sfx: "tap" },      // 3o pedido
  { at: 132, to: 1920, sfx: "soft_pop" }, // barras de navegacao e base
] as const;
const LOWER = band(680, 1920);

const STEPS: Step[] = [
  // logo
  { r: band(0, 310), at: T.logo, dur: 12, dir: "down", dy: -26 },
  // "VOCÊ VENDE." - uma palavra por vez
  { r: slice(0, 310, 514, 532), at: T.h1, dur: 8, dir: "right", dx: -30 },
  { r: slice(514, 310, 1080, 532), at: T.h1 + 7, dur: 8, dir: "right", dx: -30 },
  // "A GENTE FAZ CHEGAR."
  { r: slice(0, 532, 206, 680), at: T.h2, dur: 7, dir: "right", dx: -22 },
  { r: slice(206, 532, 489, 680), at: T.h2 + 5, dur: 7, dir: "right", dx: -22 },
  { r: slice(489, 532, 658, 680), at: T.h2 + 10, dur: 7, dir: "right", dx: -22 },
  { r: slice(658, 532, 1080, 680), at: T.h2 + 15, dur: 7, dir: "right", dx: -22 },
];

export const Scene1: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const cam = camera(frame, cfg);

  const y = stepWipe(frame, LOWER.y, CASCADE.map((c) => ({ at: c.at, to: c.to })), 11);
  const lowerP = (y - LOWER.y) / LOWER.h;
  const land = pulse(frame, T.cascade + 6, 3, 16);

  return (
    <AbsoluteFill>
      <Backdrop scene="s1" />
      <Build scene="s1" steps={STEPS} frame={frame} cam={cam} fillAt={CASCADE[CASCADE.length - 1].at + 12} />

      {/* a cascata: celulares, pedidos e notificacoes descobertos na ordem */}
      <Reveal scene="s1" r={LOWER} p={lowerP} dir="down" soft={22} cam={cam} />

      {/* contadores das listas dao uma batida quando o cabecalho aparece */}
      {(["sh_badge", "ml_badge", "se_badge"] as const).map((n, i) => (
        <Piece key={n} scene="s1" name={n} scale={punch(frame, 68 + i * 4, 1.22)} cam={cam} />
      ))}

      {/* cada notificacao pisca quando a borda passa por ela */}
      {(["nl1", "nr1", "nl2", "nr2", "nl3", "nr3"] as const).map((n, i) => {
        const at = [50, 53, 76, 79, 100, 103][i];
        return (
          <Piece
            key={n}
            scene="s1"
            name={n}
            scale={punch(frame, at, 1.1)}
            glow={pulse(frame, at, 2, 12) * 0.22}
            cam={cam}
          />
        );
      })}

      <Flash p={land} spread="60% 34% at 50% 62%" strength={0.26} />
      <Sweep p={ramp(frame, T.sweep, T.sweep + 26)} strength={0.3} />

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={0} name="sub_boom" gain={0.8} />
      <Sfx at={T.logo + 4} name="impact" gain={0.75} />
      <Sfx at={T.h1} name="whoosh_short" />
      <Sfx at={T.h1} name="pop_ui" />
      <Sfx at={T.h1 + 7} name="whoosh_short" />
      <Sfx at={T.h1 + 7} name="pop_ui" />
      {[0, 5, 10, 15].map((d) => (
        <Sfx key={d} at={T.h2 + d} name="soft_pop" gain={0.9} />
      ))}
      <Sfx at={T.cascade - 8} name="reverse_whoosh" />
      <Sfx at={T.cascade} name="whoosh_trans" />
      <Sfx at={T.cascade + 2} name="bass_hit" />
      {CASCADE.map((c) => (
        <React.Fragment key={c.at}>
          <Sfx at={c.at + 4} name={c.sfx} gain={0.8} />
          <Sfx at={c.at + 4} name="tick" gain={0.5} />
        </React.Fragment>
      ))}
      <Sfx at={T.sweep} name="sparkle" gain={0.5} />
      <Sfx at={cfg.duration - 16} name="riser" gain={0.7} />
    </AbsoluteFill>
  );
};
