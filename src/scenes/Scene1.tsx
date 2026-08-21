/**
 * CENA 1 - "VOCÊ VENDE. A GENTE FAZ CHEGAR."
 *
 * Tres celulares (Shopee / Mercado Livre / SHEIN) com os pedidos entrando na
 * tela um a um, e os cards de notificacao caindo pelos lados como alerta de
 * iPhone. O titulo aparece palavra por palavra.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { L, Plate, Clip, words } from "../lib/Layer";
import { Sfx } from "../lib/Sfx";
import {
  backInDown,
  fadeInUp,
  float,
  iosNotif,
  merge,
  popIn,
  pulse,
  ramp,
  slam,
  sp,
} from "../lib/anim";
import { ROW_STEP, WORD_STEP, type SceneConfig } from "../config";

/** Area util de cada tela de app - as linhas entram recortadas por ela. */
const SCREENS = {
  ml: [396, 936, 300, 570] as [number, number, number, number],
  sh: [186, 980, 204, 424] as [number, number, number, number],
  se: [692, 956, 214, 438] as [number, number, number, number],
};

const T = {
  logo: 3,
  h1: 12,
  h2: 27,
  phones: 46,
  badges: 64,
  rows: 70,
  more: 124,
  notifL: 126,
  notifR: 133,
};

/** Cada pedido entra deslizando da direita, como item novo de lista. */
const rowIn = (p: number) => ({
  opacity: Math.min(1, p * 2),
  transform: `translate3d(${((1 - p) * 46).toFixed(1)}px,${((1 - p) * 10).toFixed(
    1
  )}px,0) scale(${(0.94 + 0.06 * p).toFixed(3)})`,
});

export const Scene1: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const w1 = words("s1", "h1");
  const w2 = words("s1", "h2");

  // 3 telas x 3 pedidos, intercalados: os pedidos chegam nos tres apps juntos
  const rows: { name: string; at: number; screen: keyof typeof SCREENS }[] = [];
  (["ml", "sh", "se"] as const).forEach((app, col) => {
    [1, 2, 3].forEach((r, i) => {
      rows.push({
        name: `${app}_row${r}`,
        at: T.rows + i * (ROW_STEP + 4) + col * 4,
        screen: app,
      });
    });
  });

  const phoneP = sp(frame, fps, T.phones, "heavy");
  const flash = pulse(frame, T.phones + 4, 2, 14);

  return (
    <AbsoluteFill>
      <Plate
        scene="s1"
        zoom={
          cfg.bgZoom[0] + (cfg.bgZoom[1] - cfg.bgZoom[0]) * ramp(frame, 0, cfg.duration)
        }
      />

      {/* logo desce e assenta */}
      <L scene="s1" name="logo" a={backInDown(sp(frame, fps, T.logo, "snappy"), 300)} />

      {/* titulo palavra por palavra */}
      {w1.map((n, i) => (
        <L
          key={n}
          scene="s1"
          name={n}
          a={merge(
            slam(sp(frame, fps, T.h1 + i * (WORD_STEP + 2), "punch"), 1.35),
            fadeInUp(sp(frame, fps, T.h1 + i * (WORD_STEP + 2), "punch"), 22)
          )}
        />
      ))}
      {w2.map((n, i) => (
        <L
          key={n}
          scene="s1"
          name={n}
          a={merge(
            popIn(sp(frame, fps, T.h2 + i * WORD_STEP, "punch"), 0.78),
            fadeInUp(sp(frame, fps, T.h2 + i * WORD_STEP, "punch"), 26)
          )}
        />
      ))}

      {/* os tres celulares sobem juntos e ficam respirando */}
      <L
        scene="s1"
        name="phones"
        origin="center bottom"
        a={{
          opacity: Math.min(1, phoneP * 2.2),
          transform: `translate3d(0,${((1 - phoneP) * 300).toFixed(1)}px,0) scale(${(
            0.9 +
            0.1 * phoneP
          ).toFixed(3)})`,
        }}
        extra={float(frame - T.phones, 3, 7, 0.55)}
        style={{ filter: `brightness(${1 + flash * 0.28})` }}
      />

      {/* contadores das telas */}
      {(["ml_badge", "sh_badge", "se_badge"] as const).map((n, i) => (
        <L
          key={n}
          scene="s1"
          name={n}
          a={popIn(sp(frame, fps, T.badges + i * 5, "punch"), 0.2)}
        />
      ))}

      {/* pedidos chegando, recortados pela tela de cada app */}
      {rows.map((r) => (
        <Clip key={r.name} rect={SCREENS[r.screen]}>
          <L scene="s1" name={r.name} a={rowIn(sp(frame, fps, r.at, "snappy"))} />
        </Clip>
      ))}
      <Clip rect={SCREENS.ml}>
        <L scene="s1" name="ml_more" a={fadeInUp(sp(frame, fps, T.more, "soft"), 20)} />
      </Clip>

      {/* notificacoes caindo dos lados, no gesto do iPhone */}
      {["nl1", "nl2", "nl3"].map((n, i) => (
        <L
          key={n}
          scene="s1"
          name={n}
          a={iosNotif(sp(frame, fps, T.notifL + i * 12, "snappy"), 150)}
          extra={float(frame - T.notifL - i * 12, 5, 4, 0.7, i * 1.4)}
        />
      ))}
      {["nr1", "nr2", "nr3"].map((n, i) => (
        <L
          key={n}
          scene="s1"
          name={n}
          a={iosNotif(sp(frame, fps, T.notifR + i * 12, "snappy"), 150)}
          extra={float(frame - T.notifR - i * 12, 5, 4, 0.7, 3 + i * 1.4)}
        />
      ))}

      {/* brilho rapido quando os celulares chegam */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(60% 40% at 50% 62%, #7fb2ff, transparent 70%)",
          opacity: flash * 0.22,
          mixBlendMode: "screen",
        }}
      />

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={0} name="sub_boom" gain={0.8} />
      <Sfx at={T.logo + 3} name="impact" gain={0.8} />
      {w1.map((n, i) => (
        <React.Fragment key={n}>
          <Sfx at={T.h1 + i * (WORD_STEP + 2)} name="whoosh_short" />
          <Sfx at={T.h1 + i * (WORD_STEP + 2) + 1} name="pop_ui" />
        </React.Fragment>
      ))}
      {w2.map((n, i) => (
        <Sfx key={n} at={T.h2 + i * WORD_STEP} name="soft_pop" gain={0.9} />
      ))}
      <Sfx at={T.phones - 8} name="reverse_whoosh" />
      <Sfx at={T.phones} name="whoosh_trans" />
      <Sfx at={T.phones + 2} name="bass_hit" />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} at={T.badges + i * 5} name="soft_pop" gain={0.7} />
      ))}
      {rows.map((r, i) => (
        <React.Fragment key={r.name}>
          <Sfx at={r.at} name={i % 3 === 0 ? "notif" : "tap"} gain={0.75} />
          <Sfx at={r.at} name="tick" gain={0.5} />
        </React.Fragment>
      ))}
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          <Sfx at={T.notifL + i * 12} name="notif" />
          <Sfx at={T.notifL + i * 12 - 3} name="whoosh_short" gain={0.5} />
          <Sfx at={T.notifR + i * 12} name="notif" gain={0.85} />
        </React.Fragment>
      ))}
      <Sfx at={T.more} name="click" />
      {/* leve empurrao final para a proxima cena */}
      <Sfx at={cfg.duration - 16} name="riser" gain={0.7} />
    </AbsoluteFill>
  );
};
