/**
 * ============================================================================
 *  CENA 5 — 8/8 "Pague só pelo que usar" (tela clara + CTA)
 * ============================================================================
 *  Grade de 9 cards entrando em stagger por linha, selo da marca e botão de
 *  CTA com brilho passando.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENE5 } from "../config/copy";
import { Cue, cue } from "../config/sfx";
import { C, FW, SHADOW } from "../config/theme";
import { EASE, card3dIn, float, glowPulse, ip, popIn, prog, spr } from "../lib/anim";
import { fontFamily } from "../lib/fonts";
import { SfxTrack } from "../lib/SfxTrack";
import { alignWordsToPhrase, sceneSync } from "../lib/sync";
import { LogoMark, SlideHeader } from "../components/Brand";
import { ArcLines, DottedGrid } from "../components/Decor";
import { Icon, IconName } from "../components/Icons";
import { BadgeCircle, CtaButton, IconCircle, WhiteCard } from "../components/Primitives";
import { RevealText, SceneShell } from "../components/SceneShell";

// ---------------------------------------------------------------------------
// BEATS — ancorados nas palavras da narração (ver src/lib/sync.ts)
const S = sceneSync("pagueSo");

/**
 * A locução desta cena (a mais longa: 25s):
 *  46,8s "E o melhor: você paga apenas pelo que usar, sem mensalidade obrigatória."
 *  51,6s "Isso significa mais agilidade para tomar decisões, mais segurança
 *         para fechar negócios e muito mais produtividade no seu dia a dia."
 *  59,3s "Porque quem tem a informação certa, na hora certa, sempre sai na frente."
 *  63,4s "Cadastre-se agora na ConsulTech e descubra como é ter mais velocidade,
 *         autonomia e segurança em todas as suas consultas."
 *
 * O título entra em "paga/pelo", o subtítulo em "mensalidade", e o CTA
 * exatamente em "Cadastre-se agora".
 */
const B = {
  header: 0,
  arcs: S.beat(1),
  h1: S.atWord("paga", 4),
  h2: S.atWord("pelo", 6),
  sub: S.atWord("mensalidade", 8),
  row1: [S.atWord("obrigatoria", 10), S.atWord("isso", 12)],
  row2: [S.atWord("agilidade", 15), S.atWord("decisoes", 18), S.atWord("seguranca", 20)],
  row3: [
    S.atWord("fechar", 22),
    S.atWord("negocios", 23),
    S.atWord("produtividade", 26),
    S.atWord("dia", 29),
  ],
  shieldBadge: S.atWord("informacao", 33),
  boltBadge: S.atWord("hora", 35),
  seal: S.atWord("frente", 38),
  cta: S.atWord("cadastre", 40),
  ctaShine: S.atWord("descubra", 44),
  /** realces nos cards quando a narração repete os benefícios no fecho */
  pulseVelocidade: S.atWord("velocidade", 46),
  pulseAutonomia: S.atWord("autonomia", 48),
  pulseSeguranca: S.atSecond(68.02), // "...autonomia e segurança em todas as suas consultas"
};

const L = {
  headline: { y: 288, size: 112, lh: 1.13, ls: -4 },
  sub: { y: 566, size: 40 },
  grid: { x: 98, w: 884, gap: 22 },
  row1: { y: 700, h: 160 },
  row2: { y: 906, h: 202 },
  row3: { y: 1152, h: 262 },
  shieldBadge: { x: 942, y: 838, size: 96 },
  boltBadge: { x: 70, y: 1642, size: 100 },
  seal: { x: 436, y: 1478, size: 208 },
  cta: { y: 1748, w: 700, size: 40 },
};

export const scene5Cues: Cue[] = [
  cue(B.h1 - 3, "whoosh", 0.9),
  cue(B.h2 - 3, "whoosh", 0.9, 1.08),
  cue(B.h2 + 1, "impact", 0.55),
  cue(B.sub, "popSoft", 0.7),
  ...B.row1.map((f, i) => cue(f, "pop", 0.85, 1 + i * 0.05)),
  ...B.row2.map((f, i) => cue(f, "pop", 0.8, 1.05 + i * 0.05)),
  ...B.row3.map((f, i) => cue(f, "popSoft", 0.85, 1.1 + i * 0.05)),
  cue(B.shieldBadge, "popSoft", 1),
  cue(B.boltBadge, "popSoft", 1, 1.08),
  cue(B.seal - 6, "reverse", 0.6),
  cue(B.seal, "sparkle", 0.9),
  cue(B.cta - 4, "swipe", 0.7),
  cue(B.cta, "tap", 1.1),
  cue(B.ctaShine, "sparkle", 0.5, 1.2),
  cue(B.ctaShine + 6, "success", 0.5),
  cue(B.pulseVelocidade, "popSoft", 0.7, 1.15),
  cue(B.pulseAutonomia, "popSoft", 0.7, 1.1),
  cue(B.pulseSeguranca, "popSoft", 0.7, 1.05),
];

// ---------------------------------------------------------------------------
const PriceCard: React.FC<{
  title: string;
  sub: string;
  icon: IconName;
  well?: boolean;
  h: number;
  w: number;
  frame: number;
  fps: number;
  delay: number;
  compact?: boolean;
  /** frame em que a narração repete este benefício (realce) */
  pulse?: number;
}> = ({ title, sub, icon, well = false, h, w, frame, fps, delay, compact = false, pulse }) => {
  const iconPop = spr(frame, fps, delay + 4, "bouncy");
  // realce: sobe, aumenta e ganha borda azul quando a palavra é dita
  const pulseP =
    pulse === undefined ? 0 : ip(frame, [pulse - 2, pulse + 6, pulse + 26], [0, 1, 0], EASE.out);
  return (
    <WhiteCard
      radius={22}
      soft
      style={{
        width: w,
        height: h,
        padding: compact ? "24px 22px" : "26px 28px",
        transform: `translateY(${-10 * pulseP}px) scale(${1 + 0.035 * pulseP})`,
        outline: pulseP > 0.02 ? `2px solid rgba(27,92,255,${0.55 * pulseP})` : undefined,
        display: "flex",
        flexDirection: compact ? "column" : "row",
        alignItems: compact ? "flex-start" : "center",
        gap: compact ? 16 : 20,
        boxShadow:
          pulseP > 0.02
            ? `${SHADOW.cardLight}, 0 0 ${46 * pulseP}px rgba(27,92,255,${0.4 * pulseP})`
            : SHADOW.cardLight,
      }}
    >
      <div
        style={{
          transform: `scale(${0.7 + 0.3 * iconPop}) rotate(${ip(frame, [delay + 4, delay + 26], [-14, 0], EASE.out)}deg)`,
          flexShrink: 0,
        }}
      >
        {well ? (
          <IconCircle icon={icon} variant="blue" size={64} iconSize={32} />
        ) : (
          <Icon name={icon} size={46} color={C.blue} strokeWidth={2.1} />
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          opacity: ip(frame, [delay + 4, delay + 16], [0, 1]),
          transform: `translateY(${ip(frame, [delay + 4, delay + 20], [10, 0], EASE.out)}px)`,
        }}
      >
        <span
          style={{
            fontFamily,
            fontWeight: FW.semibold,
            fontSize: 29,
            color: C.ink,
            letterSpacing: -0.8,
            lineHeight: 1.12,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily,
            fontWeight: FW.regular,
            fontSize: 25,
            color: C.gray,
            letterSpacing: -0.4,
            lineHeight: 1.2,
            whiteSpace: "pre-line",
          }}
        >
          {sub}
        </span>
      </div>
    </WhiteCard>
  );
};

const Row: React.FC<{
  items: { title: string; sub: string; icon: IconName; well?: boolean }[];
  y: number;
  h: number;
  /** delay de cada card, em frames — um por palavra falada */
  delays: number[];
  frame: number;
  fps: number;
  compact?: boolean;
  /** realce por índice de card (undefined = sem realce) */
  pulses?: (number | undefined)[];
}> = ({ items, y, h, delays, frame, fps, compact = false, pulses }) => {
  const totalGap = L.grid.gap * (items.length - 1);
  const w = (L.grid.w - totalGap) / items.length;
  return (
    <div
      style={{
        position: "absolute",
        left: L.grid.x,
        top: y,
        width: L.grid.w,
        display: "flex",
        gap: L.grid.gap,
        zIndex: 5,
      }}
    >
      {items.map((it, i) => {
        const delay = delays[Math.min(i, delays.length - 1)];
        const enter = card3dIn(frame, fps, delay, {
          y: 46,
          x: 0,
          rotateY: 0,
          scale: 0.86,
          preset: "snappy",
        });
        return (
          <div
            key={it.title + i}
            style={{
              opacity: enter.opacity,
              transform: `${enter.transform} translateY(${float(frame - delay, 3.5, 190, i * 1.3)}px)`,
              filter: enter.filter,
            }}
          >
            <PriceCard
              title={it.title}
              sub={it.sub}
              icon={it.icon}
              well={it.well}
              w={w}
              h={h}
              frame={frame}
              fps={fps}
              delay={delay}
              compact={compact}
              pulse={pulses?.[i]}
            />
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
export const Scene5PagueSo: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shine = ip(frame, [B.ctaShine, B.ctaShine + 26], [0, 1], EASE.inOut);

  return (
    <SceneShell
      duration={duration}
      enter="punch"
      exit="zoom"
      cameraZoom={0.03}
      cameraY={-8}
      background={
        <AbsoluteFill style={{ background: C.bgLight }}>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(90% 60% at 50% 30%, #FFFFFF 0%, rgba(243,244,247,0) 70%)",
            }}
          />
          {/* arcos finos */}
          <div
            style={{
              position: "absolute",
              left: -60,
              top: 480,
              opacity: ip(frame, [B.arcs, B.arcs + 24], [0, 1]),
            }}
          >
            <ArcLines size={1200} progress={prog(frame, B.arcs, 50)} />
          </div>
          {/* grids de pontos */}
          <DottedGrid
            cols={4}
            rows={5}
            gap={26}
            dot={6}
            style={{
              position: "absolute",
              left: 18,
              top: 360,
              opacity: ip(frame, [B.arcs + 6, B.arcs + 26], [0, 0.7]),
            }}
          />
          <DottedGrid
            cols={4}
            rows={4}
            gap={26}
            dot={6}
            style={{
              position: "absolute",
              right: 20,
              top: 1000,
              opacity: ip(frame, [B.arcs + 12, B.arcs + 32], [0, 0.7]),
            }}
          />
        </AbsoluteFill>
      }
    >
      <SfxTrack cues={scene5Cues} />

      <div style={{ opacity: ip(frame, [B.header, B.header + 12], [0, 1]) }}>
        <SlideHeader dark />
      </div>

      {/* headline centralizada */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: L.headline.y,
          zIndex: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily,
          fontWeight: FW.bold,
          fontSize: L.headline.size,
          lineHeight: L.headline.lh,
          letterSpacing: L.headline.ls,
        }}
      >
        {SCENE5.headline.map((w, i) => {
          const delay = [B.h1, B.h2][i];
          const isBlue = w.color === "blue";
          return (
            <RevealText key={w.text} delay={delay} frame={frame} fps={fps} rise={0.5} blur={6}>
              <div
                style={{
                  color: isBlue ? C.blue : C.ink,
                  paddingBottom: 6,
                  textShadow: isBlue
                    ? `0 10px 40px rgba(27,92,255,${0.18 * glowPulse(frame - delay, 0.6, 1, 110)})`
                    : undefined,
                }}
              >
                {w.text}
              </div>
            </RevealText>
          );
        })}
      </div>

      {/* subtítulo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: L.sub.y,
          zIndex: 6,
          display: "flex",
          justifyContent: "center",
          opacity: ip(frame, [B.sub, B.sub + 14], [0, 1]),
          transform: `translateY(${ip(frame, [B.sub, B.sub + 20], [16, 0], EASE.out)}px)`,
        }}
      >
        <span
          style={{
            fontFamily,
            fontWeight: FW.regular,
            fontSize: L.sub.size,
            color: C.gray,
            letterSpacing: -0.6,
          }}
        >
          {SCENE5.subtitle}
        </span>
      </div>

      {/* grade de benefícios */}
      <Row
        items={SCENE5.row1.map((c) => ({ ...c, well: c.well }))}
        y={L.row1.y}
        h={L.row1.h}
        delays={B.row1}
        frame={frame}
        fps={fps}
      />
      <Row
        items={SCENE5.row2}
        y={L.row2.y}
        h={L.row2.h}
        delays={B.row2}
        frame={frame}
        fps={fps}
        compact
        pulses={[undefined, B.pulseAutonomia, undefined]}
      />
      <Row
        items={SCENE5.row3}
        y={L.row3.y}
        h={L.row3.h}
        delays={B.row3}
        frame={frame}
        fps={fps}
        compact
        pulses={[undefined, undefined, B.pulseVelocidade, B.pulseSeguranca]}
      />

      {/* badges azuis flutuantes */}
      <div
        style={{
          position: "absolute",
          left: L.shieldBadge.x,
          top: L.shieldBadge.y,
          zIndex: 8,
          ...popIn(frame, fps, B.shieldBadge, 0.4, "bouncy"),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.shieldBadge, 8, 140)}px)` }}>
          <BadgeCircle icon="shield" size={L.shieldBadge.size} glow={glowPulse(frame, 0.6, 1.1, 90)} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: L.boltBadge.x,
          top: L.boltBadge.y,
          zIndex: 8,
          ...popIn(frame, fps, B.boltBadge, 0.4, "bouncy"),
        }}
      >
        <div style={{ transform: `translateY(${float(frame - B.boltBadge, 8, 128, 2)}px)` }}>
          <BadgeCircle icon="bolt" size={L.boltBadge.size} glow={glowPulse(frame, 0.6, 1.1, 82)} />
        </div>
      </div>

      {/* selo central da marca */}
      <div
        style={{
          position: "absolute",
          left: L.seal.x,
          top: L.seal.y,
          zIndex: 9,
          ...popIn(frame, fps, B.seal, 0.55, "bouncy"),
        }}
      >
        <div
          style={{
            width: L.seal.size,
            height: L.seal.size,
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 30%, #FFFFFF 0%, #EEF2F9 70%, #E4EAF4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 24px 60px rgba(16,24,40,0.16), 0 0 ${60 * glowPulse(frame - B.seal, 0.5, 1, 100)}px rgba(27,92,255,0.30)`,
            transform: `translateY(${float(frame - B.seal, 5, 150)}px)`,
          }}
        >
          <div
            style={{
              width: L.seal.size * 0.62,
              height: L.seal.size * 0.62,
              borderRadius: "50%",
              background: "linear-gradient(150deg, #2E6BFF 0%, #1B5CFF 55%, #0B3AD1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 3px 10px rgba(255,255,255,0.45), 0 12px 30px rgba(11,58,209,0.4)",
            }}
          >
            <LogoMark size={L.seal.size * 0.34} mono="#FFFFFF" glow={0} />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: L.cta.y,
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          opacity: ip(frame, [B.cta, B.cta + 10], [0, 1]),
          transform: `translateY(${(1 - spr(frame, fps, B.cta, "snappy")) * 44}px) scale(${0.94 + 0.06 * spr(frame, fps, B.cta, "bouncy")})`,
        }}
      >
        <CtaButton label={SCENE5.cta} width={L.cta.w} fontSize={L.cta.size} shine={shine} />
      </div>
    </SceneShell>
  );
};
