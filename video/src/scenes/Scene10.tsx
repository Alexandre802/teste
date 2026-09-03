import type { FC } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Layer } from "../components/Layer";
import { Logo } from "../components/Logo";
import { Headline, NumberText } from "../components/Text";
import { PhoneFrame } from "../components/PhoneFrame";
import { Sparkline } from "../components/Charts";
import { Icon, type IconName } from "../components/Icons";
import { usePulse, useSpringIn } from "../components/anim";
import { COLORS, FONT, SPRING, hexA } from "../config/theme";
import { COPY } from "../config/copy";
import type { SceneConfig } from "../config/scenes";
import { SceneShell } from "./shell";

const S = COPY.s10;
const B = S.badges;
const PHONE_W = 418;
const BANK_SPARK = [5, 4, 6, 5, 7, 6.4, 8, 7, 9, 8.2, 10, 9.2, 11.4, 13.6];

/** Cena 10 — CTA final: "Teste a Monttra gratuitamente por 3 dias." (cena escura) */
export const Scene10: FC<{ cfg: SceneConfig }> = ({ cfg }) => (
  <SceneShell cfg={cfg} dark>
    <AbsoluteFill>
      <Layer x={0} y={86} w={1080} enter={{ delay: 0, y: -40, scale: 0.9, config: SPRING.pop }}>
        <Logo size={62} delay={2} onDark style={{ justifyContent: "center" }} />
      </Layer>

      <Layer x={0} y={182} w={1080} enter={{ fade: false }}>
        <Headline lines={S.headline} size={126} delay={6} step={11} align="center" lineHeight={0.99} />
      </Layer>

      <Layer x={0} y={588} w={1080} enter={{ delay: 62, y: 30 }}>
        <div
          style={{
            fontFamily: FONT.family,
            fontWeight: FONT.medium,
            fontSize: 50,
            lineHeight: 1.22,
            color: hexA(COLORS.onDark, 0.9),
            textAlign: "center",
          }}
        >
          {S.sub.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </Layer>

      <CtaButton />

      {/* aparelho */}
      <Layer
        x={(1080 - PHONE_W) / 2}
        y={902}
        w={PHONE_W}
        enter={{ delay: 88, y: 200, scale: 0.9, blur: 10, config: SPRING.smooth }}
        float={{ amp: 5, period: 190 }}
      >
        <PhoneFrame width={PHONE_W} dark glow>
          <DarkAppScreen />
        </PhoneFrame>
      </Layer>

      {/* badges flutuantes ao redor */}
      <GlassBadge x={20} y={986} w={288} rotate={-3} delay={102} phase={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <NeonTile name="target" size={58} />
          <div style={{ minWidth: 0 }}>
            <BadgeLabel>{B.methods.label}</BadgeLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <BadgeValue size={40}>
                <NumberText value={B.methods.value} decimals={0} delay={106} duration={22} />
              </BadgeValue>
              <MiniNeonBars delay={108} />
            </div>
          </div>
        </div>
      </GlassBadge>

      <GlassBadge x={766} y={866} w={292} rotate={4} delay={110} phase={30}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <NeonTile name="trendUp" size={56} />
          <div style={{ minWidth: 0 }}>
            <BadgeLabel>{B.perf.label}</BadgeLabel>
            <BadgeValue size={38}>
              <NumberText value={B.perf.value} decimals={2} suffix="%" delay={114} duration={24} signed />
            </BadgeValue>
            <BadgeLabel small>{B.perf.note}</BadgeLabel>
          </div>
        </div>
        <Sparkline
          id="s10-perf"
          values={[4, 3, 5, 4.4, 6, 5.4, 7.2, 6.4, 8.4, 10]}
          width={244}
          height={72}
          color={COLORS.neon}
          delay={118}
          duration={26}
          strokeWidth={4}
          style={{ marginTop: 10 }}
        />
      </GlassBadge>

      <GlassBadge x={34} y={1300} w={182} rotate={3} delay={118} phase={60}>
        <div style={{ textAlign: "center" }}>
          <NeonTile name="shield" size={58} center />
          <BadgeValue size={38} style={{ marginTop: 10 }}>
            {B.shield.top}
          </BadgeValue>
          <BadgeLabel>{B.shield.bottom}</BadgeLabel>
        </div>
      </GlassBadge>

      <GlassBadge x={856} y={1322} w={186} rotate={-4} delay={126} phase={90}>
        <div style={{ textAlign: "center" }}>
          <NeonTile name="trendUp" size={56} center />
          <BadgeLabel style={{ marginTop: 10 }}>{B.profit}</BadgeLabel>
        </div>
      </GlassBadge>

      <GlassBadge x={714} y={1568} w={330} rotate={5} delay={134} phase={45}>
        <BadgeLabel>{B.bank.label}</BadgeLabel>
        <BadgeValue size={40} style={{ marginTop: 4, whiteSpace: "nowrap" }}>
          R$ <NumberText value={B.bank.value} delay={138} duration={30} />
        </BadgeValue>
        <Sparkline
          id="s10-bank"
          values={BANK_SPARK}
          width={282}
          height={104}
          color={COLORS.neon}
          delay={140}
          duration={30}
          strokeWidth={5}
          style={{ marginTop: 10 }}
        />
      </GlassBadge>
    </AbsoluteFill>
  </SceneShell>
);

/* ------------------------------------------------------------------ peças */

const CtaButton: FC = () => {
  const p = useSpringIn(72, SPRING.bouncy);
  const pulse = usePulse(0.018, 46);
  const frame = useCurrentFrame();
  const shine = interpolate(frame % 70, [0, 34, 70], [-0.4, 1.35, 1.35], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 726,
        width: 1080,
        display: "flex",
        justifyContent: "center",
        opacity: p,
        transform: `scale(${(interpolate(p, [0, 1], [0.8, 1]) * pulse).toFixed(4)})`,
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${COLORS.neon}, #08B96F)`,
          borderRadius: 26,
          padding: "26px 56px",
          textAlign: "center",
          boxShadow: `0 22px 60px ${hexA(COLORS.neon, 0.45)}, 0 0 0 1px ${hexA(COLORS.neonSoft, 0.5)}`,
        }}
      >
        <div style={{ fontFamily: FONT.family, fontSize: 46, fontWeight: FONT.bold, color: "#03291C" }}>
          {S.cta.line1}
        </div>
        <div
          style={{
            fontFamily: FONT.family,
            fontSize: 38,
            fontWeight: FONT.semi,
            color: "#04321F",
            textDecoration: "underline",
            marginTop: 6,
          }}
        >
          {S.cta.line2}
        </div>
        {/* brilho passando */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${shine * 100}%`,
            width: 160,
            background: `linear-gradient(100deg, transparent, ${hexA("#FFFFFF", 0.42)}, transparent)`,
            transform: "skewX(-18deg)",
          }}
        />
      </div>
    </div>
  );
};

const GlassBadge: FC<{
  x: number;
  y: number;
  w: number;
  rotate: number;
  delay: number;
  phase: number;
  children: React.ReactNode;
}> = ({ x, y, w, rotate, delay, phase, children }) => (
  <Layer
    x={x}
    y={y}
    w={w}
    rotate={rotate}
    enter={{ delay, scale: 0.78, y: 40, blur: 8, config: SPRING.pop }}
    float={{ amp: 7, period: 130 + phase / 4, phase }}
  >
    <div
      style={{
        background: "rgba(9,20,16,0.72)",
        border: `1px solid ${hexA(COLORS.neon, 0.22)}`,
        borderRadius: 26,
        padding: 22,
        backdropFilter: "blur(16px)",
        boxShadow: `0 22px 50px rgba(0,0,0,0.55), inset 0 1px 0 ${hexA(COLORS.neonSoft, 0.14)}`,
      }}
    >
      {children}
    </div>
  </Layer>
);

const NeonTile: FC<{ name: IconName; size: number; center?: boolean }> = ({ name, size, center }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.32,
      background: `linear-gradient(140deg, ${hexA(COLORS.neon, 0.28)}, ${hexA(COLORS.neon, 0.08)})`,
      border: `1px solid ${hexA(COLORS.neon, 0.3)}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      margin: center ? "0 auto" : undefined,
    }}
  >
    <Icon name={name} size={size * 0.52} color={COLORS.neon} width={2} />
  </div>
);

const BadgeLabel: FC<{ children: React.ReactNode; small?: boolean; style?: React.CSSProperties }> = ({
  children,
  small,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT.family,
      fontSize: small ? 19 : 22,
      fontWeight: FONT.medium,
      color: COLORS.onDarkMuted,
      ...style,
    }}
  >
    {children}
  </div>
);

const BadgeValue: FC<{ children: React.ReactNode; size: number; style?: React.CSSProperties }> = ({
  children,
  size,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT.family,
      fontSize: size,
      fontWeight: FONT.bold,
      color: COLORS.neon,
      lineHeight: 1.1,
      ...style,
    }}
  >
    {children}
  </div>
);

const MiniNeonBars: FC<{ delay: number }> = ({ delay }) => {
  const p = useSpringIn(delay, SPRING.pop);
  const hs = [12, 18, 24, 30, 38];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5 }}>
      {hs.map((h, i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: h * p,
            borderRadius: 3,
            background: COLORS.neon,
            opacity: 0.35 + i * 0.14,
          }}
        />
      ))}
    </div>
  );
};

/** Tela do app em modo escuro dentro do aparelho. */
const DarkAppScreen: FC = () => {
  const p = useSpringIn(96, SPRING.smooth);
  const rows: { l: string; v: string }[] = [
    { l: "Evento", v: "Arsenal x Chelsea" },
    { l: "Mercado", v: "Resultado final" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#050908",
        padding: "10px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        opacity: p,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 2px 4px" }}>
        <Logo size={26} delay={98} onDark />
        <Icon name="gear" size={22} color={hexA(COLORS.onDark, 0.65)} width={1.7} />
      </div>

      <DarkCard>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
          <NeonTile name="calculator" size={28} />
          <span style={{ fontFamily: FONT.family, fontSize: 17, fontWeight: FONT.bold, color: COLORS.onDark }}>
            Calculadora de surebets
          </span>
        </div>
        {rows.map((r) => (
          <div key={r.l} style={{ marginBottom: 9 }}>
            <DarkLabel>{r.l}</DarkLabel>
            <DarkField>{r.v}</DarkField>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1.4 }}>
            <DarkLabel>Seleção 1</DarkLabel>
            <DarkField>Arsenal</DarkField>
          </div>
          <div style={{ flex: 1 }}>
            <DarkLabel>Odd</DarkLabel>
            <DarkField>2.10</DarkField>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <div style={{ flex: 1.4 }}>
            <DarkLabel>Seleção 2</DarkLabel>
            <DarkField>Chelsea</DarkField>
          </div>
          <div style={{ flex: 1 }}>
            <DarkLabel>Odd</DarkLabel>
            <DarkField>1.95</DarkField>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <DarkLabel>Valor total disponível</DarkLabel>
          <DarkField>R$ 1.000,00</DarkField>
        </div>
        <div
          style={{
            marginTop: 11,
            background: `linear-gradient(135deg, ${COLORS.neon}, #08B96F)`,
            borderRadius: 10,
            padding: "11px 0",
            textAlign: "center",
            fontFamily: FONT.family,
            fontSize: 17,
            fontWeight: FONT.bold,
            color: "#04321F",
            boxShadow: `0 6px 18px ${hexA(COLORS.neon, 0.35)}`,
          }}
        >
          Calcular surebet
        </div>
      </DarkCard>

      <DarkCard>
        <span style={{ fontFamily: FONT.family, fontSize: 17, fontWeight: FONT.bold, color: COLORS.onDark }}>
          Resultado da operação
        </span>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {[
            { v: "R$ 512,20", p: "51,22%" },
            { v: "R$ 487,80", p: "48,78%" },
          ].map((sp) => (
            <div key={sp.v} style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT.family, fontSize: 19, fontWeight: FONT.bold, color: COLORS.neon }}>
                {sp.v}
              </div>
              <DarkLabel>{sp.p}</DarkLabel>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <DarkLabel>Lucro garantido</DarkLabel>
            <div style={{ fontFamily: FONT.family, fontSize: 19, fontWeight: FONT.bold, color: COLORS.neon }}>
              R$ 66,67
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <DarkLabel>ROI</DarkLabel>
            <div style={{ fontFamily: FONT.family, fontSize: 19, fontWeight: FONT.bold, color: COLORS.neon }}>
              6,67%
            </div>
          </div>
        </div>
      </DarkCard>

      <DarkCard>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <NeonTile name="refresh" size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT.family, fontSize: 15, fontWeight: FONT.semi, color: COLORS.onDark }}>
              Atualização automática
            </div>
            <DarkLabel>Odds ao vivo monitoradas</DarkLabel>
          </div>
          <div
            style={{
              width: 46,
              height: 26,
              borderRadius: 99,
              background: `linear-gradient(135deg, ${COLORS.neon}, #08B96F)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: 3,
              boxSizing: "border-box",
              flexShrink: 0,
            }}
          >
            <div style={{ width: 20, height: 20, borderRadius: 99, background: "#04321F" }} />
          </div>
        </div>
      </DarkCard>
    </div>
  );
};

const DarkCard: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.045)",
      border: `1px solid ${hexA(COLORS.neon, 0.12)}`,
      borderRadius: 15,
      padding: 13,
    }}
  >
    {children}
  </div>
);

const DarkLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: FONT.family, fontSize: 13, fontWeight: FONT.medium, color: hexA(COLORS.onDark, 0.5) }}>
    {children}
  </div>
);

const DarkField: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      border: `1px solid ${hexA(COLORS.onDark, 0.12)}`,
      background: "rgba(255,255,255,0.03)",
      borderRadius: 9,
      padding: "8px 10px",
      marginTop: 3,
      fontFamily: FONT.family,
      fontSize: 15,
      fontWeight: FONT.medium,
      color: COLORS.onDark,
    }}
  >
    {children}
  </div>
);
