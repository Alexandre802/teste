import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BgDark } from '../components/Bg';
import { Flash, GlitchSlices, LightSweep, Sparks } from '../components/Fx';
import { ArrowUpRight, Check } from '../components/Icons';
import { KineticBlock } from '../components/Kinetic';
import { LogoMark } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { breathe, prog, springAt, tween } from '../components/anim';
import { COLORS, EASE, FONTS, SPRINGS } from '../config/theme';
import { COPY } from '../config/timeline';

/**
 * Cena 14 — chamada final: "Teste grátis por 3 dias".
 * Fecha o roteiro da copy ("Quer parar de trabalhar no escuro?").
 */
export const S14Cta: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const BRAND = 58;
  const BTN = 98;

  const brandS = springAt(frame, fps, BRAND, SPRINGS.snappy);
  const btnS = springAt(frame, fps, BTN, SPRINGS.pop);
  const btnPulse = 1 + Math.sin(Math.max(0, frame - BTN - 20) * 0.14) * 0.018;

  return (
    <AbsoluteFill style={{ background: COLORS.bgDarkDeep }}>
      <BgDark mesh />

      <Scene total={total} zoom={0.075} driftY={-14} exitDur={20} exitScale={0.14}>
        <Stack top={470}>
          <KineticBlock
            size={118}
            step={5}
            dur={14}
            delay={3}
            rise={0.46}
            tracking="-0.045em"
            lines={COPY.s14.lines.map((l) =>
              l.map((w) => ({ t: w.text, tone: w.color })),
            )}
          />
        </Stack>

        {/* três provas rápidas */}
        <div style={{ position: 'absolute', left: 118, top: 900 }}>
          {['Entradas e saídas', 'Calculadora de surebets', 'Metas e previsão'].map(
            (t, i) => {
              const d = 26 + i * 7;
              const p = prog(frame, d, 13, EASE.out);
              return (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 22,
                    marginBottom: 30,
                    opacity: p,
                    transform: `translateX(${(1 - p) * 60}px)`,
                    filter: p < 0.999 ? `blur(${(1 - p) * 14}px)` : undefined,
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      background: 'rgba(5,213,142,0.16)',
                      border: `2px solid ${COLORS.greenNeon}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `scale(${0.5 + p * 0.5})`,
                    }}
                  >
                    <Check size={28} color={COLORS.greenNeon} strokeWidth={3} />
                  </div>
                  <span
                    style={{
                      fontFamily: FONTS.ui,
                      fontWeight: 400,
                      fontSize: 40,
                      color: 'rgba(232,255,247,0.9)',
                    }}
                  >
                    {t}
                  </span>
                </div>
              );
            },
          )}
        </div>

        {/* marca */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 30,
            opacity: prog(frame, BRAND, 12),
            transform: `translateY(${(1 - brandS) * 70}px) scale(${0.86 + brandS * 0.14})`,
          }}
        >
          <LogoMark size={130} delay={BRAND + 2} glow />
          <div
            style={{
              fontFamily: FONTS.sans,
              fontWeight: 700,
              fontSize: 128,
              letterSpacing: '-0.045em',
              color: '#FFFFFF',
              lineHeight: 0.9,
              clipPath: `inset(0 ${(1 - prog(frame, BRAND + 6, 22)) * 100}% 0 0)`,
              textShadow: '0 0 50px rgba(5,213,142,0.4)',
            }}
          >
            Monttra
          </div>
        </div>

        {/* botão */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 1420,
            transform: `translateX(-50%) translateY(${(1 - btnS) * 70}px) scale(${(0.84 + btnS * 0.16) * btnPulse})`,
            opacity: prog(frame, BTN, 12),
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              padding: '38px 62px',
              borderRadius: 999,
              background: `linear-gradient(120deg, ${COLORS.greenNeon} 0%, ${COLORS.greenBright} 100%)`,
              boxShadow: `0 0 ${70 + breathe(frame, 0.09, 22)}px rgba(5,213,142,0.55), 0 24px 60px rgba(0,0,0,0.42)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontFamily: FONTS.ui,
                fontWeight: 600,
                fontSize: 52,
                letterSpacing: '-0.02em',
                color: '#03271D',
                whiteSpace: 'nowrap',
              }}
            >
              {COPY.s14.cta}
            </span>
            <ArrowUpRight size={46} color="#03271D" strokeWidth={3} />
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 180,
                left: `${tween(frame, [BTN + 14, BTN + 54], [-30, 130], EASE.inOut)}%`,
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)',
                transform: 'skewX(-18deg)',
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1596,
            textAlign: 'center',
            fontFamily: FONTS.ui,
            fontWeight: 400,
            fontSize: 38,
            letterSpacing: '0.06em',
            color: 'rgba(190,232,220,0.75)',
            opacity: prog(frame, BTN + 26, 16),
          }}
        >
          {COPY.s14.footer}
        </div>
      </Scene>

      <Sparks
        count={34}
        delay={BRAND}
        origin={[540, 1240]}
        spread={540}
        rise={340}
        color={COLORS.greenNeon}
        seed="cta"
      />
      <GlitchSlices at={0} dur={10} slices={12} amount={60} />
      <Flash at={0} dur={7} color="#0AFFB0" max={0.32} />
      <Flash at={BRAND} dur={10} color="#DFFFF2" max={0.35} />
      <LightSweep delay={BRAND + 14} dur={44} color="rgba(160,255,222,0.45)" />

      <SfxTrack
        cues={[
          { name: 'glitchDigital', at: 0, volume: 1.1 },
          { name: 'subBoom', at: 0, volume: 0.95 },
          { name: 'whooshTransition', at: 1, volume: 0.85, rate: 0.84 },
          { name: 'whooshShort', at: 3 },
          { name: 'popUi', at: 8 },
          { name: 'impactHit', at: 13, volume: 0.9 },
          { name: 'popUi', at: 26 },
          { name: 'popUi', at: 33, rate: 1.06 },
          { name: 'popUi', at: 40, rate: 1.12 },
          { name: 'riserShort', at: 34, volume: 0.55 },
          { name: 'logoSting', at: BRAND, volume: 1 },
          { name: 'sparkleShine', at: BRAND + 6 },
          { name: 'tapButton', at: BTN, volume: 1.2 },
          { name: 'successChime', at: BTN + 2, volume: 0.9 },
          { name: 'bassHit', at: BTN, volume: 0.7 },
          { name: 'notificationPop', at: BTN + 26, volume: 0.6 },
        ]}
      />
    </AbsoluteFill>
  );
};
