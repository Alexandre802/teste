import type { FC, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { Layer } from "../components/Layer";
import { Logo } from "../components/Logo";
import { Card, IconTile, Label } from "../components/ui";
import { Headline, NumberText } from "../components/Text";
import { DashedPath, ProgressBar } from "../components/Charts";
import { Icon } from "../components/Icons";
import { COLORS, FONT, RADIUS, SPRING, hexA } from "../config/theme";
import { COPY } from "../config/copy";
import type { SceneConfig } from "../config/scenes";
import { SceneShell } from "./shell";

const S = COPY.s2;

/** Card solto que "cai" na tela vindo de uma direção — a ideia de espalhado. */
const Scatter: FC<{
  x: number;
  y: number;
  w: number;
  rotate: number;
  delay: number;
  from: { x?: number; y?: number };
  children: ReactNode;
  pad?: number;
  radius?: number;
  variant?: "light" | "pale";
  float?: number;
}> = ({ x, y, w, rotate, delay, from, children, pad = 22, radius = RADIUS.md, variant = "light", float = 4 }) => (
  <Layer
    x={x}
    y={y}
    w={w}
    rotate={rotate}
    enter={{
      delay,
      x: from.x ?? 0,
      y: from.y ?? 0,
      scale: 0.86,
      rotate: rotate > 0 ? -14 : 14,
      blur: 9,
      config: SPRING.pop,
    }}
    float={{ amp: float, period: 120 + (delay % 40), phase: delay }}
  >
    <Card pad={pad} radius={radius} variant={variant}>
      {children}
    </Card>
  </Layer>
);

const RowText: FC<{ children: ReactNode; size?: number; color?: string; weight?: number }> = ({
  children,
  size = 21,
  color = COLORS.inkSoft,
  weight = FONT.medium,
}) => (
  <span style={{ fontFamily: FONT.family, fontSize: size, fontWeight: weight, color }}>{children}</span>
);

/** Cena 2 — "…ganhos e gastos espalhados em anotações, planilhas e contas diferentes." */
export const Scene02: FC<{ cfg: SceneConfig }> = ({ cfg }) => (
  <SceneShell cfg={cfg}>
    <AbsoluteFill>
      <Layer x={78} y={92} enter={{ delay: 0, x: -70 }}>
        <Logo size={62} delay={1} />
      </Layer>

      <Layer x={88} y={278} w={620} enter={{ fade: false }}>
        <Headline lines={S.headline} size={108} delay={1} step={10} lineHeight={1.02} />
      </Layer>

      <Layer x={92} y={640} enter={{ delay: 46, y: 26 }}>
        <div
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.medium,
            fontSize: 46,
            lineHeight: 1.24,
            color: COLORS.inkSoft,
          }}
        >
          {S.sub.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </Layer>

      {/* setas pontilhadas conectando a bagunça */}
      <Layer x={556} y={300} enter={{ delay: 62, fade: true }}>
        <DashedPath id="s2a" d="M 6 96 C 60 96, 90 24, 168 12" width={190} height={110} delay={62} duration={26} arrow />
      </Layer>
      <Layer x={470} y={770} enter={{ delay: 96, fade: true }}>
        <DashedPath id="s2b" d="M 6 116 C 70 112, 96 26, 176 14" width={196} height={130} delay={96} duration={26} arrow />
      </Layer>
      <Layer x={836} y={800} enter={{ delay: 108, fade: true }}>
        <DashedPath id="s2c" d="M 150 6 C 176 60, 150 120, 86 138" width={190} height={150} delay={108} duration={26} />
      </Layer>
      <Layer x={430} y={1040} enter={{ delay: 128, fade: true }}>
        <DashedPath id="s2d" d="M 190 12 C 120 26, 70 26, 8 22" width={200} height={60} delay={128} duration={24} arrow />
      </Layer>
      <Layer x={62} y={1380} enter={{ delay: 150, fade: true }}>
        <DashedPath id="s2e" d="M 6 10 C 6 90, 60 140, 150 152" width={180} height={170} delay={150} duration={28} arrow />
      </Layer>

      {/* anotação rápida */}
      <Scatter x={720} y={222} w={318} rotate={-3.5} delay={56} from={{ x: 150, y: -70 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <IconTile name="note" size={44} tone="mint" radius={13} />
          <RowText size={22} weight={FONT.semi} color={COLORS.ink}>
            {S.note.title}
          </RowText>
        </div>
        {S.note.lines.map((l, i) => (
          <div
            key={l}
            style={{
              borderBottom: `1.5px solid ${COLORS.line}`,
              padding: "9px 0",
              fontFamily: FONT.family,
              fontSize: 20,
              fontStyle: "italic",
              color: COLORS.inkSoft,
              transform: `rotate(${i % 2 ? -0.5 : 0.4}deg)`,
            }}
          >
            {l}
          </div>
        ))}
      </Scatter>

      {/* calculadora solta */}
      <Layer
        x={902}
        y={566}
        w={92}
        h={92}
        enter={{ delay: 76, scale: 0.4, rotate: 24, config: SPRING.bouncy }}
        float={{ amp: 7, period: 96 }}
      >
        <Card pad={0} radius={26} style={{ width: 92, height: 92, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="calculator" size={46} color={COLORS.green} />
        </Card>
      </Layer>

      {/* conta PJ */}
      <Scatter x={624} y={706} w={340} rotate={-3} delay={80} from={{ x: 140, y: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <IconTile name="bank" size={52} tone="pale" radius={15} />
          <div>
            <RowText size={21}>{S.pj.label}</RowText>
            <div style={{ fontFamily: FONT.family, fontWeight: FONT.bold, fontSize: 32, color: COLORS.green }}>
              R$ <NumberText value={S.pj.value} delay={84} duration={24} />
            </div>
          </div>
        </div>
      </Scatter>

      {/* planilha maio */}
      <Scatter x={48} y={822} w={484} rotate={-4} delay={92} from={{ x: -160, y: 40 }} pad={24}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <IconTile name="sheet" size={46} tone="mint" radius={13} />
          <RowText size={23} weight={FONT.semi} color={COLORS.ink}>
            {S.sheet.title}
          </RowText>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              {S.sheet.head.map((h) => (
                <td key={h} style={{ borderBottom: `1.5px solid ${COLORS.line}`, padding: "10px 6px" }}>
                  <RowText size={20} color={COLORS.muted}>
                    {h}
                  </RowText>
                </td>
              ))}
            </tr>
            {S.sheet.rows.map((r) => (
              <tr key={r[0]}>
                {r.map((cell, ci) => (
                  <td
                    key={cell}
                    style={{
                      borderBottom: `1.5px solid ${COLORS.line}`,
                      padding: "10px 6px",
                      textAlign: ci === 1 ? "right" : "left",
                    }}
                  >
                    <RowText size={20} color={cell.startsWith("–") ? COLORS.red : COLORS.inkSoft}>
                      {cell}
                    </RowText>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Scatter>

      {/* recebimento */}
      <Scatter x={548} y={912} w={316} rotate={2} delay={100} from={{ x: 90, y: -50 }} pad={18} radius={20}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <IconTile name="arrowUpRight" size={48} tone="mint" radius={14} />
          <div>
            <RowText size={20}>{S.inflow.label}</RowText>
            <div style={{ fontFamily: FONT.family, fontWeight: FONT.bold, fontSize: 26, color: COLORS.green, whiteSpace: "nowrap" }}>
              + R$ <NumberText value={S.inflow.value} delay={104} duration={20} />
            </div>
          </div>
        </div>
      </Scatter>

      {/* despesa */}
      <Scatter x={782} y={994} w={288} rotate={-4} delay={112} from={{ x: 110, y: 30 }} pad={18} radius={20}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconTile name="arrowDownRight" size={46} tone="red" radius={14} />
          <div>
            <RowText size={20}>{S.outflow.label}</RowText>
            <div style={{ fontFamily: FONT.family, fontWeight: FONT.bold, fontSize: 26, color: COLORS.red, whiteSpace: "nowrap" }}>
              – R$ <NumberText value={S.outflow.value} delay={116} duration={18} />
            </div>
          </div>
        </div>
      </Scatter>

      {/* controle de pagamentos */}
      <Scatter x={560} y={1178} w={470} rotate={-2} delay={120} from={{ x: 150, y: 60 }} pad={24}>
        <RowText size={23} weight={FONT.semi} color={COLORS.ink}>
          {S.payments.title}
        </RowText>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 14 }}>
          <tbody>
            <tr>
              {S.payments.head.map((h) => (
                <td key={h} style={{ borderBottom: `1.5px solid ${COLORS.line}`, padding: "9px 5px" }}>
                  <RowText size={19} color={COLORS.muted}>
                    {h}
                  </RowText>
                </td>
              ))}
            </tr>
            {S.payments.rows.map((r) => (
              <tr key={r[0]}>
                {r.map((cell, ci) => (
                  <td
                    key={cell}
                    style={{
                      borderBottom: `1.5px solid ${COLORS.line}`,
                      padding: "9px 5px",
                      textAlign: ci === 2 ? "right" : "left",
                    }}
                  >
                    <RowText size={19} color={cell.startsWith("–") ? COLORS.red : COLORS.inkSoft}>
                      {cell}
                    </RowText>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Scatter>

      {/* conta pessoal */}
      <Scatter x={144} y={1250} w={306} rotate={2.5} delay={132} from={{ x: -120, y: 40 }} pad={20}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <IconTile name="bank" size={50} tone="pale" radius={15} />
          <div>
            <RowText size={20}>{S.personal.label}</RowText>
            <div style={{ fontFamily: FONT.family, fontWeight: FONT.bold, fontSize: 30, color: COLORS.green }}>
              R$ <NumberText value={S.personal.value} delay={136} duration={22} />
            </div>
          </div>
        </div>
      </Scatter>

      {/* post-it */}
      <Layer
        x={112}
        y={1488}
        w={214}
        rotate={-6}
        enter={{ delay: 140, y: 90, scale: 0.8, rotate: 16, blur: 8, config: SPRING.pop }}
        float={{ amp: 5, period: 108, phase: 40 }}
      >
        <div
          style={{
            background: COLORS.pale,
            padding: "26px 20px 22px",
            borderRadius: 6,
            boxShadow: `0 12px 26px ${hexA(COLORS.ink, 0.1)}`,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -12,
              left: 46,
              width: 76,
              height: 26,
              background: hexA("#D9C48A", 0.55),
              transform: "rotate(-4deg)",
            }}
          />
          <div style={{ fontFamily: FONT.family, fontSize: 21, fontStyle: "italic", color: COLORS.greenInk, fontWeight: FONT.semi }}>
            {S.sticky.title}
          </div>
          {S.sticky.lines.map((l) => (
            <div
              key={l}
              style={{ fontFamily: FONT.family, fontSize: 19, fontStyle: "italic", color: COLORS.greenDeep, marginTop: 9 }}
            >
              {l}
            </div>
          ))}
        </div>
      </Layer>

      {/* cartão de crédito */}
      <Scatter x={382} y={1520} w={286} rotate={2} delay={144} from={{ y: 130 }} pad={22}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <IconTile name="card" size={48} tone="pale" radius={14} />
          <div>
            <RowText size={20}>{S.card.label}</RowText>
            <div style={{ fontFamily: FONT.family, fontWeight: FONT.bold, fontSize: 28, color: COLORS.green }}>
              R$ <NumberText value={S.card.value} delay={148} duration={22} />
            </div>
          </div>
        </div>
        <Label size={18} color={COLORS.mutedSoft} style={{ marginTop: 14 }}>
          {S.card.limitLabel}
        </Label>
        <RowText size={20} color={COLORS.inkSoft}>
          R$ <NumberText value={S.card.limit} delay={152} duration={20} />
        </RowText>
        <ProgressBar pct={68} width={240} height={11} delay={154} duration={26} style={{ marginTop: 10 }} />
      </Scatter>

      {/* ícone de planilha */}
      <Layer
        x={874}
        y={1540}
        w={80}
        h={80}
        enter={{ delay: 158, scale: 0.4, rotate: -22, config: SPRING.bouncy }}
        float={{ amp: 6, period: 88, phase: 20 }}
      >
        <Card pad={0} radius={22} style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="sheet" size={40} color={COLORS.greenBright} />
        </Card>
      </Layer>

      {/* banco digital */}
      <Scatter x={696} y={1710} w={332} rotate={-2} delay={162} from={{ x: 130, y: 70 }} pad={20}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <IconTile name="bank" size={50} tone="pale" radius={15} />
          <div>
            <RowText size={20}>{S.digital.label}</RowText>
            <div style={{ fontFamily: FONT.family, fontWeight: FONT.bold, fontSize: 30, color: COLORS.green }}>
              R$ <NumberText value={S.digital.value} delay={166} duration={22} />
            </div>
          </div>
        </div>
      </Scatter>

      {/* ícones soltos no rodapé */}
      <Layer
        x={106}
        y={1752}
        w={92}
        h={92}
        enter={{ delay: 168, scale: 0.4, rotate: 18, config: SPRING.bouncy }}
        float={{ amp: 6, period: 104, phase: 60 }}
      >
        <Card pad={0} radius={26} style={{ width: 92, height: 92, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="bank" size={46} color={COLORS.greenDeep} />
        </Card>
      </Layer>
      <Layer
        x={500}
        y={1810}
        w={84}
        h={84}
        enter={{ delay: 174, scale: 0.4, rotate: -20, config: SPRING.bouncy }}
        float={{ amp: 5, period: 92, phase: 10 }}
      >
        <Card pad={0} radius={24} style={{ width: 84, height: 84, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="bars" size={42} color={COLORS.green} />
        </Card>
      </Layer>
    </AbsoluteFill>
  </SceneShell>
);
