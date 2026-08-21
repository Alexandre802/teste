/**
 * CENA 6 - Encerramento: "TRÊS ESTRELAS - Logística para quem vende grande."
 *
 * A cena mais dinamica: o galpao sobe, o logo cai com mola, o nome bate na
 * tela em duas batidas, a tarja vermelha abre por wipe e as notificacoes
 * pipocam nos quatro cantos. Fecha com sting de marca.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { L, Plate } from "../lib/Layer";
import { Sfx } from "../lib/Sfx";
import {
  backInDown,
  fadeInUp,
  float,
  popIn,
  pulse,
  ramp,
  slam,
  slideIn3d,
  sp,
} from "../lib/anim";
import { type SceneConfig } from "../config";

const T = {
  ware: 0,
  logo: 6,
  big1: 22,
  big2: 32,
  tag: 46,
  notifs: 40,
  props: 46,
  sting: 108,
};

const NOTIFS = [
  { name: "ntl", dir: -1 as const, at: 0 },
  { name: "ntr", dir: 1 as const, at: 6 },
  { name: "nbl", dir: -1 as const, at: 12 },
  { name: "nbr", dir: 1 as const, at: 18 },
];

const PROPS = [
  { name: "boxTR", at: 0, rot: 1 },
  { name: "boxBL", at: 6, rot: -1 },
  { name: "pinL", at: 12, rot: -1 },
  { name: "pinR", at: 16, rot: 1 },
];

export const Scene6: React.FC<{ cfg: SceneConfig }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prog = ramp(frame, 0, cfg.duration);

  const hit1 = pulse(frame, T.big1 + 2, 3, 20);
  const hit2 = pulse(frame, T.big2 + 2, 3, 20);
  const sting = pulse(frame, T.sting, 6, 40);

  // respiro final: tudo aproxima de leve no fecho
  const outro = interpolate(frame, [T.sting - 10, cfg.duration], [1, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tagP = sp(frame, fps, T.tag, "snappy");

  return (
    <AbsoluteFill>
      <Plate scene="s6" zoom={cfg.bgZoom[0] + (cfg.bgZoom[1] - cfg.bgZoom[0]) * prog} />

      <AbsoluteFill style={{ transform: `scale(${outro.toFixed(3)})` }}>
        {/* galpao e caminhao sobem da base */}
        <L
          scene="s6"
          name="ware"
          origin="center bottom"
          a={fadeInUp(sp(frame, fps, T.ware, "heavy"), 160)}
        />

        {/* adereços flutuando */}
        {PROPS.map((p) => (
          <L
            key={p.name}
            scene="s6"
            name={p.name}
            a={popIn(sp(frame, fps, T.props + p.at, "snappy"), 0.3)}
            extra={`${float(frame - T.props - p.at, 6, 9, 0.55, p.at)} rotate(${(
              Math.sin(frame / 46 + p.at) * 4 * p.rot
            ).toFixed(2)}deg)`}
          />
        ))}

        {/* logo cai e assenta */}
        <L
          scene="s6"
          name="logo"
          a={backInDown(sp(frame, fps, T.logo, "punch"), 420)}
          extra={float(frame - T.logo, 2, 5, 0.4)}
        />

        {/* o nome bate na tela em duas batidas */}
        <L
          scene="s6"
          name="big1"
          a={slam(sp(frame, fps, T.big1, "punch"), 1.7)}
          style={{ filter: `brightness(${1 + hit1 * 0.4})` }}
        />
        <L
          scene="s6"
          name="big2"
          a={slam(sp(frame, fps, T.big2, "punch"), 1.7)}
          style={{ filter: `brightness(${1 + hit2 * 0.4})` }}
        />

        {/* tarja vermelha abrindo da esquerda para a direita */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 ${((1 - Math.min(1, tagP * 1.15)) * 100).toFixed(2)}% 0 0)`,
          }}
        >
          <L
            scene="s6"
            name="tag"
            origin="left center"
            a={{
              opacity: 1,
              transform: `scaleY(${(0.86 + 0.14 * Math.min(1, tagP * 1.4)).toFixed(3)})`,
            }}
          />
        </div>

        {/* notificacoes pipocando nos cantos */}
        {NOTIFS.map((n) => (
          <L
            key={n.name}
            scene="s6"
            name={n.name}
            a={slideIn3d(sp(frame, fps, T.notifs + n.at, "punch"), n.dir, 220)}
            extra={float(frame - T.notifs - n.at, 5, 6, 0.6, n.at)}
          />
        ))}
      </AbsoluteFill>

      {/* brilhos das batidas e do sting final */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(70% 45% at 50% 46%, #cfe4ff, rgba(40,90,220,0) 72%)",
          opacity: (hit1 + hit2) * 0.2 + sting * 0.26,
          mixBlendMode: "screen",
        }}
      />

      {/* ------------------------------------------------------------ audio */}
      <Sfx at={0} name="whoosh_trans" />
      <Sfx at={0} name="sub_boom" />
      <Sfx at={T.logo} name="impact" gain={0.8} />
      <Sfx at={T.big1 - 5} name="reverse_whoosh" />
      <Sfx at={T.big1} name="impact" />
      <Sfx at={T.big1} name="bass_hit" />
      <Sfx at={T.big2 - 4} name="whoosh_short" />
      <Sfx at={T.big2} name="impact" />
      <Sfx at={T.big2} name="sub_boom" gain={0.8} />
      <Sfx at={T.tag - 3} name="swipe" />
      <Sfx at={T.tag} name="pop_ui" />
      {NOTIFS.map((n) => (
        <React.Fragment key={n.name}>
          <Sfx at={T.notifs + n.at - 2} name="whoosh_short" gain={0.6} />
          <Sfx at={T.notifs + n.at} name="notif" gain={0.85} />
        </React.Fragment>
      ))}
      {PROPS.map((p) => (
        <Sfx key={p.name} at={T.props + p.at} name="soft_pop" gain={0.7} />
      ))}
      <Sfx at={T.sting - 22} name="riser" />
      <Sfx at={T.sting} name="logo_sting" />
      <Sfx at={T.sting} name="sparkle" gain={0.8} />
    </AbsoluteFill>
  );
};
