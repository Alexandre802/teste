/**
 * ============================================================================
 *  CENA 4 — 5/8 "100+ tipos de consultas em segundos."
 * ============================================================================
 *  Cena mais densa: lista lateral de consultas, dashboard com 3 KPIs
 *  (contadores + gráficos desenhando), donut com legenda, chips flutuantes e
 *  painel de atividade recente com checks de "Concluída".
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE4 } from "../config/copy";
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
import { DashboardLogo, SlideHeader } from "../components/Brand";
import { AreaChart, Donut, DonutLegend, MiniBars, Sparkline, TrendLine } from "../components/Charts";
import { Asterisk, CurvedArrow, GlowBlob, Swoosh } from "../components/Decor";
import {
  BadgeCircle,
  CheckSeal,
  Chip,
  DarkPanel,
  GlassCard,
  IconCircle,
  SearchField,
} from "../components/Primitives";
import { RevealText, SceneShell } from "../components/SceneShell";

// ---------------------------------------------------------------------------
const B = {
  header: 2,
  hundred: 6,
  count: 8,
  plus: 40,
  h2: 44,
  h3: 56,
  h4: 70,
  boltBadge: 84,
  arrow: 98,
  search: 112,
  typing: 122,
  list: 132,
  listStep: 11,
  panel: 196,
  stat1: 214,
  stat2: 230,
  stat3: 246,
  area: 262,
  donut: 290,
  legend: 300,
  chip1: 338,
  chip2: 354,
  chip3: 370,
  activity: 390,
  activityStep: 12,
  chartBadge: 440,
  asterisk: 456,
  shine: 478,
};

const L = {
  hundred: { x: 62, y: 208, size: 208, ls: -12 },
  line2: { x: 82, y: 418, size: 92, ls: -3 },
  line3: { x: 74, y: 528, size: 122, ls: -4.5 },
  line4: { x: 82, y: 690, size: 58, ls: -1.6 },
  boltBadge: { x: 754, y: 348, size: 128 },
  arrow: { x: 896, y: 470, w: 168, h: 150 },
  search: { x: 756, y: 654, w: 320 },
  list: { x: 38, y: 800, w: 382, h: 110, gap: 18 },
  panel: { x: 428, y: 726, w: 652, h: 578 },
  chip1: { x: 404, y: 1256, w: 286 },
  chip2: { x: 490, y: 1384, w: 258 },
  chip3: { x: 766, y: 1316, w: 306 },
  activity: { x: 424, y: 1538, w: 656, h: 340 },
  chartBadge: { x: 936, y: 1664, size: 118 },
  asterisk: { x: -30, y: 1700, size: 300 },
};

export const scene4Cues: Cue[] = [
  cue(B.hundred - 4, "reverse", 0.8),
  cue(B.hundred, "impact", 0.9),
  cue(B.count + 6, "tick", 0.5),
  cue(B.count + 16, "tick", 0.5),
  cue(B.count + 26, "tick", 0.5),
  cue(B.plus, "pop", 1.1),
  cue(B.h2 - 3, "whoosh", 0.8, 1.1),
  cue(B.h3 - 3, "whoosh", 0.9),
  cue(B.h3, "sub", 0.5),
  cue(B.h4 - 3, "whoosh", 0.7, 1.2),
  cue(B.boltBadge, "popSoft", 1.1),
  cue(B.arrow, "whoosh", 0.55, 1.3),
  cue(B.search - 3, "swipe", 0.7),
  cue(B.typing, "click"),
  cue(B.typing + 10, "tick", 0.7),
  ...SCENE4.list.map((_, i) => cue(B.list + i * B.listStep, "popSoft", 0.8, 1 + i * 0.03)),
  cue(B.list + 6 * B.listStep + 6, "success", 0.5),
  cue(B.panel - 5, "reverse", 0.6),
  cue(B.panel, "whooshBig", 0.5),
  cue(B.stat1, "tick", 0.7),
  cue(B.stat2, "tick", 0.7),
  cue(B.stat3, "tick", 0.7),
  cue(B.area, "whoosh", 0.5, 1.4),
  cue(B.donut, "glitch", 0.5),
  cue(B.legend, "tick", 0.6),
  cue(B.chip1, "pop", 0.85),
  cue(B.chip2, "pop", 0.85, 1.05),
  cue(B.chip3, "pop", 0.85, 0.95),
  cue(B.activity, "whoosh", 0.6),
  ...[0, 1, 2].map((i) => cue(B.activity + 14 + i * B.activityStep, "success", 0.42, 1 + i * 0.05)),
  cue(B.chartBadge, "popSoft", 1.1),
  cue(B.asterisk, "glitch", 0.8),
  cue(B.shine, "sparkle", 0.8),
];

// ---------------------------------------------------------------------------
const StatCard: React.FC<{
  label: string;
  value: string;
  kind: "spark" | "bars" | "trend";
  w: number;
  h: number;
  progress: number;
  countProgress: number;
}> = ({ label, value, kind, w, h, progress, countProgress }) => {
  // anima o número respeitando o formato original ("1.248", "98,7%", "2,3s")
  const numeric = parseFloat(value.replace(/\./g, "").replace(",", "."));
  const suffix = value.replace(/[\d.,]/g, "");
  const decimals = value.includes(",") ? 1 : 0;
  const shown =
    value === "1.248"
      ? ptNumber(Math.round(numeric * countProgress))
      : `${ptNumber(numeric * countProgress, decimals)}${suffix}`;
  return (
    <GlassCard
      radius={18}
      style={{ width: w, height: h, padding: "15px 17px", display: "flex", flexDirection: "column" }}
    >
      <span
        style={{
          fontFamily,
          fontWeight: FW.regular,
          fontSize: 18,
          color: "rgba(198,212,240,0.72)",
          lineHeight: 1.12,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily,
          fontWeight: FW.semibold,
          fontSize: 33,
          color: C.white,
          letterSpacing: -1,
          marginTop: 4,
        }}
      >
        {shown}
      </span>
      <div style={{ marginTop: "auto" }}>
        {kind === "spark" && <Sparkline width={w - 36} height={30} progress={progress} color={C.blueSoft} />}
        {kind === "bars" && <MiniBars width={w - 36} height={30} progress={progress} />}
        {kind === "trend" && <TrendLine width={w - 36} height={30} progress={progress} />}
      </div>
    </GlassCard>
  );
};

// ---------------------------------------------------------------------------
export const Scene4CemMais: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typed = typewriter(SCENE4.search, frame, B.typing, 0.8);
  const hundred = Math.round(countUp(frame, B.count, 34, 100));

  const statW = (L.panel.w - 56 - 24) / 3;

  return (
    <SceneShell
      duration={duration}
      enter="push"
      exit="zoom"
      cameraZoom={0.05}
      cameraY={-20}
      background={
        <AbsoluteFill style={{ background: C.bgDark }}>
          <GlowBlob
            size={1000}
            color="rgba(27,92,255,0.18)"
            style={{ position: "absolute", left: 340, top: 620 }}
          />
          <GlowBlob
            size={700}
            color="rgba(27,92,255,0.16)"
            style={{ position: "absolute", left: -140, top: 1500 }}
          />
          {/* swoosh azul do canto inferior direito */}
          <div style={{ position: "absolute", left: 300, top: 1180, opacity: 0.9 }}>
            <Swoosh
              width={1000}
              height={1000}
              thickness={104}
              color={C.blueDeep}
              progress={prog(frame, 10, 60)}
              opacity={0.8}
            />
          </div>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(120% 88% at 48% 40%, rgba(0,0,0,0) 40%, rgba(2,3,8,0.8) 100%)",
            }}
          />
        </AbsoluteFill>
      }
    >
      <SfxTrack cues={scene4Cues} />

      <div style={{ opacity: ip(frame, [B.header, B.header + 12], [0, 1]) }}>
        <SlideHeader badge={SCENE4.badge} />
      </div>

      {/* "100+" com contador */}
      <div
        style={{
          position: "absolute",
          left: L.hundred.x,
          top: L.hundred.y,
          zIndex: 6,
          display: "flex",
          alignItems: "baseline",
          fontFamily,
          fontWeight: FW.extrabold,
          fontSize: L.hundred.size,
          letterSpacing: L.hundred.ls,
          lineHeight: 1,
          color: C.white,
          textShadow: TEXT_GLOW_WHITE,
          opacity: ip(frame, [B.hundred, B.hundred + 8], [0, 1]),
          transform: `scale(${0.86 + 0.14 * spr(frame, fps, B.hundred, "pop")})`,
          transformOrigin: "0% 60%",
        }}
      >
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{hundred}</span>
        <span
          style={{
            opacity: ip(frame, [B.plus, B.plus + 8], [0, 1]),
            transform: `scale(${0.4 + 0.6 * spr(frame, fps, B.plus, "bouncy")})`,
            display: "inline-block",
          }}
        >
          +
        </span>
      </div>

      {/* "tipos de" */}
      <div style={{ position: "absolute", left: L.line2.x, top: L.line2.y, zIndex: 6 }}>
        <RevealText delay={B.h2} frame={frame} fps={fps} rise={0.5}>
          <div
            style={{
              fontFamily,
              fontWeight: FW.bold,
              fontSize: L.line2.size,
              letterSpacing: L.line2.ls,
              color: C.white,
              lineHeight: 1.05,
              textShadow: TEXT_GLOW_WHITE,
              paddingBottom: 4,
            }}
          >
            {SCENE4.headline.line2}
          </div>
        </RevealText>
      </div>

      {/* "consultas" */}
      <div style={{ position: "absolute", left: L.line3.x, top: L.line3.y, zIndex: 6 }}>
        <RevealText delay={B.h3} frame={frame} fps={fps} rise={0.55}>
          <div
            style={{
              fontFamily,
              fontWeight: FW.bold,
              fontSize: L.line3.size,
              letterSpacing: L.line3.ls,
              color: C.blue,
              lineHeight: 1.05,
              textShadow: `0 0 ${52 * glowPulse(frame - B.h3, 0.7, 1.05, 120)}px rgba(27,92,255,0.4)`,
              paddingBottom: 6,
            }}
          >
            {SCENE4.headline.line3}
          </div>
        </RevealText>
      </div>

      {/* "em segundos." */}
      <div style={{ position: "absolute", left: L.line4.x, top: L.line4.y, zIndex: 6 }}>
        <RevealText delay={B.h4} frame={frame} fps={fps} rise={0.4} duration={16}>
          <div
            style={{
              fontFamily,
              fontWeight: FW.bold,
              fontSize: L.line4.size,
              letterSpacing: L.line4.ls,
              lineHeight: 1.1,
              paddingBottom: 4,
            }}
          >
            <span style={{ color: C.white }}>{SCENE4.headline.line4a}</span>
            <span
              style={{
                color: C.blue,
                textShadow: `0 0 ${28 * glowPulse(frame - B.h4, 0.6, 1.1, 90)}px rgba(27,92,255,0.45)`,
              }}
            >
              {SCENE4.headline.line4b}
            </span>
          </div>
        </RevealText>
      </div>

      {/* badge raio + seta + busca */}
      <div
        style={{
          position: "absolute",
          left: L.boltBadge.x,
          top: L.boltBadge.y,
          zIndex: 8,
          ...popIn(frame, fps, B.boltBadge, 0.4, "bouncy"),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.boltBadge, 10, 130)}px)` }}>
          <BadgeCircle icon="bolt" size={L.boltBadge.size} glow={glowPulse(frame, 0.75, 1.25, 76)} />
        </div>
      </div>

      <div style={{ position: "absolute", left: L.arrow.x, top: L.arrow.y, zIndex: 5 }}>
        <CurvedArrow
          width={L.arrow.w}
          height={L.arrow.h}
          variant="downRight"
          thickness={6}
          progress={prog(frame, B.arrow, 24)}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: L.search.x,
          top: L.search.y,
          zIndex: 7,
          ...popIn(frame, fps, B.search, 0.82),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.search, 5, 150, 0.6)}px)` }}>
          <SearchField
            text={typed.visible}
            variant="darkGlass"
            width={L.search.w}
            fontSize={26}
            caret={frame > B.typing && !typed.done}
          />
        </div>
      </div>

      {/* lista lateral de consultas */}
      {SCENE4.list.map((item, i) => {
        const delay = B.list + i * B.listStep;
        const enter = card3dIn(frame, fps, delay, {
          y: 30,
          x: -90,
          rotateY: 20,
          scale: 0.9,
          preset: "snappy",
        });
        return (
          <div
            key={item.label}
            style={{
              position: "absolute",
              left: L.list.x,
              top: L.list.y + i * (L.list.h + L.list.gap),
              zIndex: 11,
              opacity: enter.opacity,
              transform: enter.transform,
              filter: enter.filter,
            }}
          >
            <GlassCard
              radius={22}
              strong
              style={{
                width: L.list.w,
                height: L.list.h,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "0 26px",
              }}
            >
              <div
                style={{
                  transform: `scale(${0.72 + 0.28 * spr(frame, fps, delay + 4, "bouncy")})`,
                }}
              >
                <IconCircle icon={item.icon} variant="blue" size={64} iconSize={32} />
              </div>
              <span
                style={{
                  fontFamily,
                  fontWeight: FW.medium,
                  fontSize: 30,
                  color: C.white,
                  letterSpacing: -0.8,
                  whiteSpace: "nowrap",
                  opacity: ip(frame, [delay + 3, delay + 14], [0, 1]),
                }}
              >
                {item.label}
              </span>
            </GlassCard>
            {item.checked && (
              <div
                style={{
                  position: "absolute",
                  right: -16,
                  top: -16,
                  ...popIn(frame, fps, delay + 8, 0.3, "bouncy"),
                }}
              >
                <CheckSeal size={46} />
              </div>
            )}
          </div>
        );
      })}

      {/* painel do dashboard */}
      <div
        style={{
          position: "absolute",
          left: L.panel.x,
          top: L.panel.y,
          zIndex: 8,
          ...card3dIn(frame, fps, B.panel, { y: 70, x: 60, rotateY: -14, scale: 0.92 }),
        }}
      >
        <DarkPanel style={{ width: L.panel.w, height: L.panel.h, padding: 28 }} radius={28}>
          <div style={{ opacity: ip(frame, [B.panel + 6, B.panel + 18], [0, 1]) }}>
            <DashboardLogo size={34} />
          </div>

          {/* 3 KPIs */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            {SCENE4.stats.map((s, i) => {
              const d = [B.stat1, B.stat2, B.stat3][i];
              const enter = popIn(frame, fps, d, 0.88, "snappy");
              return (
                <div key={s.label} style={{ opacity: enter.opacity, transform: enter.transform }}>
                  <StatCard
                    label={s.label}
                    value={s.value}
                    kind={s.kind}
                    w={statW}
                    h={144}
                    progress={prog(frame, d + 8, 42)}
                    countProgress={prog(frame, d + 2, 40)}
                  />
                </div>
              );
            })}
          </div>

          {/* área + donut */}
          <div
            style={{
              marginTop: 18,
              borderRadius: 20,
              border: `1.4px solid rgba(96,132,220,0.18)`,
              background: "rgba(255,255,255,0.03)",
              padding: "20px 22px",
              opacity: ip(frame, [B.area - 8, B.area + 6], [0, 1]),
            }}
          >
            <span
              style={{
                fontFamily,
                fontWeight: FW.regular,
                fontSize: 22,
                color: "rgba(206,220,246,0.82)",
              }}
            >
              {SCENE4.chartTitle}
            </span>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 10 }}>
              <AreaChart
                width={288}
                height={166}
                progress={prog(frame, B.area, 52)}
                labels={SCENE4.weekDays}
                labelSize={17}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ transform: `scale(${0.86 + 0.14 * spr(frame, fps, B.donut, "snappy")})` }}>
                  <Donut
                    data={SCENE4.donut.legend}
                    size={116}
                    thickness={22}
                    progress={prog(frame, B.donut, 40)}
                    center={
                      <>
                        <span
                          style={{
                            fontFamily,
                            fontWeight: FW.semibold,
                            fontSize: 24,
                            color: C.white,
                            letterSpacing: -0.6,
                          }}
                        >
                          {SCENE4.donut.total}
                        </span>
                        <span
                          style={{
                            fontFamily,
                            fontWeight: FW.regular,
                            fontSize: 15,
                            color: "rgba(200,214,240,0.7)",
                          }}
                        >
                          {SCENE4.donut.totalLabel}
                        </span>
                      </>
                    }
                  />
                </div>
                <DonutLegend
                  data={SCENE4.donut.legend}
                  fontSize={16}
                  progress={prog(frame, B.legend, 30)}
                />
              </div>
            </div>
          </div>
        </DarkPanel>
      </div>

      {/* chips flutuantes */}
      <div
        style={{
          position: "absolute",
          left: L.chip1.x,
          top: L.chip1.y,
          zIndex: 10,
          ...card3dIn(frame, fps, B.chip1, { y: 34, x: -40, rotate: -4, rotateY: -12 }),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.chip1, 6, 160, 1)}px)` }}>
          <Chip
            label={SCENE4.floating[0].label}
            icon={SCENE4.floating[0].icon}
            variant="light"
            fontSize={26}
            lines={2}
            style={{ width: L.chip1.w }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: L.chip2.x,
          top: L.chip2.y,
          zIndex: 11,
          ...card3dIn(frame, fps, B.chip2, { y: 34, x: -30, rotate: 2, rotateY: 10 }),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.chip2, 6, 145, 2.4)}px)` }}>
          <Chip
            label={SCENE4.floating[1].label}
            icon={SCENE4.floating[1].icon}
            variant="dark"
            fontSize={26}
            lines={2}
            check
            style={{ width: L.chip2.w }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: L.chip3.x,
          top: L.chip3.y,
          zIndex: 10,
          ...card3dIn(frame, fps, B.chip3, { y: 34, x: 44, rotate: -3, rotateY: 12 }),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.chip3, 6, 170, 3.6)}px)` }}>
          <Chip
            label={SCENE4.floating[2].label}
            icon={SCENE4.floating[2].icon}
            variant="glass"
            fontSize={26}
            lines={2}
            style={{ width: L.chip3.w }}
          />
        </div>
      </div>

      {/* atividade recente */}
      <div
        style={{
          position: "absolute",
          left: L.activity.x,
          top: L.activity.y,
          zIndex: 9,
          ...card3dIn(frame, fps, B.activity, { y: 66, x: 40, rotateY: -10, scale: 0.94 }),
        }}
      >
        <DarkPanel style={{ width: L.activity.w, height: L.activity.h, padding: "26px 28px" }} radius={26}>
          <span
            style={{
              fontFamily,
              fontWeight: FW.medium,
              fontSize: 27,
              color: "rgba(220,230,250,0.92)",
            }}
          >
            {SCENE4.activityTitle}
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              marginTop: 22,
              paddingRight: 132,
            }}
          >
            {SCENE4.activity.map((row, i) => {
              const d = B.activity + 14 + i * B.activityStep;
              const on = ip(frame, [d, d + 12], [0, 1]);
              return (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    opacity: on,
                    transform: `translateX(${(1 - on) * 26}px)`,
                  }}
                >
                  <IconCircle icon={row.icon} variant="blue" size={52} iconSize={26} />
                  <span
                    style={{
                      fontFamily,
                      fontWeight: FW.medium,
                      fontSize: 26,
                      color: C.white,
                      letterSpacing: -0.5,
                      flex: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.label}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: C.green,
                        boxShadow: `0 0 ${12 * glowPulse(frame, 0.4, 1, 50, i)}px ${C.green}`,
                      }}
                    />
                    <span
                      style={{
                        fontFamily,
                        fontWeight: FW.regular,
                        fontSize: 24,
                        color: C.greenSoft,
                      }}
                    >
                      {row.status}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily,
                      fontWeight: FW.regular,
                      fontSize: 24,
                      color: "rgba(210,222,244,0.75)",
                      width: 44,
                      textAlign: "right",
                    }}
                  >
                    {row.time}
                  </span>
                </div>
              );
            })}
          </div>
        </DarkPanel>
      </div>

      {/* badge gráfico */}
      <div
        style={{
          position: "absolute",
          left: L.chartBadge.x,
          top: L.chartBadge.y,
          zIndex: 12,
          ...popIn(frame, fps, B.chartBadge, 0.4, "bouncy"),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.chartBadge, 9, 128)}px)` }}>
          <BadgeCircle icon="chart" size={L.chartBadge.size} glow={glowPulse(frame, 0.75, 1.2, 88)} />
        </div>
      </div>

      {/* asterisco */}
      <div
        style={{
          position: "absolute",
          left: L.asterisk.x,
          top: L.asterisk.y,
          zIndex: 4,
          opacity: ip(frame, [B.asterisk, B.asterisk + 10], [0, 1]),
          transform: `rotate(${ip(frame, [B.asterisk, B.asterisk + 44], [-36, 0], EASE.out) + frame * 0.04}deg) scale(${0.6 + 0.4 * spr(frame, fps, B.asterisk, "bouncy")})`,
        }}
      >
        <Asterisk size={L.asterisk.size} color={C.blue} />
      </div>

      {/* brilho final */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(55% 34% at 30% 22%, rgba(27,92,255,0.22) 0%, rgba(27,92,255,0) 70%)",
          opacity: ip(frame, [B.shine, B.shine + 10, B.shine + 34], [0, 1, 0]),
          mixBlendMode: "screen",
          zIndex: 13,
        }}
      />
    </SceneShell>
  );
};
