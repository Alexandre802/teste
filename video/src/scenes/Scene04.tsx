import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Layer } from "../components/Layer";
import { Logo } from "../components/Logo";
import { Card, IconTile, Label, Value } from "../components/ui";
import { Headline, NumberText } from "../components/Text";
import { smoothPath } from "../components/Charts";
import { useProgress, useSpringIn } from "../components/anim";
import { COLORS, FONT, RADIUS, SPRING, hexA } from "../config/theme";
import { COPY } from "../config/copy";
import type { SceneConfig } from "../config/scenes";
import { SceneShell } from "./shell";

const S = COPY.s4;

const PAST = [8, 6.5, 9, 8, 11, 9.5, 13.5, 12, 15, 13, 16.5, 14.5, 13];
const FUTURE = [13, 12.4, 11.2, 11.8, 10.4, 9.6, 10.2];

/** Cena 4 — "Quanto realmente sobrou? E quanto vai fechar na próxima semana?" */
export const Scene04: FC<{ cfg: SceneConfig }> = ({ cfg }) => (
  <SceneShell cfg={cfg}>
    <AbsoluteFill>
      <Layer x={78} y={92} enter={{ delay: 4, x: -70 }}>
        <Logo size={64} delay={6} />
      </Layer>

      {/* card Mês atual */}
      <Layer
        x={520}
        y={206}
        w={536}
        rotate={-2.4}
        enter={{ delay: 60, x: 130, y: -40, scale: 0.9, blur: 8, config: SPRING.pop }}
        float={{ amp: 5, period: 128 }}
      >
        <Card pad={28} radius={RADIUS.xl} style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <IconTile name="calendar" size={74} tone="mint" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label size={24} style={{ whiteSpace: "nowrap" }}>
              {S.month.label}
            </Label>
            <Value size={46} style={{ marginTop: 6, whiteSpace: "nowrap" }}>
              R$ <NumberText value={S.month.value} delay={64} duration={34} />
            </Value>
            <Label size={22} color={COLORS.mutedSoft} style={{ marginTop: 4 }}>
              {S.month.note}
            </Label>
          </div>
          <QuestionDot size={62} delay={72} tone="pale" />
        </Card>
      </Layer>

      <Layer x={186} y={452} w={800} enter={{ fade: false }}>
        <Headline lines={S.headline} size={136} delay={14} step={11} lineHeight={1.0} />
      </Layer>

      <Layer x={190} y={892} enter={{ delay: 50, y: 30 }}>
        <div
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.medium,
            fontSize: 52,
            lineHeight: 1.24,
            color: COLORS.inkSoft,
          }}
        >
          {S.sub.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </Layer>

      {/* card Previsão */}
      <Layer
        x={92}
        y={1014}
        w={534}
        rotate={-2}
        enter={{ delay: 82, x: -150, y: 40, scale: 0.9, blur: 8, config: SPRING.pop }}
        float={{ amp: 5, period: 142, phase: 40 }}
      >
        <Card pad={26} radius={RADIUS.xl} style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <IconTile name="chartDots" size={70} tone="pale" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label size={22} style={{ whiteSpace: "nowrap" }}>
              {S.forecast.label}
            </Label>
            <Value size={44} style={{ marginTop: 6, whiteSpace: "nowrap" }}>
              -R$ <NumberText value={Math.abs(S.forecast.value)} delay={86} duration={30} />
            </Value>
            <Label size={21} color={COLORS.mutedSoft} style={{ marginTop: 4 }}>
              {S.forecast.note}
            </Label>
          </div>
          <QuestionDot size={56} delay={94} tone="pale" />
        </Card>
      </Layer>

      {/* mini calendário */}
      <Layer
        x={680}
        y={962}
        w={330}
        enter={{ delay: 106, x: 120, scale: 0.9, blur: 6, config: SPRING.pop }}
        float={{ amp: 4, period: 134, phase: 70 }}
      >
        <Card pad={22} radius={RADIUS.lg}>
          <MiniCalendar />
        </Card>
      </Layer>

      {/* "?" solto */}
      <Layer
        x={118}
        y={1396}
        w={92}
        h={92}
        enter={{ delay: 100, scale: 0.4, rotate: -20, config: SPRING.bouncy }}
        float={{ amp: 8, period: 96 }}
      >
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: 28,
            background: COLORS.greenInk,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 16px 36px rgba(8,40,30,0.3)",
          }}
        >
          <span style={{ fontFamily: FONT.family, fontWeight: FONT.black, fontSize: 46, color: COLORS.mint }}>
            ?
          </span>
        </div>
      </Layer>

      {/* card Projeção de saldo */}
      <Layer
        x={296}
        y={1238}
        w={748}
        rotate={-1.4}
        enter={{ delay: 138, y: 120, x: 60, scale: 0.92, blur: 8, config: SPRING.pop }}
        float={{ amp: 5, period: 158, phase: 20 }}
      >
        <Card pad={30} radius={RADIUS.xl}>
          <Label size={27} color={COLORS.inkSoft} weight={FONT.semi}>
            {S.projection.title}
          </Label>
          <ProjectionChart />
        </Card>
      </Layer>

      {/* card Insights */}
      <Layer
        x={102}
        y={1690}
        w={420}
        rotate={-2}
        enter={{ delay: 212, y: 90, scale: 0.92, config: SPRING.pop }}
      >
        <Card pad={24} radius={RADIUS.lg} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <IconTile name="bulb" size={62} tone="mint" />
          <div>
            <div style={{ fontFamily: FONT.family, fontWeight: FONT.bold, fontSize: 26, color: COLORS.ink }}>
              {S.insight.title}
            </div>
            {S.insight.body.map((l) => (
              <Label key={l} size={21} color={COLORS.mutedSoft} style={{ marginTop: 4 }}>
                {l}
              </Label>
            ))}
          </div>
        </Card>
      </Layer>
    </AbsoluteFill>
  </SceneShell>
);

const QuestionDot: FC<{ size: number; delay: number; tone: "pale" | "deep" }> = ({ size, delay, tone }) => {
  const p = useSpringIn(delay, SPRING.bouncy);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: tone === "pale" ? COLORS.palest : COLORS.greenInk,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transform: `scale(${p.toFixed(3)})`,
      }}
    >
      <span
        style={{
          fontFamily: FONT.family,
          fontWeight: FONT.bold,
          fontSize: size * 0.5,
          color: tone === "pale" ? COLORS.green : COLORS.mint,
        }}
      >
        ?
      </span>
    </div>
  );
};

const MiniCalendar: FC = () => {
  const days = [
    [28, 29, 30, 31, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
  ];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
        {S.calendar.weekdays.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontFamily: FONT.family,
              fontSize: 22,
              fontWeight: FONT.semi,
              color: COLORS.muted,
            }}
          >
            {d}
          </div>
        ))}
      </div>
      {days.map((row, ri) => (
        <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {row.map((d, di) => (
            <CalendarDay
              key={`${ri}-${di}`}
              day={d}
              dim={ri === 0 && d > 20}
              today={ri === 1 && d === S.calendar.today}
              delay={112 + (ri * 7 + di) * 1.4}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const CalendarDay: FC<{ day: number; dim: boolean; today: boolean; delay: number }> = ({
  day,
  dim,
  today,
  delay,
}) => {
  const p = useSpringIn(delay, SPRING.snappy);
  return (
    <div
      style={{
        height: 46,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: p,
        transform: `scale(${today ? 0.7 + 0.3 * p : 1})`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 99,
          background: today ? COLORS.greenDeep : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.family,
          fontSize: 22,
          fontWeight: today ? FONT.bold : FONT.medium,
          color: today ? COLORS.white : dim ? COLORS.mutedSoft : COLORS.inkSoft,
        }}
      >
        {day}
      </div>
    </div>
  );
};

/** Histórico sólido + leque de incerteza + projeção pontilhada. */
const ProjectionChart: FC = () => {
  const W = 688;
  const H = 300;
  const draw = useProgress(148, 46);
  const fan = useProgress(196, 34);

  const all = [...PAST, ...FUTURE];
  const min = Math.min(...all) - 3;
  const max = Math.max(...all) + 3;
  const nowX = W * 0.56;

  const toXY = (arr: number[], x0: number, x1: number) =>
    arr.map((v, i) => ({
      x: x0 + (i / (arr.length - 1)) * (x1 - x0),
      y: H - 46 - ((v - min) / (max - min)) * (H - 92),
    }));

  const past = toXY(PAST, 6, nowX);
  const future = toXY(FUTURE, nowX, W - 10);
  const pastD = smoothPath(past);
  const futureD = smoothPath(future);

  const fanTop = future.map((p, i) => ({ x: p.x, y: p.y - (i / (future.length - 1)) * 78 * fan }));
  const fanBottom = future.map((p, i) => ({ x: p.x, y: p.y + (i / (future.length - 1)) * 88 * fan }));
  const fanD = `${smoothPath(fanTop)} L ${fanBottom[fanBottom.length - 1].x} ${
    fanBottom[fanBottom.length - 1].y
  } ${smoothPath([...fanBottom].reverse()).replace(/^M[^C]*/, "")} Z`;

  return (
    <div style={{ position: "relative", width: W, height: H + 46, marginTop: 14 }}>
      <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <clipPath id="s4-clip">
            <rect x={0} y={-40} width={nowX * draw} height={H + 80} />
          </clipPath>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={0}
            x2={W}
            y1={22 + i * ((H - 68) / 3)}
            y2={22 + i * ((H - 68) / 3)}
            stroke={COLORS.line}
            strokeWidth={1.4}
          />
        ))}

        {/* leque de incerteza */}
        <path d={fanD} fill={hexA(COLORS.green, 0.13)} opacity={fan} />

        {/* histórico */}
        <path
          d={pastD}
          fill="none"
          stroke={COLORS.greenDeep}
          strokeWidth={6}
          strokeLinecap="round"
          clipPath="url(#s4-clip)"
        />
        <circle cx={past[past.length - 1].x} cy={past[past.length - 1].y} r={draw > 0.97 ? 11 : 0} fill={COLORS.greenDeep} />

        {/* projeção */}
        <path
          d={futureD}
          fill="none"
          stroke={COLORS.green}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray="3 14"
          pathLength={1}
          strokeDashoffset={1 - fan}
          opacity={fan}
        />

        {/* linha de hoje */}
        <line
          x1={nowX}
          x2={nowX}
          y1={-6}
          y2={H - 30}
          stroke={COLORS.mutedSoft}
          strokeWidth={2}
          strokeDasharray="6 8"
          opacity={interpolate(draw, [0.6, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
        <text
          x={nowX + 14}
          y={4}
          fontFamily={FONT.family}
          fontSize={22}
          fontWeight={FONT.semi}
          fill={COLORS.inkSoft}
          opacity={interpolate(draw, [0.7, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        >
          {S.projection.nowLabel}
        </text>

        {/* "?" no fim da projeção */}
        <text
          x={W - 44}
          y={future[future.length - 1].y - 34}
          fontFamily={FONT.family}
          fontSize={46}
          fontWeight={FONT.black}
          fill={COLORS.greenInk}
          opacity={fan}
        >
          ?
        </text>

        {[
          { t: "30k", v: 3 },
          { t: "20k", v: 2 },
          { t: "10k", v: 1 },
          { t: "0", v: 0 },
        ].map((tick, i) => (
          <text
            key={tick.t}
            x={-14}
            y={28 + i * ((H - 68) / 3)}
            textAnchor="end"
            fontFamily={FONT.family}
            fontSize={19}
            fontWeight={FONT.medium}
            fill={COLORS.mutedSoft}
          >
            {tick.t}
          </text>
        ))}
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
          fontFamily: FONT.family,
          fontSize: 20,
          fontWeight: FONT.medium,
          color: COLORS.mutedSoft,
        }}
      >
        {S.projection.axis.map((a) => (
          <span key={a}>{a}</span>
        ))}
      </div>
    </div>
  );
};
