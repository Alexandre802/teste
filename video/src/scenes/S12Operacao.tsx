import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { BgDark } from '../components/Bg';
import { Flash, GlitchSlices, LightSweep, Sparks } from '../components/Fx';
import { ArrowUpRight, Dollar, Sparkle, TrendUp } from '../components/Icons';
import { Logo } from '../components/Logo';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { breathe, prog, springAt, tween } from '../components/anim';
import { COLORS, EASE, FONTS, SPRINGS } from '../config/theme';
import { COPY } from '../config/timeline';

const CARD = { w: 407, h: 671, y: 580 };
const XS = [98, 575];

/** Card de vidro da cena escura. */
const GlassCard: React.FC<{
  i: number;
  delay: number;
  data: (typeof COPY.s12.suggestions)[number];
}> = ({ i, delay, data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springAt(frame, fps, delay, SPRINGS.snappy);
  const glow = prog(frame, delay + 16, 30);
  const numP = tween(frame, [delay + 10, delay + 34], [0, 1], EASE.back);

  return (
    <div
      style={{
        position: 'absolute',
        left: XS[i],
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        borderRadius: 40,
        background:
          'linear-gradient(160deg, rgba(18,88,72,0.55) 0%, rgba(4,42,36,0.72) 55%, rgba(8,64,52,0.62) 100%)',
        border: '2px solid rgba(120,255,214,0.42)',
        boxShadow: `0 0 ${60 * glow}px rgba(5,213,142,${0.35 * glow}), inset 0 2px 40px rgba(140,255,216,0.10)`,
        backdropFilter: 'blur(8px)',
        opacity: prog(frame, delay, 14),
        transform: `translateY(${(1 - s) * 120}px) scale(${0.9 + s * 0.1}) translateY(${breathe(frame, 0.026, 6, i * 2)}px)`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 46,
      }}
    >
      {/* brilho superior do vidro */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '46%',
          background:
            'linear-gradient(180deg, rgba(180,255,230,0.16) 0%, rgba(180,255,230,0) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: prog(frame, delay + 8, 12),
        }}
      >
        <div style={{ width: 44, height: 1, background: 'rgba(140,255,216,0.4)' }} />
        <span
          style={{
            fontFamily: FONTS.ui,
            fontWeight: 500,
            fontSize: 26,
            letterSpacing: '0.14em',
            color: 'rgba(228,255,246,0.86)',
          }}
        >
          SUGESTÃO
        </span>
        <div style={{ width: 44, height: 1, background: 'rgba(140,255,216,0.4)' }} />
      </div>

      <div
        style={{
          fontFamily: FONTS.ui,
          fontWeight: 600,
          fontSize: 176,
          lineHeight: 1,
          color: '#EAFFF7',
          marginTop: 14,
          textShadow: `0 0 ${34 * glow}px rgba(90,255,205,0.65)`,
          transform: `scale(${numP})`,
          opacity: numP,
        }}
      >
        {data.n}
      </div>

      <div
        style={{
          marginTop: 24,
          padding: '14px 26px',
          borderRadius: 999,
          border: '1.5px solid rgba(150,255,220,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: prog(frame, delay + 22, 14),
          transform: `scale(${springAt(frame, fps, delay + 22, SPRINGS.pop)})`,
        }}
      >
        <Sparkle size={22} color="#B9FFE4" />
        <span
          style={{
            fontFamily: FONTS.ui,
            fontWeight: 500,
            fontSize: 21,
            letterSpacing: '0.1em',
            color: '#DEFFF3',
          }}
        >
          {data.tag}
        </span>
      </div>

      <div
        style={{
          width: '78%',
          height: 1,
          marginTop: 30,
          background:
            'repeating-linear-gradient(90deg, rgba(150,255,220,0.55) 0 8px, transparent 8px 16px)',
          transform: `scaleX(${prog(frame, delay + 26, 18)})`,
        }}
      />

      <div
        style={{
          fontFamily: FONTS.ui,
          fontWeight: 400,
          fontSize: 30,
          color: 'rgba(226,255,246,0.82)',
          marginTop: 26,
          opacity: prog(frame, delay + 30, 14),
        }}
      >
        {data.label}
      </div>
      <div
        style={{
          fontFamily: FONTS.ui,
          fontWeight: 600,
          fontSize: 58,
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          marginTop: 10,
          opacity: prog(frame, delay + 34, 14),
          transform: `translateY(${(1 - prog(frame, delay + 34, 20)) * 18}px)`,
          textShadow: `0 0 ${24 * glow}px rgba(90,255,205,0.4)`,
        }}
      >
        {data.value}
      </div>

      {/* malha de pontos inferior */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          height: 150,
          backgroundImage:
            'radial-gradient(rgba(120,255,214,0.5) 1.4px, transparent 1.4px)',
          backgroundSize: '13px 13px',
          maskImage: 'linear-gradient(180deg, transparent, black)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent, black)',
          opacity: 0.5 * glow,
        }}
      />
    </div>
  );
};

/**
 * Cena 12 — calculadora de surebets: "Resultado da operação".
 * Referência: E0DC9E01-269F-49F1-9848-AD7A3166FE2F.png
 */
export const S12Operacao: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wire = prog(frame, 92, 26);

  return (
    <AbsoluteFill style={{ background: COLORS.bgDarkDeep }}>
      <BgDark />

      <Scene total={total} zoom={0.06} driftY={-14}>
        <Logo
          size={72}
          color="#FFFFFF"
          delay={2}
          glow
          style={{ position: 'absolute', left: 86, top: 130 }}
        />

        <div
          style={{
            position: 'absolute',
            top: 350,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONTS.ui,
            fontWeight: 400,
            fontSize: 56,
            letterSpacing: '-0.015em',
            color: '#EAF6F2',
            opacity: prog(frame, 8, 18),
            transform: `translateY(${(1 - prog(frame, 8, 26)) * 24}px)`,
          }}
        >
          {COPY.s12.title[0]}
          <span
            style={{
              color: COLORS.greenGlow,
              fontWeight: 600,
              textShadow: '0 0 28px rgba(47,233,166,0.55)',
            }}
          >
            {COPY.s12.title[1]}
          </span>
        </div>
        {/* sublinhado manuscrito */}
        <svg width={420} height={40} style={{ position: 'absolute', left: 600, top: 412 }}>
          <path
            d="M 6 20 C 90 6, 200 30, 300 12"
            fill="none"
            stroke={COLORS.greenGlow}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={420}
            strokeDashoffset={420 * (1 - prog(frame, 22, 22))}
            opacity={0.85}
          />
        </svg>

        {COPY.s12.suggestions.map((d, i) => (
          <GlassCard key={d.n} i={i} delay={20 + i * 12} data={d} />
        ))}

        {/* nó central entre os cards */}
        <div
          style={{
            position: 'absolute',
            left: 540 - 14,
            top: 908,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#C9FFEA',
            boxShadow: `0 0 ${26 + breathe(frame, 0.1, 10)}px ${COLORS.greenNeon}`,
            opacity: prog(frame, 70, 14),
            transform: `scale(${springAt(frame, fps, 70, SPRINGS.pop)})`,
          }}
        />

        {/* fiação até os cards de resultado */}
        <svg width={1080} height={420} viewBox="0 0 1080 420" style={{ position: 'absolute', left: 0, top: 1240 }}>
          <defs>
            <filter id="wireGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#wireGlow)" opacity={wire}>
            <path
              d="M 285 14 L 285 90 L 372 90 L 372 168"
              fill="none"
              stroke={COLORS.greenNeon}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={420}
              strokeDashoffset={420 * (1 - wire)}
            />
            <path
              d="M 780 14 L 780 90 L 706 90 L 706 168"
              fill="none"
              stroke={COLORS.greenNeon}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={420}
              strokeDashoffset={420 * (1 - wire)}
            />
            <circle cx={285} cy={14} r={12} fill="#CFFFEE" />
            <circle cx={780} cy={14} r={12} fill="#CFFFEE" />
          </g>
        </svg>

        {/* cards de resultado */}
        {COPY.s12.stats.map((st, i) => {
          const delay = 104 + i * 10;
          const s = springAt(frame, fps, delay, SPRINGS.pop);
          return (
            <div
              key={st.label}
              style={{
                position: 'absolute',
                left: i === 0 ? 122 : 566,
                top: 1420,
                width: 392,
                height: 154,
                borderRadius: 26,
                background:
                  'linear-gradient(150deg, rgba(20,92,76,0.62) 0%, rgba(5,44,37,0.78) 100%)',
                border: '1.6px solid rgba(130,255,214,0.4)',
                boxShadow: '0 0 44px rgba(5,213,142,0.22)',
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                paddingLeft: 26,
                opacity: prog(frame, delay, 12),
                transform: `translateY(${(1 - s) * 70}px) scale(${0.92 + s * 0.08})`,
              }}
            >
              <div
                style={{
                  width: 82,
                  height: 82,
                  borderRadius: '50%',
                  border: `2.4px solid ${COLORS.greenGlow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {i === 0 ? (
                  <Dollar size={40} color="#EAFFF7" strokeWidth={2.2} />
                ) : (
                  <TrendUp size={40} color="#EAFFF7" strokeWidth={2.2} />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span
                  style={{
                    fontFamily: FONTS.ui,
                    fontWeight: 400,
                    fontSize: 30,
                    color: 'rgba(228,255,246,0.85)',
                  }}
                >
                  {st.label}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.ui,
                    fontWeight: 600,
                    fontSize: 44,
                    color: COLORS.greenGlow,
                    letterSpacing: '-0.02em',
                    textShadow: '0 0 22px rgba(47,233,166,0.45)',
                  }}
                >
                  {st.value}
                </span>
              </div>
              <div style={{ position: 'absolute', right: 24, top: 22, opacity: prog(frame, delay + 14, 12) }}>
                <ArrowUpRight size={34} color={COLORS.greenGlow} strokeWidth={2.4} />
              </div>
            </div>
          );
        })}
      </Scene>

      <Sparks
        count={22}
        delay={20}
        origin={[540, 900]}
        spread={420}
        rise={280}
        color={COLORS.greenNeon}
        seed="op"
      />
      <GlitchSlices at={0} dur={9} slices={11} amount={54} />
      <Flash at={0} dur={6} color="#0AFFB0" max={0.28} />
      <LightSweep delay={54} dur={44} color="rgba(160,255,222,0.5)" />

      <SfxTrack
        cues={[
          { name: 'glitchDigital', at: 0, volume: 1.1 },
          { name: 'subBoom', at: 0, volume: 0.9 },
          { name: 'whooshTransition', at: 2, volume: 0.85, rate: 0.86 },
          { name: 'popSoft', at: 8 },
          { name: 'reverseWhoosh', at: 14, volume: 0.6 },
          { name: 'whooshShort', at: 20, rate: 0.9 },
          { name: 'whooshShort', at: 32, rate: 0.96 },
          { name: 'sparkleShine', at: 40 },
          { name: 'clickDigital', at: 42 },
          { name: 'clickDigital', at: 54, rate: 1.1 },
          { name: 'notificationPop', at: 70 },
          { name: 'tickMicro', at: 92 },
          { name: 'tickMicro', at: 98, rate: 1.1 },
          { name: 'successChime', at: 104, volume: 0.85 },
          { name: 'bassHit', at: 104, volume: 0.6 },
          { name: 'popUi', at: 114 },
        ]}
      />
    </AbsoluteFill>
  );
};
