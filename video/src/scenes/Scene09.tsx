import type { FC } from "react";
import { AbsoluteFill } from "remotion";
import { Layer } from "../components/Layer";
import { Logo } from "../components/Logo";
import { Card, IconTile, Label, Pill, Value } from "../components/ui";
import { BulletLine, Headline, NumberText } from "../components/Text";
import { Donut, Sparkline } from "../components/Charts";
import { Icon } from "../components/Icons";
import { useSpringIn } from "../components/anim";
import { COLORS, FONT, RADIUS, SPRING, brl, hexA } from "../config/theme";
import { COPY } from "../config/copy";
import type { SceneConfig } from "../config/scenes";
import { SceneShell } from "./shell";

const S = COPY.s9;

const DONUT_COLORS = [COLORS.greenDeep, COLORS.green, COLORS.greenBright, COLORS.mint];
const SUM_SPARKS = [
  [3, 4, 3.4, 5, 4.4, 6, 5.6, 7, 6.4, 8, 9.4],
  [4, 3.2, 4.6, 3.8, 5, 4.2, 5.6, 4.8, 6, 5.4, 6.2],
  [3, 3.8, 3.2, 4.6, 4, 5.4, 4.8, 6.2, 5.6, 7, 8.4],
];
const BALANCE = [4, 3.4, 5, 4.4, 6.2, 5.4, 7, 6.2, 8, 7, 9, 8.2, 10.4, 12];

/** Cena 9 — "…ter clareza para planejar os próximos passos." */
export const Scene09: FC<{ cfg: SceneConfig }> = ({ cfg }) => (
  <SceneShell cfg={cfg}>
    <AbsoluteFill>
      <Layer x={70} y={92} enter={{ delay: 2, x: -60 }}>
        <Logo size={56} delay={4} />
      </Layer>

      <Layer x={0} y={206} w={1080} enter={{ fade: false }}>
        <Headline lines={S.headline} size={106} delay={6} step={10} align="center" lineHeight={1.0} />
      </Layer>

      <Layer x={0} y={560} w={1080} enter={{ delay: 36, y: 22 }}>
        <BulletLine
          items={S.sub}
          size={40}
          delay={36}
          step={3}
          color={COLORS.ink}
          style={{ justifyContent: "center" }}
        />
      </Layer>

      <Layer x={0} y={636} w={1080} enter={{ delay: 42, y: 20 }}>
        <div
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.medium,
            fontSize: 38,
            color: COLORS.muted,
            textAlign: "center",
          }}
        >
          {S.kicker}
        </div>
      </Layer>

      {/* resumo financeiro */}
      <Layer x={98} y={722} w={884} enter={{ delay: 46, y: 70, scale: 0.95, blur: 6, config: SPRING.pop }}>
        <Card pad={26} radius={RADIUS.lg}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Label size={27} color={COLORS.ink} weight={FONT.bold}>
              {S.summary.title}
            </Label>
            <Pill label={S.summary.pill} icon="calendar" fontSize={19} />
          </div>
          <div style={{ display: "flex", gap: 0, marginTop: 20 }}>
            {S.summary.items.map((it, i) => (
              <div
                key={it.label}
                style={{
                  flex: 1,
                  paddingLeft: i === 0 ? 0 : 22,
                  borderLeft: i === 0 ? "none" : `1.5px solid ${COLORS.line}`,
                }}
              >
                <Label size={22}>{it.label}</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, whiteSpace: "nowrap" }}>
                  <Value size={31}>
                    R$ <NumberText value={it.value} delay={50 + i * 5} duration={26} />
                  </Value>
                  <Icon
                    name={it.dir === "up" ? "arrowUpRight" : "arrowDownRight"}
                    size={22}
                    color={COLORS.green}
                    width={2.6}
                  />
                </div>
                <Sparkline
                  id={`s9-sum-${i}`}
                  values={SUM_SPARKS[i]}
                  width={228}
                  height={80}
                  delay={54 + i * 6}
                  duration={24}
                  strokeWidth={3.6}
                  style={{ marginTop: 10 }}
                />
              </div>
            ))}
          </div>
        </Card>
      </Layer>

      {/* distribuição de gastos */}
      <Layer x={98} y={1082} w={438} enter={{ delay: 72, x: -110, scale: 0.93, blur: 6, config: SPRING.pop }}>
        <Card pad={26} radius={RADIUS.lg}>
          <Label size={25} color={COLORS.ink} weight={FONT.bold}>
            {S.donut.title}
          </Label>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16 }}>
            <div style={{ position: "relative", width: 176, height: 176, flexShrink: 0 }}>
              <Donut slices={S.donut.slices} size={176} thickness={38} colors={DONUT_COLORS} delay={78} duration={40} />
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
                <div style={{ fontFamily: FONT.family, fontSize: 20, fontWeight: FONT.bold, color: COLORS.ink }}>
                  R$ {brl(S.donut.total)}
                </div>
                <Label size={17} color={COLORS.mutedSoft}>
                  {S.donut.totalLabel}
                </Label>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {S.donut.slices.map((sl, i) => (
                <LegendRow key={sl.label} label={sl.label} pct={sl.pct} color={DONUT_COLORS[i]} delay={86 + i * 7} />
              ))}
            </div>
          </div>
        </Card>
      </Layer>

      {/* evolução do saldo */}
      <Layer x={562} y={1086} w={420} enter={{ delay: 112, x: 110, scale: 0.93, blur: 6, config: SPRING.pop }}>
        <Card pad={26} radius={RADIUS.lg}>
          <Label size={25} color={COLORS.ink} weight={FONT.bold}>
            {S.balance.title}
          </Label>
          <Value size={38} style={{ marginTop: 10, whiteSpace: "nowrap" }}>
            R$ <NumberText value={S.balance.value} delay={116} duration={30} />
          </Value>
          <Sparkline
            id="s9-balance"
            values={BALANCE}
            width={366}
            height={168}
            delay={118}
            duration={34}
            strokeWidth={5.4}
            style={{ marginTop: 14 }}
          />
        </Card>
      </Layer>

      {/* próximos passos */}
      <Layer x={66} y={1424} w={492} enter={{ delay: 120, y: 90, scale: 0.94, blur: 6, config: SPRING.pop }}>
        <Card pad={26} radius={RADIUS.xl}>
          <Label size={25} color={COLORS.ink} weight={FONT.bold}>
            {S.steps.title}
          </Label>
          {S.steps.items.map((st, i) => (
            <StepRow key={st.title} index={i} title={st.title} sub={st.sub} delay={126 + i * 6} last={i === 2} />
          ))}
        </Card>
      </Layer>

      {/* card escuro "você está no controle" */}
      <Layer x={588} y={1442} w={396} enter={{ delay: 144, y: 90, scale: 0.92, blur: 8, config: SPRING.pop }}>
        <Card pad={30} radius={RADIUS.xl} variant="deep" style={{ position: "relative", overflow: "hidden", height: 386 }}>
          <DecoBars />
          <div style={{ position: "relative", zIndex: 2 }}>
            <IconTile name="trendUp" size={78} tone="neon" radius={99} />
            <div
              style={{
                fontFamily: FONT.family,
                fontWeight: FONT.bold,
                fontSize: 32,
                color: COLORS.white,
                marginTop: 96,
              }}
            >
              {S.control.title}
            </div>
            {S.control.sub.map((l) => (
              <div
                key={l}
                style={{ fontFamily: FONT.family, fontSize: 26, color: hexA(COLORS.mint, 0.9), marginTop: 4 }}
              >
                {l}
              </div>
            ))}
          </div>
        </Card>
      </Layer>
    </AbsoluteFill>
  </SceneShell>
);

const LegendRow: FC<{ label: string; pct: number; color: string; delay: number }> = ({
  label,
  pct,
  color,
  delay,
}) => {
  const p = useSpringIn(delay, SPRING.snappy);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
        opacity: p,
        transform: `translateX(${(1 - p) * 16}px)`,
      }}
    >
      <span style={{ width: 13, height: 13, borderRadius: 99, background: color, flexShrink: 0 }} />
      <Label size={19} color={COLORS.inkSoft} style={{ flex: 1 }}>
        {label}
      </Label>
      <Label size={19} color={COLORS.ink} weight={FONT.bold}>
        <NumberText value={pct} decimals={0} suffix="%" delay={delay} duration={18} />
      </Label>
    </div>
  );
};

const StepRow: FC<{ index: number; title: string; sub: string; delay: number; last: boolean }> = ({
  index,
  title,
  sub,
  delay,
  last,
}) => {
  const p = useSpringIn(delay, SPRING.pop);
  const icons = ["flag", "target", "bars"] as const;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        marginTop: 22,
        opacity: p,
        transform: `translateY(${((1 - p) * 22).toFixed(1)}px)`,
        position: "relative",
      }}
    >
      {!last ? (
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 62,
            width: 2,
            height: 40,
            borderLeft: `2px dashed ${COLORS.pale}`,
          }}
        />
      ) : null}
      <IconTile name={icons[index]} size={60} tone="mint" radius={99} />
      <div
        style={{
          fontFamily: FONT.family,
          fontSize: 30,
          fontWeight: FONT.bold,
          color: COLORS.green,
          width: 26,
          flexShrink: 0,
          paddingTop: 8,
        }}
      >
        {index + 1}
      </div>
      <div style={{ minWidth: 0, paddingTop: 4 }}>
        <div style={{ fontFamily: FONT.family, fontSize: 23, fontWeight: FONT.bold, color: COLORS.ink }}>{title}</div>
        <Label size={19} color={COLORS.mutedSoft} style={{ marginTop: 3 }}>
          {sub}
        </Label>
      </div>
    </div>
  );
};

/** Barras decorativas no canto do card escuro. */
const DecoBars: FC = () => {
  const p = useSpringIn(152, SPRING.pop);
  const heights = [50, 80, 116, 154];
  return (
    <div style={{ position: "absolute", right: 22, bottom: 0, display: "flex", alignItems: "flex-end", gap: 11, zIndex: 1 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 30,
            height: h * p,
            borderRadius: "8px 8px 0 0",
            background: hexA(COLORS.mint, 0.2 + i * 0.16),
          }}
        />
      ))}
    </div>
  );
};
