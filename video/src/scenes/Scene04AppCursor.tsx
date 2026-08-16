/**
 * CENA 4 — 0:07,5 a 0:10
 * "Tudo o que você precisa, na palma da mão."
 * Motion: zoom no aparelho, atalhos entrando em sequência e um cursor
 * que percorre o app — abre o crédito, rola a tela e chega no Pix e nas
 * transferências. (Ref.: 430F957D)
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE, map, spr, tween } from "../lib/anim";
import { Backdrop } from "../components/Backdrop";
import { AppScreen, Section } from "../components/AppScreen";
import { PhoneFrame } from "../components/PhoneFrame";
import { Cursor, Waypoint } from "../components/Cursor";
import { MaskLine } from "../components/TextFX";
import { COLORS } from "../config/theme";

const PHONE_W = 620;
const PHONE_X = (1080 - PHONE_W) / 2;
const PHONE_Y = 505;
const BEZEL = PHONE_W * 0.028;
const SCREEN_X = PHONE_X + BEZEL;
const SCREEN_Y = PHONE_Y + BEZEL;
const SCREEN_W = PHONE_W - BEZEL * 2;
const SCREEN_H = PHONE_W * 2.05 - BEZEL * 2;

/** Coreografia do cursor, em coordenadas da cena. */
const CURSOR_PATH: Waypoint[] = [
  { at: 24, x: 880, y: 1560 },
  { at: 50, x: 430, y: 1258 }, // chega no bloco "Cartão de crédito"
  { at: 57, x: 430, y: 1258, click: true },
  { at: 74, x: 560, y: 1290 },
  { at: 78, x: 560, y: 1290, hold: true }, // segura para rolar
  { at: 100, x: 560, y: 980, hold: true },
  { at: 112, x: 400, y: 1120 }, // linha do Pix
  { at: 116, x: 400, y: 1120, click: true },
  { at: 132, x: 400, y: 1268 }, // linha de Transferir
  { at: 137, x: 400, y: 1268, click: true },
  { at: 150, x: 430, y: 1300 },
];

const SCROLL_START = 78;
const SCROLL_END = 102;

export const Scene04AppCursor: React.FC = () => {
  const frame = useCurrentFrame();

  // push-in lento e contínuo no aparelho
  const zoom = interpolate(frame, [0, 150], [0.82, 1.05], {
    easing: EASE.outSoft,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const entry = spr(frame, 0, "heavy");

  const scrollY = interpolate(frame, [SCROLL_START, SCROLL_END], [0, 430], {
    easing: EASE.inOutCubic,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // atalhos entram um a um
  const actionReveal = [0, 1, 2, 3, 4].map((i) => spr(frame, 25 + i * 5, "bouncy"));

  const highlight: Section | null =
    frame >= 100 ? "pix" : frame >= 55 ? "credito" : null;
  const highlightAmount =
    frame >= 100
      ? tween(frame, 100, 116)
      : frame >= 55
        ? tween(frame, 55, 68) * (1 - tween(frame, 88, 100))
        : 0;

  // botão do app pressionado quando o cursor clica
  const pressed =
    frame >= 116 && frame < 124 ? 0 : frame >= 137 && frame < 145 ? 2 : null;

  const glass = tween(frame, 20, 62, { ease: EASE.inOutCubic });

  return (
    <AbsoluteFill>
      <Backdrop parallax={map(tween(frame, 0, 150), -14, 14)} leak={0.22} showDust />

      {/* título */}
      <AbsoluteFill style={{ padding: "132px 84px", zIndex: 5 }}>
        <MaskLine delay={8} size={82}>
          TUDO O QUE VOCÊ
        </MaskLine>
        <MaskLine delay={18} size={82}>
          PRECISA, <span style={{ color: COLORS.neonHot }}>NA PALMA</span>
        </MaskLine>
        <MaskLine delay={28} size={82}>
          DA MÃO.
        </MaskLine>
      </AbsoluteFill>

      {/* aparelho + cursor compartilham o mesmo transform, então o
          ponteiro acompanha o zoom sem sair do lugar certo da tela */}
      <AbsoluteFill
        style={{
          transformOrigin: "50% 62%",
          transform: `scale(${zoom * map(entry, 0.94, 1)}) translateY(${map(entry, 70, 0)}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: PHONE_X,
            top: PHONE_Y,
            opacity: entry,
          }}
        >
          <PhoneFrame width={PHONE_W} glass={glass} glow={0.75}>
            <AppScreen
              width={SCREEN_W}
              height={SCREEN_H}
              scrollY={scrollY}
              actionReveal={actionReveal}
              highlight={highlight}
              highlightAmount={highlightAmount}
              pressed={pressed}
            />
          </PhoneFrame>
        </div>

        <Cursor path={CURSOR_PATH} appearAt={24} size={52} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export { SCREEN_X, SCREEN_Y };
