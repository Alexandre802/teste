/**
 * ============================================================================
 *  CENA 3 — 5/8 "Precisa consultar?" / "Tudo em um só lugar."
 * ============================================================================
 *  Quatro cards brancos entram em sequência, cercados por elementos de UI
 *  (buscas digitando, card de estatística contando, atividade recente).
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE3 } from "../config/copy";
import { Cue, cue } from "../config/sfx";
import { C, FW, TEXT_GLOW_WHITE } from "../config/theme";
import {
  EASE,
  card3dIn,
  countUp,
  float,
  glowPulse,
  ip,
  popIn,
  prog,
  ptNumber,
  spr,
  typewriter,
} from "../lib/anim";
import { fontFamily } from "../lib/fonts";
import { SfxTrack } from "../lib/SfxTrack";
import { SlideHeader } from "../components/Brand";
import { Sparkline } from "../components/Charts";
import { BlueRing, CurvedArrow, GlowBlob, Swoosh } from "../components/Decor";
import { Icon } from "../components/Icons";
import {
  BadgeCircle,
  DarkPanel,
  IconCircle,
  SearchField,
  SkeletonLine,
  WhiteCard,
} from "../components/Primitives";
import { RevealText, SceneShell } from "../components/SceneShell";

// ---------------------------------------------------------------------------
const B = {
  header: 2,
  h1: 4,
  h2: 18,
  decor: 8,
  cards: [52, 74, 96, 118],
  boltBadge: 132,
  search1: 148,
  typing1: 158,
  search2: 178,
  typing2: 190,
  trustCard: 220,
  segCard: 266,
  statCard: 310,
  statCount: 322,
  chartBadge: 358,
  activity: 418,
  arrow: 456,
  footer: 484,
};

const L = {
  headline: { x: 78, y: 246, size: 100, lh: 1.3, ls: -3.6 },
  cards: { x: 282, y: 596, w: 516, h: 134, gap: 30, radius: 30 },
  ring: { x: -286, y: 1316, size: 672, thickness: 100 },
  boltBadge: { x: 138, y: 690, size: 92 },
  search1: { x: 762, y: 692, w: 302 },
  search2: { x: 750, y: 814, w: 314 },
  trustCard: { x: 34, y: 846, w: 254, h: 142 },
  segCard: { x: 768, y: 990, w: 274, h: 138 },
  statCard: { x: 24, y: 1100, w: 272, h: 196 },
  chartBadge: { x: 204, y: 1516, size: 96 },
  activity: { x: 762, y: 1338, w: 288, h: 186 },
  arrow: { x: 862, y: 548, w: 178, h: 146 },
  footer: { y: 1772, size: 46 },
};

export const scene3Cues: Cue[] = [
  cue(B.h1 - 3, "whoosh", 0.9),
  cue(B.h2 - 3, "whoosh", 0.85, 1.1),
  cue(B.h2 + 1, "impact", 0.6),
  ...B.cards.map((f, i) => cue(f, "pop", 1, 1 + i * 0.04)),
  ...B.cards.map((f) => cue(f - 4, "swipe", 0.5)),
  cue(B.boltBadge, "popSoft", 1.1),
  cue(B.search1 - 3, "swipe", 0.7),
  cue(B.typing1, "click"),
  cue(B.typing1 + 10, "tick", 0.8),
  cue(B.search2 - 3, "swipe", 0.7, 1.1),
  cue(B.typing2, "click", 1, 1.05),
  cue(B.typing2 + 10, "tick", 0.8),
  cue(B.trustCard, "pop", 0.9),
  cue(B.segCard, "pop", 0.9, 1.06),
  cue(B.statCard, "popSoft"),
  cue(B.statCount, "tick", 0.6),
  cue(B.chartBadge, "popSoft", 1.1),
  cue(B.activity, "pop", 0.9),
  cue(B.activity + 12, "success", 0.55),
  cue(B.arrow, "whoosh", 0.6, 1.25),
  cue(B.footer, "sparkle", 0.8),
  cue(B.footer + 2, "sub", 0.5),
];

// ---------------------------------------------------------------------------
export const Scene3PrecisaConsultar: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typed1 = typewriter(SCENE3.search, frame, B.typing1, 0.8);
  const typed2 = typewriter(SCENE3.search, frame, B.typing2, 0.86);

  return (
    <SceneShell
      duration={duration}
      enter="zoom"
      exit="push"
      cameraZoom={0.04}
      cameraY={-16}
      background={
        <AbsoluteFill style={{ background: C.bgDark2 }}>
          <GlowBlob
            size={900}
            color="rgba(27,92,255,0.20)"
            style={{ position: "absolute", left: 260, top: 380 }}
          />
          {/* anel azul cheio no canto inferior esquerdo */}
          <div
            style={{
              position: "absolute",
              left: L.ring.x,
              top: L.ring.y,
              opacity: ip(frame, [B.decor, B.decor + 20], [0, 1]),
            }}
          >
            <BlueRing
              size={L.ring.size}
              thickness={L.ring.thickness}
              color={C.blueDeep}
              progress={prog(frame, B.decor, 46)}
            />
          </div>
          {/* swoosh azul saindo do anel */}
          <div style={{ position: "absolute", left: 210, top: 1010 }}>
            <Swoosh
              width={1000}
              height={1000}
              thickness={58}
              color={C.blueDeep}
              progress={prog(frame, B.decor + 6, 52)}
              opacity={0.38}
            />
          </div>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(120% 85% at 50% 42%, rgba(0,0,0,0) 42%, rgba(2,4,10,0.82) 100%)",
            }}
          />
        </AbsoluteFill>
      }
    >
      <SfxTrack cues={scene3Cues} />

      <div style={{ opacity: ip(frame, [B.header, B.header + 12], [0, 1]) }}>
        <SlideHeader badge={SCENE3.badge} />
      </div>

      {/* headline */}
      <div
        style={{
          position: "absolute",
          left: L.headline.x,
          top: L.headline.y,
          zIndex: 4,
          fontFamily,
          fontWeight: FW.bold,
          fontSize: L.headline.size,
          lineHeight: L.headline.lh,
          letterSpacing: L.headline.ls,
        }}
      >
        {SCENE3.headline.map((w, i) => {
          const delay = [B.h1, B.h2][i];
          const isBlue = w.color === "blue";
          const emph = glowPulse(frame - delay, 0.7, 1.05, 140, i);
          return (
            <RevealText key={w.text} delay={delay} frame={frame} fps={fps} rise={0.5}>
              <div
                style={{
                  color: isBlue ? C.blue : C.white,
                  textShadow: isBlue
                    ? `0 0 ${46 * emph}px rgba(27,92,255,${0.34 * emph})`
                    : TEXT_GLOW_WHITE,
                  paddingBottom: 4,
                }}
              >
                {w.text}
              </div>
            </RevealText>
          );
        })}
      </div>

      {/* seta curva superior direita */}
      <div style={{ position: "absolute", left: L.arrow.x, top: L.arrow.y, zIndex: 3 }}>
        <CurvedArrow
          width={L.arrow.w}
          height={L.arrow.h}
          variant="upRight"
          thickness={6}
          progress={prog(frame, B.arrow, 22)}
        />
      </div>

      {/* 4 cards brancos principais */}
      {SCENE3.cards.map((card, i) => {
        const delay = B.cards[i];
        const y = L.cards.y + i * (L.cards.h + L.cards.gap);
        const enter = card3dIn(frame, fps, delay, {
          y: 40,
          x: -110,
          rotateY: 22,
          scale: 0.9,
          preset: "snappy",
        });
        // pulso sutil quando a narração passa por cima
        const pulse = 1 + 0.012 * Math.sin((frame - delay) / 22);
        return (
          <div
            key={card.label}
            style={{
              position: "absolute",
              left: L.cards.x,
              top: y,
              zIndex: 8 - i,
              opacity: enter.opacity,
              transform: `${enter.transform} scale(${pulse})`,
              filter: enter.filter,
            }}
          >
            <WhiteCard
              radius={L.cards.radius}
              style={{
                width: L.cards.w,
                height: L.cards.h,
                display: "flex",
                alignItems: "center",
                gap: 34,
                padding: "0 40px",
                boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  transform: `scale(${0.7 + 0.3 * spr(frame, fps, delay + 5, "bouncy")}) rotate(${ip(frame, [delay + 5, delay + 30], [-18, 0], EASE.out)}deg)`,
                }}
              >
                <IconCircle icon={card.icon} variant="well" size={82} iconSize={44} />
              </div>
              <span
                style={{
                  fontFamily,
                  fontWeight: FW.bold,
                  fontSize: 40,
                  color: C.ink,
                  letterSpacing: -1.1,
                  whiteSpace: "nowrap",
                  opacity: ip(frame, [delay + 4, delay + 16], [0, 1]),
                  transform: `translateX(${ip(frame, [delay + 4, delay + 20], [16, 0], EASE.out)}px)`,
                }}
              >
                {card.label}
              </span>
            </WhiteCard>
          </div>
        );
      })}

      {/* badge raio */}
      <div
        style={{
          position: "absolute",
          left: L.boltBadge.x,
          top: L.boltBadge.y,
          zIndex: 9,
          ...popIn(frame, fps, B.boltBadge, 0.4, "bouncy"),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.boltBadge, 9, 120)}px)` }}>
          <BadgeCircle icon="bolt" size={L.boltBadge.size} glow={glowPulse(frame, 0.7, 1.2, 80)} />
        </div>
      </div>

      {/* buscas */}
      <div
        style={{
          position: "absolute",
          left: L.search1.x,
          top: L.search1.y,
          zIndex: 6,
          ...popIn(frame, fps, B.search1, 0.82),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.search1, 5, 150, 0.5)}px)` }}>
          <SearchField
            text={typed1.visible}
            variant="darkGlass"
            width={L.search1.w}
            fontSize={25}
            caret={frame > B.typing1 && !typed1.done}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: L.search2.x,
          top: L.search2.y,
          zIndex: 7,
          ...popIn(frame, fps, B.search2, 0.82),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.search2, 5, 160, 1.4)}px)` }}>
          <SearchField
            text={typed2.visible}
            variant="light"
            width={L.search2.w}
            fontSize={25}
            caret={frame > B.typing2 && !typed2.done}
          />
        </div>
      </div>

      {/* card "Dados confiáveis" */}
      <div
        style={{
          position: "absolute",
          left: L.trustCard.x,
          top: L.trustCard.y,
          zIndex: 6,
          ...card3dIn(frame, fps, B.trustCard, { y: 40, x: -50, rotateY: -18 }),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.trustCard, 6, 170, 2)}px)` }}>
          <WhiteCard
            style={{ width: L.trustCard.w, height: L.trustCard.h, padding: "24px 26px" }}
            radius={20}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Icon name="shield" size={30} color={C.blue} strokeWidth={2.2} />
              <span
                style={{ fontFamily, fontWeight: FW.semibold, fontSize: 25, color: C.ink }}
              >
                {SCENE3.chips[0].label}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22 }}>
              <SkeletonLine width="100%" height={12} color={C.skeletonLight} />
              <SkeletonLine width="72%" height={12} color={C.skeletonLight} />
              <SkeletonLine width="52%" height={12} color={C.skeletonLight} />
            </div>
          </WhiteCard>
        </div>
      </div>

      {/* card "Segurança total" */}
      <div
        style={{
          position: "absolute",
          left: L.segCard.x,
          top: L.segCard.y,
          zIndex: 6,
          ...card3dIn(frame, fps, B.segCard, { y: 40, x: 60, rotateY: 18 }),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.segCard, 6, 155, 3)}px)` }}>
          <WhiteCard
            style={{ width: L.segCard.w, height: L.segCard.h, padding: "22px 24px" }}
            radius={20}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Icon name="shieldCheck" size={30} color={C.blue} strokeWidth={2.2} />
              <span style={{ fontFamily, fontWeight: FW.semibold, fontSize: 25, color: C.ink }}>
                {SCENE3.chips[1].label}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
              <SkeletonLine width="100%" height={12} color={C.skeletonLight} />
              <SkeletonLine width="64%" height={12} color={C.skeletonLight} />
            </div>
          </WhiteCard>
        </div>
      </div>

      {/* card de estatística com sparkline + contador */}
      <div
        style={{
          position: "absolute",
          left: L.statCard.x,
          top: L.statCard.y,
          zIndex: 6,
          ...card3dIn(frame, fps, B.statCard, { y: 46, x: -60, rotateY: -14 }),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.statCard, 6, 180, 1)}px)` }}>
          <DarkPanel
            style={{ width: L.statCard.w, height: L.statCard.h, padding: "22px 24px" }}
            radius={20}
          >
            <span
              style={{
                fontFamily,
                fontWeight: FW.regular,
                fontSize: 21,
                color: "rgba(200,214,240,0.72)",
              }}
            >
              {SCENE3.stat.label}
            </span>
            <div
              style={{
                fontFamily,
                fontWeight: FW.semibold,
                fontSize: 42,
                color: C.white,
                marginTop: 6,
                letterSpacing: -1,
              }}
            >
              {ptNumber(Math.round(countUp(frame, B.statCount, 44, SCENE3.stat.value)))}
            </div>
            <div style={{ marginTop: 12 }}>
              <Sparkline
                width={L.statCard.w - 48}
                height={46}
                progress={prog(frame, B.statCount + 6, 46)}
                color={C.blueSoft}
              />
            </div>
          </DarkPanel>
        </div>
      </div>

      {/* badge gráfico */}
      <div
        style={{
          position: "absolute",
          left: L.chartBadge.x,
          top: L.chartBadge.y,
          zIndex: 9,
          ...popIn(frame, fps, B.chartBadge, 0.4, "bouncy"),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.chartBadge, 8, 140, 2.2)}px)` }}>
          <BadgeCircle icon="chart" size={L.chartBadge.size} glow={glowPulse(frame, 0.7, 1.2, 95)} />
        </div>
      </div>

      {/* card atividade recente */}
      <div
        style={{
          position: "absolute",
          left: L.activity.x,
          top: L.activity.y,
          zIndex: 6,
          ...card3dIn(frame, fps, B.activity, { y: 44, x: 64, rotateY: 16 }),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.activity, 6, 165, 4)}px)` }}>
          <DarkPanel
            style={{ width: L.activity.w, height: L.activity.h, padding: "22px 24px" }}
            radius={20}
          >
            <span
              style={{
                fontFamily,
                fontWeight: FW.medium,
                fontSize: 23,
                color: "rgba(214,226,250,0.9)",
              }}
            >
              {SCENE3.activity}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
              {[0, 1, 2].map((i) => {
                const d = B.activity + 10 + i * 8;
                const on = ip(frame, [d, d + 10], [0, 1]);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      opacity: on,
                      transform: `translateX(${(1 - on) * 20}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: C.blue,
                        boxShadow: `0 0 ${10 * glowPulse(frame, 0.5, 1, 60, i)}px ${C.blue}`,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
                      <SkeletonLine width={i === 2 ? "58%" : "88%"} height={9} />
                      <SkeletonLine width={i === 2 ? "38%" : "62%"} height={9} color={C.skeletonDim} />
                    </div>
                  </div>
                );
              })}
            </div>
          </DarkPanel>
        </div>
      </div>

      {/* rodapé "Tudo em um só lugar." */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: L.footer.y,
          zIndex: 9,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <RevealText delay={B.footer} frame={frame} fps={fps} rise={0.4} duration={20}>
          <div
            style={{
              fontFamily,
              fontWeight: FW.bold,
              fontSize: L.footer.size,
              letterSpacing: -1.2,
              whiteSpace: "pre",
            }}
          >
            {SCENE3.footer.map((w) => (
              <span
                key={w.text}
                style={{
                  color: w.color === "blue" ? C.blue : C.white,
                  textShadow:
                    w.color === "blue"
                      ? `0 0 ${34 * glowPulse(frame - B.footer, 0.6, 1.1, 70)}px rgba(27,92,255,0.45)`
                      : undefined,
                }}
              >
                {w.text}
              </span>
            ))}
          </div>
        </RevealText>
      </div>
    </SceneShell>
  );
};
