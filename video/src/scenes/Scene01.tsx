import type { FC } from "react";
import { AbsoluteFill } from "remotion";
import { Layer } from "../components/Layer";
import { Logo } from "../components/Logo";
import { Card, IconTile, Label, Pill, Value } from "../components/ui";
import { Headline, NumberText } from "../components/Text";
import { DashedPath, MiniBars, Sparkline } from "../components/Charts";
import { Icon } from "../components/Icons";
import { COLORS, FONT, RADIUS, SPRING } from "../config/theme";
import { COPY } from "../config/copy";
import type { SceneConfig } from "../config/scenes";
import { SceneShell } from "./shell";

const S = COPY.s1;

const PERF_SPARK = [4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 10, 9, 13];
const BANK_SPARK = [6, 5, 7, 6, 5, 7, 8, 7, 9, 8, 10, 9, 11, 13, 12, 15.5];
const METHOD_BARS = [2, 3, 3.6, 4.6, 6];
const SUREBET_BARS = [2, 3, 2.4, 4, 5, 4.2, 6, 7, 6.2, 8];

/** Cena 1 — "Método não dá resultado. Mas sabe por quê?" */
export const Scene01: FC<{ cfg: SceneConfig }> = ({ cfg }) => (
  <SceneShell cfg={cfg}>
    <AbsoluteFill>
      {/* decorativos */}
      <Layer x={706} y={1256} enter={{ delay: 128, fade: true }}>
        <DashedPath
          id="s1a"
          d="M 0 84 C 90 84, 150 18, 254 12"
          width={286}
          height={100}
          color={COLORS.pale}
          delay={128}
          duration={30}
          arrow
        />
      </Layer>
      <Layer x={210} y={1470} enter={{ delay: 118, fade: true }}>
        <DashedPath
          id="s1b"
          d="M 0 130 C 60 130, 90 40, 200 22 C 280 10, 330 6, 380 6"
          width={400}
          height={150}
          color={COLORS.pale}
          delay={118}
          duration={34}
        />
      </Layer>

      <Layer x={78} y={90} enter={{ delay: 0, x: -70 }}>
        <Logo size={66} delay={0} />
      </Layer>

      {/* card Desempenho */}
      <Layer
        x={494}
        y={188}
        w={562}
        rotate={-2.2}
        enter={{ delay: 62, x: 120, y: -30, scale: 0.9, blur: 8, config: SPRING.pop }}
        float={{ amp: 5, period: 130 }}
      >
        <Card pad={28} radius={RADIUS.xl} style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <IconTile name="trendUp" size={74} tone="mint" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label size={24} style={{ whiteSpace: "nowrap" }}>
              {S.perf.label}
            </Label>
            <Value size={48} style={{ marginTop: 4, whiteSpace: "nowrap" }}>
              <NumberText value={S.perf.value} decimals={2} suffix="%" delay={66} signed />
            </Value>
            <Label size={22} color={COLORS.mutedSoft} style={{ marginTop: 4, whiteSpace: "nowrap" }}>
              {S.perf.note}
            </Label>
          </div>
          <Sparkline
            id="s1-perf"
            values={PERF_SPARK}
            width={126}
            height={100}
            delay={68}
            duration={26}
            strokeWidth={5}
          />
        </Card>
      </Layer>

      {/* card Métodos testados */}
      <Layer
        x={78}
        y={470}
        w={512}
        rotate={1.6}
        enter={{ delay: 78, x: -140, scale: 0.92, blur: 8, config: SPRING.pop }}
        float={{ amp: 4, period: 150, phase: 30 }}
      >
        <Card pad={24} radius={RADIUS.lg} style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <IconTile name="target" size={70} tone="deep" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label size={23} style={{ whiteSpace: "nowrap" }}>
              {S.methods.label}
            </Label>
            <Value size={46} color={COLORS.ink} style={{ marginTop: 2 }}>
              <NumberText value={S.methods.value} decimals={0} delay={82} duration={26} />
            </Value>
          </div>
          <MiniBars values={METHOD_BARS} width={106} height={64} delay={84} step={3} />
        </Card>
      </Layer>

      {/* headline */}
      <Layer x={0} y={648} w={1080} enter={{ fade: false }}>
        <Headline lines={S.headline} size={150} delay={2} step={9} align="center" lineHeight={0.99} />
      </Layer>

      <Layer x={0} y={1148} w={1080} enter={{ delay: 44, y: 26 }}>
        <div
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.medium,
            fontSize: 54,
            color: COLORS.inkSoft,
            textAlign: "center",
          }}
        >
          {S.sub}
        </div>
      </Layer>

      {/* tile de compartilhar */}
      <Layer
        x={872}
        y={1216}
        w={106}
        h={106}
        enter={{ delay: 142, scale: 0.5, rotate: -18, config: SPRING.bouncy }}
        float={{ amp: 8, period: 100 }}
      >
        <div
          style={{
            width: 106,
            height: 106,
            borderRadius: 32,
            background: COLORS.greenInk,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 40px rgba(8,40,30,0.32)",
          }}
        >
          <Icon name="share" size={50} color={COLORS.mint} width={2.2} />
        </div>
      </Layer>

      {/* card Surebets identificadas */}
      <Layer
        x={66}
        y={1316}
        w={406}
        rotate={-1.6}
        enter={{ delay: 96, x: -130, y: 30, scale: 0.92, blur: 6, config: SPRING.pop }}
        float={{ amp: 5, period: 140, phase: 60 }}
      >
        <Card pad={26} radius={RADIUS.lg}>
          <Label size={24}>{S.surebets.label}</Label>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: 8 }}>
            <Value size={58}>
              <NumberText value={S.surebets.value} decimals={0} delay={100} duration={28} />
            </Value>
            <MiniBars values={SUREBET_BARS} width={186} height={78} delay={102} step={2.4} />
          </div>
        </Card>
      </Layer>

      {/* card Evolução da banca */}
      <Layer
        x={486}
        y={1374}
        w={556}
        rotate={1.8}
        enter={{ delay: 110, y: 120, x: 60, scale: 0.92, blur: 8, config: SPRING.pop }}
        float={{ amp: 6, period: 160, phase: 20 }}
      >
        <Card pad={30} radius={RADIUS.xl}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <Label size={26} color={COLORS.inkSoft}>
                {S.bank.label}
              </Label>
              <Value size={52} style={{ marginTop: 8 }}>
                R$ <NumberText value={S.bank.value} delay={116} duration={40} />
              </Value>
            </div>
            <Pill label={S.bank.pill} fontSize={21} />
          </div>
          <Sparkline
            id="s1-bank"
            values={BANK_SPARK}
            width={496}
            height={168}
            delay={120}
            duration={44}
            strokeWidth={7}
            style={{ marginTop: 18 }}
          />
        </Card>
      </Layer>

      {/* card Gestão de banca */}
      <Layer
        x={128}
        y={1752}
        w={578}
        rotate={-1.1}
        enter={{ delay: 132, y: 90, scale: 0.94, config: SPRING.pop }}
      >
        <Card pad={24} radius={RADIUS.lg} style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <IconTile name="calculator" size={72} tone="mint" />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: FONT.family,
                fontWeight: FONT.bold,
                fontSize: 30,
                color: COLORS.ink,
              }}
            >
              {S.mgmt.title}
            </div>
            <Label size={22} color={COLORS.mutedSoft} style={{ marginTop: 4, whiteSpace: "nowrap" }}>
              {S.mgmt.sub}
            </Label>
          </div>
        </Card>
      </Layer>
    </AbsoluteFill>
  </SceneShell>
);
