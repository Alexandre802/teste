import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BgDark } from '../components/Bg';
import { Flash, GlitchSlices, LightSweep, Sparks } from '../components/Fx';
import { ArrowUpRight, Check } from '../components/Icons';
import { LogoMark } from '../components/Logo';
import { Scene, Stack } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { Line } from '../components/Type';
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

  const brandS = springAt(frame, fps, 70, SPRINGS.snappy);
  const btnS = springAt(frame, fps, 118, SPRINGS.pop);
  const btnPulse = 1 + Math.sin(Math.max(0, frame - 140) * 0.14) * 0.018;

  return (
    <AbsoluteFill style={{ background: COLORS.bgDarkDeep }}>
      <BgDark mesh />

      <Scene total={total} zoom={0.05} driftY={-10} exitDur={22}>
        <Stack top={470}>
          {COPY.s14.lines.map((l, i) => (
            <Line
              key={l[0].text}
              size={118}
              tone={l[0].color}
              weight={800}
              tracking="-0.045em"
              delay={6 + i * 9}
              shadow={false}
              style={
                l[0].color === 'neon'
                  ? { textShadow: '0 0 44px rgba(5,213,142,0.55)' }
                  : undefined
              }
            >
              {l[0].text}
            </Line>
          ))}
        </Stack>

        {/* três provas rápidas */}
        <div style={{ position: 'absolute', left: 118, top: 900 }}>
          {['Entradas e saídas', 'Calculadora de surebets', 'Metas e previsão'].map(
            (t, i) => {
              const d = 34 + i * 9;
              const p = prog(frame, d, 16);
              return (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 22,
                    marginBottom: 30,
                    opacity: p,
                    transform: `translateX(${(1 - p) * 50}px)`,
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
            opacity: prog(frame, 70, 16),
            transform: `translateY(${(1 - brandS) * 60}px) scale(${0.9 + brandS * 0.1})`,
          }}
        >
          <LogoMark size={130} delay={72} glow />
          <div
            style={{
              fontFamily: FONTS.sans,
              fontWeight: 700,
              fontSize: 128,
              letterSpacing: '-0.045em',
              color: '#FFFFFF',
              lineHeight: 0.9,
              clipPath: `inset(0 ${(1 - prog(frame, 78, 26)) * 100}% 0 0)`,
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
            transform: `translateX(-50%) translateY(${(1 - btnS) * 60}px) scale(${(0.86 + btnS * 0.14) * btnPulse})`,
            opacity: prog(frame, 118, 14),
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
            {/* brilho que atravessa o botão */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 180,
                left: `${tween(frame, [136, 176], [-30, 130], EASE.inOut)}%`,
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
            opacity: prog(frame, 146, 18),
          }}
        >
          {COPY.s14.footer}
        </div>
      </Scene>

      <Sparks
        count={30}
        delay={70}
        origin={[540, 1240]}
        spread={520}
        rise={340}
        color={COLORS.greenNeon}
        seed="cta"
      />
      <GlitchSlices at={0} dur={10} slices={12} amount={60} />
      <Flash at={0} dur={7} color="#0AFFB0" max={0.3} />
      <Flash at={70} dur={10} color="#DFFFF2" max={0.35} />
      <LightSweep delay={92} dur={46} color="rgba(160,255,222,0.45)" />

      <SfxTrack
        cues={[
          { name: 'glitchDigital', at: 0, volume: 1.1 },
          { name: 'subBoom', at: 0, volume: 0.95 },
          { name: 'whooshTransition', at: 2, volume: 0.85, rate: 0.84 },
          { name: 'whooshShort', at: 6 },
          { name: 'impactHit', at: 16, volume: 0.9 },
          { name: 'popUi', at: 34 },
          { name: 'popUi', at: 43, rate: 1.06 },
          { name: 'popUi', at: 52, rate: 1.12 },
          { name: 'riserShort', at: 46, volume: 0.55 },
          { name: 'logoSting', at: 70, volume: 1 },
          { name: 'sparkleShine', at: 76 },
          { name: 'tapButton', at: 118, volume: 1.2 },
          { name: 'successChime', at: 120, volume: 0.9 },
          { name: 'bassHit', at: 118, volume: 0.7 },
          { name: 'notificationPop', at: 146, volume: 0.6 },
        ]}
      />
    </AbsoluteFill>
  );
};
