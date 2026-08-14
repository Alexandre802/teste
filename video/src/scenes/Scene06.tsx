import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Layer } from "../components/Layer";
import { Card, IconTile, Label, Value } from "../components/ui";
import { BulletLine, Headline, NumberText } from "../components/Text";
import { GroupedBars, Sparkline, Timeline } from "../components/Charts";
import { useProgress, useSpringIn } from "../components/anim";
import { COLORS, FONT, RADIUS, SPRING, hexA } from "../config/theme";
import { COPY } from "../config/copy";
import type { SceneConfig } from "../config/scenes";
import { SceneShell } from "./shell";

const S = COPY.s6;

const SPARKS = [
  [4, 3, 5, 4.5, 6, 5.5, 7, 6.5, 8, 7.5, 9.5, 11],
  [3, 4, 3.5, 5, 4.5, 6, 5.5, 6.5, 6, 7, 6.5, 8],
  [3, 2.6, 4, 3.4, 5, 4.4, 6, 5.4, 7, 6.2, 8, 9.5],
];
const DIR_ICON = { in: "arrowIn", out: "arrowOut", eq: "equals" } as const;

/** Cena 6 — "Você acompanha tudo que entrou e saiu por dia, semana, mês, 90 dias ou ano." */
export const Scene06: FC<{ cfg: SceneConfig }> = ({ cfg }) => (
  <SceneShell cfg={cfg}>
    <AbsoluteFill>
      <Layer x={124} y={224} w={860} enter={{ fade: false }}>
        <Headline lines={S.headline} size={120} delay={8} step={10} lineHeight={1.0} />
      </Layer>

      <Layer x={128} y={620} enter={{ delay: 44, y: 24 }}>
        <BulletLine items={S.sub} size={46} delay={44} step={3} color={COLORS.ink} weight={FONT.medium} />
      </Layer>

      {/* barra de abas com pílula deslizante */}
      <Layer x={82} y={752} w={892} enter={{ delay: 56, y: 40, scale: 0.94, config: SPRING.pop }}>
        <TabBar />
      </Layer>

      {/* três cards de estatística */}
      {S.stats.map((st, i) => (
        <Layer
          key={st.label}
          x={52 + i * 334}
          y={866}
          w={312}
          enter={{ delay: 90 + i * 8, y: 60, scale: 0.9, blur: 6, config: SPRING.pop }}
          float={{ amp: 3, period: 130 + i * 16, phase: i * 22 }}
        >
          <Card pad={22} radius={RADIUS.lg}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <IconTile
                name={DIR_ICON[st.dir as keyof typeof DIR_ICON]}
                size={50}
                tone={st.dir === "in" ? "mint" : st.dir === "out" ? "deep" : "pale"}
                radius={15}
              />
              <Label size={24} color={COLORS.inkSoft} weight={FONT.semi}>
                {st.label}
              </Label>
            </div>
            <Value size={34} color={COLORS.ink} style={{ marginTop: 14, whiteSpace: "nowrap" }}>
              R$ <NumberText value={st.value} delay={94 + i * 8} duration={30} />
            </Value>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 12 }}>
              <div>
                <Value size={25} color={COLORS.green} style={{ whiteSpace: "nowrap" }}>
                  <NumberText value={st.delta} decimals={2} suffix="%" delay={98 + i * 8} duration={26} signed />
                </Value>
                <Label size={15} color={COLORS.mutedSoft} style={{ marginTop: 3, whiteSpace: "nowrap" }}>
                  {S.deltaNote}
                </Label>
              </div>
              <Sparkline
                id={`s6-${i}`}
                values={SPARKS[i]}
                width={124}
                height={62}
                delay={114 + i * 6}
                duration={24}
                strokeWidth={3.6}
              />
            </div>
          </Card>
        </Layer>
      ))}

      {/* fluxo financeiro */}
      <Layer
        x={52}
        y={1134}
        w={648}
        enter={{ delay: 124, y: 90, scale: 0.94, blur: 6, config: SPRING.pop }}
      >
        <Card pad={26} radius={RADIUS.lg}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Label size={26} color={COLORS.ink} weight={FONT.bold}>
              {S.flow.title}
            </Label>
            <div style={{ display: "flex", gap: 14 }}>
              {S.flow.legend.map((l, i) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 99,
                      background: [COLORS.greenBright, COLORS.greenInk, COLORS.mint][i],
                    }}
                  />
                  <Label size={17}>{l}</Label>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <GroupedBars
              series={S.flow.series.map((s) => [...s])}
              labels={S.flow.months}
              colors={[COLORS.greenBright, COLORS.greenInk, COLORS.mint]}
              width={596}
              height={286}
              delay={130}
              step={6}
              yTicks={[60, 40, 20, 0, -20, -40]}
              labelSize={19}
            />
          </div>
        </Card>
      </Layer>

      {/* resumo do período */}
      <Layer
        x={716}
        y={1134}
        w={316}
        enter={{ delay: 168, x: 90, scale: 0.94, blur: 6, config: SPRING.pop }}
      >
        <Card pad={24} radius={RADIUS.lg}>
          <Label size={25} color={COLORS.ink} weight={FONT.bold}>
            {S.summary.title}
          </Label>
          {S.summary.rows.map((r, i) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 20,
                paddingBottom: 16,
                borderBottom: i < 2 ? `1.5px solid ${COLORS.line}` : "none",
              }}
            >
              <IconTile
                name={r.dir === "in" ? "arrowIn" : r.dir === "out" ? "arrowOut" : "trendUp"}
                size={52}
                tone={r.dir === "out" ? "deep" : "mint"}
                radius={99}
              />
              <div style={{ minWidth: 0 }}>
                <Label size={18}>{r.label}</Label>
                <Value size={26} style={{ marginTop: 2, whiteSpace: "nowrap" }}>
                  R$ <NumberText value={r.value} delay={174 + i * 6} duration={24} />
                </Value>
                <Label size={16} color={COLORS.mutedSoft} style={{ marginTop: 2 }}>
                  {r.date}
                </Label>
              </div>
            </div>
          ))}
        </Card>
      </Layer>

      {/* linha do tempo */}
      <Layer
        x={52}
        y={1606}
        w={980}
        enter={{ delay: 182, y: 70, scale: 0.96, config: SPRING.pop }}
      >
        <Card pad={26} radius={RADIUS.lg}>
          <Label size={25} color={COLORS.ink} weight={FONT.bold} style={{ marginBottom: 22 }}>
            {S.timeline.title}
          </Label>
          <div style={{ paddingLeft: 74, paddingRight: 74 }}>
            <Timeline points={S.timeline.points} active={S.timeline.active} width={780} delay={186} step={4} />
          </div>
        </Card>
      </Layer>
    </AbsoluteFill>
  </SceneShell>
);

/** Segmented control cujo indicador desliza até a aba ativa. */
const TabBar: FC = () => {
  const n = S.tabs.length;
  const inner = 892 - 16;
  const seg = inner / n;
  // percorre Dia -> Semana -> Mês em três passos, sincronizado com os cliques
  const step1 = useProgress(64, 7);
  const step2 = useProgress(72, 7);
  const step3 = useProgress(80, 8);
  const pos = step1 * 1 + step2 * 0.5 + step3 * 0.5;
  const appear = useSpringIn(56, SPRING.pop);

  return (
    <div
      style={{
        position: "relative",
        background: COLORS.white,
        borderRadius: RADIUS.pill,
        padding: 8,
        boxShadow: "0 16px 40px rgba(11,42,32,0.09)",
        display: "flex",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 8 + pos * seg,
          top: 8,
          width: seg,
          height: "calc(100% - 16px)",
          borderRadius: RADIUS.pill,
          background: `linear-gradient(135deg, ${COLORS.greenBright}, ${COLORS.green})`,
          opacity: appear,
          boxShadow: `0 8px 20px ${hexA(COLORS.green, 0.34)}`,
        }}
      />
      {S.tabs.map((t, i) => {
        const active = Math.abs(pos - i) < 0.5;
        return (
          <div
            key={t}
            style={{
              width: seg,
              textAlign: "center",
              padding: "18px 0",
              position: "relative",
              fontFamily: FONT.family,
              fontSize: 28,
              fontWeight: active ? FONT.bold : FONT.medium,
              color: active ? COLORS.white : COLORS.inkSoft,
              opacity: interpolate(appear, [0, 1], [0, 1]),
            }}
          >
            {t}
          </div>
        );
      })}
    </div>
  );
};
