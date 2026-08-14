import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Layer } from "../components/Layer";
import { Card, CheckDot, IconTile, Label, Value } from "../components/ui";
import { Headline, NumberText } from "../components/Text";
import { ProgressBar, Ring } from "../components/Charts";
import { Icon } from "../components/Icons";
import { useProgress, useSpringIn } from "../components/anim";
import { COLORS, FONT, RADIUS, SPRING, brl } from "../config/theme";
import { COPY } from "../config/copy";
import type { SceneConfig } from "../config/scenes";
import { SceneShell } from "./shell";

const S = COPY.s8;
const GOAL_ICONS = ["calendarCheck", "calendar", "calendarCheck"] as const;
const GOAL_TONES = ["mint", "pale", "deep"] as const;

/** Cena 8 — "E ainda define metas para saber exatamente onde quer chegar." */
export const Scene08: FC<{ cfg: SceneConfig }> = ({ cfg }) => (
  <SceneShell cfg={cfg}>
    <AbsoluteFill>
      <Layer x={0} y={248} w={1080} enter={{ fade: false }}>
        <Headline lines={S.headline} size={142} delay={1} step={12} align="center" lineHeight={0.99} />
      </Layer>

      <Layer x={0} y={588} w={1080} enter={{ delay: 38, y: 24 }}>
        <div
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.semi,
            fontSize: 48,
            color: COLORS.ink,
            textAlign: "center",
          }}
        >
          {S.sub}
        </div>
      </Layer>
      <Layer x={0} y={656} w={1080} enter={{ delay: 44, y: 22 }}>
        <div
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.medium,
            fontSize: 40,
            color: COLORS.muted,
            textAlign: "center",
          }}
        >
          {S.sub2}
        </div>
      </Layer>

      {/* alvo decorativo */}
      <Layer
        x={856}
        y={748}
        w={98}
        h={98}
        enter={{ delay: 92, scale: 0.45, rotate: 22, config: SPRING.bouncy }}
        float={{ amp: 8, period: 104 }}
        z={3}
      >
        <div
          style={{
            width: 98,
            height: 98,
            borderRadius: 30,
            background: COLORS.greenInk,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 40px rgba(8,40,30,0.3)",
          }}
        >
          <Icon name="target" size={50} color={COLORS.mint} width={2.1} />
        </div>
      </Layer>

      {/* metas */}
      {S.goals.map((g, i) => (
        <Layer
          key={g.label}
          x={68}
          y={762 + i * 236}
          w={500}
          rotate={i === 1 ? 0.8 : -0.6}
          enter={{ delay: 52 + i * 14, x: -150, scale: 0.92, blur: 6, config: SPRING.pop }}
          float={{ amp: 4, period: 140 + i * 14, phase: i * 30 }}
        >
          <Card pad={26} radius={RADIUS.lg}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <IconTile name={GOAL_ICONS[i]} size={62} tone={GOAL_TONES[i]} />
              <div style={{ minWidth: 0 }}>
                <Label size={24} color={COLORS.inkSoft} weight={FONT.semi}>
                  {g.label}
                </Label>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4, whiteSpace: "nowrap" }}>
                  <Value size={33}>
                    R$ <NumberText value={g.value} delay={56 + i * 14} duration={26} />
                  </Value>
                  <Label size={21} color={COLORS.mutedSoft}>
                    / R$ {brl(g.target)}
                  </Label>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
              <ProgressBar pct={g.pct} width={358} height={13} delay={58 + i * 14} duration={30} />
              <Value size={28} style={{ whiteSpace: "nowrap" }}>
                <NumberText value={g.pct} decimals={0} suffix="%" delay={58 + i * 14} duration={30} />
              </Value>
            </div>
          </Card>
        </Layer>
      ))}

      {/* anel da meta mensal */}
      <Layer
        x={606}
        y={856}
        w={392}
        rotate={1.2}
        enter={{ delay: 96, x: 130, y: 40, scale: 0.9, blur: 8, config: SPRING.pop }}
        float={{ amp: 5, period: 156, phase: 50 }}
      >
        <Card pad={30} radius={RADIUS.xl} style={{ textAlign: "center" }}>
          <Label size={27} color={COLORS.inkSoft} weight={FONT.semi}>
            {S.ring.title}
          </Label>
          <div style={{ position: "relative", width: 250, height: 250, margin: "22px auto 0" }}>
            <Ring size={250} pct={S.ring.pct} thickness={26} delay={102} duration={46} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontFamily: FONT.family, fontSize: 66, fontWeight: FONT.black, color: COLORS.greenInk }}>
                <NumberText value={S.ring.pct} decimals={0} suffix="%" delay={102} duration={46} />
              </div>
              <Label size={24} style={{ marginTop: -2 }}>
                {S.ring.note}
              </Label>
            </div>
          </div>
          <Value size={38} style={{ marginTop: 20, whiteSpace: "nowrap" }}>
            R$ <NumberText value={S.ring.value} delay={110} duration={38} />
          </Value>
          <Label size={23} color={COLORS.mutedSoft} style={{ marginTop: 4 }}>
            de R$ {brl(S.ring.target)}
          </Label>
        </Card>
      </Layer>

      {/* marcos */}
      <Layer
        x={112}
        y={1456}
        w={872}
        enter={{ delay: 136, y: 80, scale: 0.95, config: SPRING.pop }}
      >
        <Card pad={30} radius={RADIUS.xl}>
          <Label size={26} color={COLORS.ink} weight={FONT.bold}>
            {S.milestones.title}
          </Label>
          <Milestones />
        </Card>
      </Layer>

      {/* rodapé */}
      <Layer x={166} y={1716} w={768} enter={{ delay: 164, y: 70, scale: 0.96, config: SPRING.pop }}>
        <Card pad={24} radius={RADIUS.lg} style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <IconTile name="trendUp" size={68} tone="deep" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT.family, fontWeight: FONT.bold, fontSize: 30, color: COLORS.ink }}>
              {S.footer.title}
            </div>
            <Label size={23} color={COLORS.mutedSoft} style={{ marginTop: 4 }}>
              {S.footer.sub}
            </Label>
          </div>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 99,
              background: COLORS.bgSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="chevronDown" size={24} color={COLORS.inkSoft} />
          </div>
        </Card>
      </Layer>
    </AbsoluteFill>
  </SceneShell>
);

/** Trilha de marcos: a linha se preenche e cada check estoura na sequência. */
const Milestones: FC = () => {
  const items = S.milestones.items;
  const gap = 760 / (items.length - 1);
  const fill = useProgress(140, 34);
  return (
    <div style={{ position: "relative", width: 760, height: 122, margin: "26px auto 0" }}>
      <div
        style={{
          position: "absolute",
          top: 33,
          left: 40,
          width: 680,
          height: 3,
          borderTop: `3px dashed ${COLORS.pale}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 33,
          left: 40,
          width: 680 * Math.min(1, fill * 0.78),
          height: 3,
          background: COLORS.green,
          opacity: 0.5,
        }}
      />
      {items.map((m, i) => (
        <Milestone key={m.label} x={i * gap} label={m.label} done={m.done} delay={142 + i * 8} />
      ))}
    </div>
  );
};

const Milestone: FC<{ x: number; label: string; done: boolean; delay: number }> = ({
  x,
  label,
  done,
  delay,
}) => {
  const p = useSpringIn(delay, SPRING.bouncy);
  return (
    <div style={{ position: "absolute", left: x, top: 0, transform: "translateX(-50%)", textAlign: "center" }}>
      <CheckDot size={68} done={done} progress={p} />
      <div
        style={{
          fontFamily: FONT.family,
          fontSize: 23,
          fontWeight: FONT.semi,
          color: done ? COLORS.ink : COLORS.muted,
          marginTop: 14,
          whiteSpace: "nowrap",
          opacity: p,
          transform: `translateY(${interpolate(p, [0, 1], [10, 0]).toFixed(1)}px)`,
        }}
      >
        {label}
      </div>
    </div>
  );
};
