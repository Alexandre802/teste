import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Layer } from "../components/Layer";
import { Logo } from "../components/Logo";
import { Card, IconTile, Label } from "../components/ui";
import { BulletLine, Headline, NumberText, TypeWriter } from "../components/Text";
import { PhoneFrame } from "../components/PhoneFrame";
import { Icon } from "../components/Icons";
import { useSpringIn } from "../components/anim";
import { COLORS, FONT, SPRING, hexA } from "../config/theme";
import { COPY } from "../config/copy";
import type { SceneConfig } from "../config/scenes";
import { SceneShell } from "./shell";

const S = COPY.s7;
const A = S.app;

const PHONE_W = 524;

/** Cena 7 — "Registra suas surebets em uma calculadora inteligente." */
export const Scene07: FC<{ cfg: SceneConfig }> = ({ cfg }) => (
  <SceneShell cfg={cfg}>
    <AbsoluteFill>
      <Layer x={0} y={214} w={1080} enter={{ fade: false }}>
        <Headline lines={S.headline} size={126} delay={8} step={10} align="center" lineHeight={1.0} />
      </Layer>

      <Layer x={0} y={604} w={1080} enter={{ delay: 44, y: 24 }}>
        <BulletLine
          items={S.sub}
          size={44}
          delay={44}
          step={3}
          color={COLORS.ink}
          style={{ justifyContent: "center" }}
        />
      </Layer>

      {/* badges flutuantes */}
      <Layer
        x={48}
        y={886}
        w={182}
        rotate={-4}
        enter={{ delay: 96, x: -110, scale: 0.8, config: SPRING.bouncy }}
        float={{ amp: 8, period: 118 }}
      >
        <Card pad={22} radius={26} style={{ textAlign: "center" }}>
          <IconTile name="shield" size={62} tone="mint" style={{ margin: "0 auto" }} />
          <div style={{ fontFamily: FONT.family, fontWeight: FONT.bold, fontSize: 34, color: COLORS.ink, marginTop: 10 }}>
            {S.badges[0].top}
          </div>
          <Label size={21} style={{ marginTop: 2 }}>
            {S.badges[0].bottom}
          </Label>
        </Card>
      </Layer>

      <Layer
        x={26}
        y={1396}
        w={210}
        rotate={5}
        enter={{ delay: 150, x: -120, scale: 0.8, config: SPRING.bouncy }}
        float={{ amp: 7, period: 132, phase: 40 }}
      >
        <Card pad={22} radius={26} style={{ textAlign: "center" }}>
          <IconTile name="target" size={58} tone="mint" style={{ margin: "0 auto" }} />
          <Label size={22} color={COLORS.inkSoft} style={{ marginTop: 10 }}>
            {S.badges[1].bottom}
          </Label>
        </Card>
      </Layer>

      <Layer
        x={884}
        y={1152}
        w={172}
        rotate={4}
        enter={{ delay: 120, x: 120, scale: 0.8, config: SPRING.bouncy }}
        float={{ amp: 8, period: 124, phase: 20 }}
      >
        <Card pad={22} radius={26} style={{ textAlign: "center" }}>
          <IconTile name="trendUp" size={58} tone="mint" style={{ margin: "0 auto" }} />
          <Label size={22} color={COLORS.inkSoft} style={{ marginTop: 10 }}>
            {S.badges[2].bottom}
          </Label>
        </Card>
      </Layer>

      {/* aparelho */}
      <Layer
        x={(1080 - PHONE_W) / 2}
        y={726}
        w={PHONE_W}
        enter={{ delay: 54, y: 190, scale: 0.9, blur: 10, config: SPRING.smooth }}
        float={{ amp: 5, period: 180 }}
      >
        <PhoneFrame width={PHONE_W}>
          <AppScreen />
        </PhoneFrame>
      </Layer>
    </AbsoluteFill>
  </SceneShell>
);

/* --------------------------------------------------------------- app UI -- */

const FieldBox: FC<{ children: ReactNode; delay: number; style?: CSSProperties; focused?: boolean }> = ({
  children,
  delay,
  style,
  focused = false,
}) => {
  const p = useSpringIn(delay, SPRING.snappy);
  return (
    <div
      style={{
        border: `1.6px solid ${focused ? COLORS.green : COLORS.line}`,
        background: COLORS.white,
        borderRadius: 10,
        padding: "8px 11px",
        fontFamily: FONT.family,
        fontSize: 18,
        fontWeight: FONT.medium,
        color: COLORS.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [10, 0]).toFixed(1)}px)`,
        boxShadow: focused ? `0 0 0 4px ${hexA(COLORS.green, 0.12)}` : "none",
        minHeight: 38,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const FieldLabel: FC<{ children: string; delay: number }> = ({ children, delay }) => {
  const p = useSpringIn(delay, SPRING.snappy);
  return (
    <div
      style={{
        fontFamily: FONT.family,
        fontSize: 14,
        fontWeight: FONT.medium,
        color: COLORS.muted,
        marginBottom: 3,
        opacity: p,
      }}
    >
      {children}
    </div>
  );
};

const AppScreen: FC = () => {
  const frame = useCurrentFrame();
  const press = interpolate(frame, [196, 200, 206], [1, 0.955, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const result = useSpringIn(206, SPRING.smooth);
  const card = useSpringIn(60, SPRING.smooth);
  const check = useSpringIn(232, SPRING.bouncy);
  const toggle = useSpringIn(242, SPRING.pop);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: COLORS.bg,
        padding: "5px 14px 0",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflow: "hidden",
      }}
    >
      {/* topo do app */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 2px 2px" }}>
        <Logo size={30} delay={58} />
        <Icon name="gear" size={26} color={COLORS.inkSoft} width={1.7} />
      </div>

      {/* formulário */}
      <div
        style={{
          background: COLORS.white,
          borderRadius: 16,
          padding: 13,
          boxShadow: "0 6px 18px rgba(11,42,32,0.07)",
          opacity: card,
          transform: `translateY(${interpolate(card, [0, 1], [24, 0]).toFixed(1)}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <IconTile name="calculator" size={34} tone="mint" radius={10} iconSize={19} />
          <span style={{ fontFamily: FONT.family, fontSize: 21, fontWeight: FONT.bold, color: COLORS.ink }}>
            {A.title}
          </span>
        </div>

        <FieldLabel delay={66}>{A.event.label}</FieldLabel>
        <FieldBox delay={68} focused>
          <TypeWriter text={A.event.value} delay={74} framesPerChar={1.5} />
          <Icon name="chevronDown" size={17} color={COLORS.muted} />
        </FieldBox>

        <div style={{ height: 7 }} />
        <FieldLabel delay={100}>{A.market.label}</FieldLabel>
        <FieldBox delay={102}>
          <TypeWriter text={A.market.value} delay={106} framesPerChar={1.1} caret={false} />
          <Icon name="chevronDown" size={17} color={COLORS.muted} />
        </FieldBox>

        <div style={{ height: 7 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel delay={112}>{A.pick1.label}</FieldLabel>
            <FieldBox delay={114}>
              <TypeWriter text={A.pick1.value} delay={118} framesPerChar={1.4} caret={false} />
            </FieldBox>
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel delay={116}>{A.pick2.label}</FieldLabel>
            <FieldBox delay={118}>
              <TypeWriter text={A.pick2.value} delay={128} framesPerChar={1.4} caret={false} />
            </FieldBox>
          </div>
        </div>

        <div style={{ height: 7 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel delay={144}>Odd</FieldLabel>
            <FieldBox delay={146}>
              <TypeWriter text={A.pick1.odd} delay={150} framesPerChar={2} caret={false} />
            </FieldBox>
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel delay={146}>Odd</FieldLabel>
            <FieldBox delay={148}>
              <TypeWriter text={A.pick2.odd} delay={156} framesPerChar={2} caret={false} />
            </FieldBox>
          </div>
        </div>

        <div style={{ height: 7 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel delay={160}>Casa</FieldLabel>
            <FieldBox delay={162}>
              <TypeWriter text={A.pick1.house} delay={164} framesPerChar={1.2} caret={false} />
              <Icon name="chevronDown" size={17} color={COLORS.muted} />
            </FieldBox>
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel delay={162}>Casa</FieldLabel>
            <FieldBox delay={164}>
              <TypeWriter text={A.pick2.house} delay={170} framesPerChar={1.2} caret={false} />
              <Icon name="chevronDown" size={17} color={COLORS.muted} />
            </FieldBox>
          </div>
        </div>

        <div style={{ height: 7 }} />
        <FieldLabel delay={176}>{A.total.label}</FieldLabel>
        <FieldBox delay={178} focused>
          <TypeWriter text={A.total.value} delay={182} framesPerChar={1.3} />
        </FieldBox>

        {/* botão */}
        <div
          style={{
            marginTop: 11,
            background: `linear-gradient(135deg, ${COLORS.greenBright}, ${COLORS.greenDeep})`,
            borderRadius: 11,
            padding: "11px 0",
            textAlign: "center",
            fontFamily: FONT.family,
            fontSize: 20,
            fontWeight: FONT.bold,
            color: COLORS.white,
            transform: `scale(${press.toFixed(4)})`,
            boxShadow: `0 8px 20px ${hexA(COLORS.green, 0.34)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {A.cta}
          <Icon name="sparkle" size={18} color={COLORS.white} fill={COLORS.white} width={1} />
        </div>
      </div>

      {/* resultado */}
      <div
        style={{
          background: COLORS.white,
          borderRadius: 16,
          padding: 13,
          boxShadow: "0 6px 18px rgba(11,42,32,0.07)",
          opacity: result,
          transform: `translateY(${interpolate(result, [0, 1], [40, 0]).toFixed(1)}px)`,
        }}
      >
        <div style={{ fontFamily: FONT.family, fontSize: 21, fontWeight: FONT.bold, color: COLORS.ink }}>
          {A.resultTitle}
        </div>

        <div style={{ background: COLORS.palest, borderRadius: 12, padding: 12, marginTop: 12 }}>
          <Label size={15} color={COLORS.muted}>
            {A.splitLabel}
          </Label>
          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            {A.split.map((sp, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT.family, fontSize: 24, fontWeight: FONT.bold, color: COLORS.green }}>
                  R$ <NumberText value={sp.value} delay={212 + i * 5} duration={20} />
                </div>
                <Label size={15} color={COLORS.mutedSoft} style={{ marginTop: 2 }}>
                  <NumberText value={sp.pct} decimals={2} suffix="%" delay={212 + i * 5} duration={20} />
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1, background: COLORS.palest, borderRadius: 12, padding: 12 }}>
            <Label size={15} color={COLORS.muted}>
              {A.profit.label}
            </Label>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Icon name="shield" size={19} color={COLORS.green} />
              <span style={{ fontFamily: FONT.family, fontSize: 23, fontWeight: FONT.bold, color: COLORS.green }}>
                R$ <NumberText value={A.profit.value} delay={224} duration={20} />
              </span>
            </div>
          </div>
          <div style={{ flex: 1, background: COLORS.palest, borderRadius: 12, padding: 12 }}>
            <Label size={15} color={COLORS.muted}>
              {A.roi.label}
            </Label>
            <div style={{ fontFamily: FONT.family, fontSize: 23, fontWeight: FONT.bold, color: COLORS.green, marginTop: 4 }}>
              <NumberText value={A.roi.value} decimals={2} suffix="%" delay={224} duration={20} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 12 }}>
          <div>
            <Label size={15} color={COLORS.muted}>
              {A.details.label}
            </Label>
            {A.details.lines.map((l) => (
              <Label key={l} size={14} color={COLORS.mutedSoft} style={{ marginTop: 2 }}>
                {l}
              </Label>
            ))}
          </div>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: COLORS.pale,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${(0.4 + 0.6 * check).toFixed(3)})`,
              flexShrink: 0,
            }}
          >
            <Icon name="check" size={19} color={COLORS.greenDeep} width={2.8} />
          </div>
        </div>
      </div>

      {/* rodapé com o toggle */}
      <div
        style={{
          background: COLORS.white,
          borderRadius: 16,
          padding: "11px 14px",
          display: "flex",
          alignItems: "center",
          gap: 11,
          boxShadow: "0 6px 18px rgba(11,42,32,0.07)",
          opacity: toggle,
          marginBottom: 12,
        }}
      >
        <IconTile name="refresh" size={34} tone="mint" radius={10} iconSize={19} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT.family, fontSize: 17, fontWeight: FONT.semi, color: COLORS.ink }}>
            {A.toggle.title}
          </div>
          <Label size={14} color={COLORS.mutedSoft}>
            {A.toggle.sub}
          </Label>
        </div>
        <div
          style={{
            width: 54,
            height: 30,
            borderRadius: 99,
            background: `linear-gradient(135deg, ${COLORS.greenBright}, ${COLORS.greenDeep})`,
            display: "flex",
            alignItems: "center",
            padding: 3,
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 99,
              background: COLORS.white,
              transform: `translateX(${(toggle * 24).toFixed(1)}px)`,
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
