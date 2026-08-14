import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BgLight } from '../components/Bg';
import { LineChart } from '../components/Charts';
import { Flash, LightSweep, Sparks } from '../components/Fx';
import { Sparkle, Star, TrendUp, ArrowUpRight, Chevron } from '../components/Icons';
import { Logo } from '../components/Logo';
import { Scene } from '../components/Scene';
import { SfxTrack } from '../components/Sfx';
import { UiText } from '../components/Type';
import { Counter } from '../components/Ui';
import { breathe, prog, springAt, tween } from '../components/anim';
import { COLORS, EASE, FONTS, SHADOW, SPRINGS } from '../config/theme';
import { COPY } from '../config/timeline';

/** Pontos da série semanal (Seg..Dom); os dois últimos são previsão. */
const SERIES: [number, number][] = [
  [40, 300],
  [172, 236],
  [304, 276],
  [436, 180],
  [568, 208],
  [700, 132],
  [832, 60],
];

const CAL_DAYS = [
  ['29', '30', '1', '2', '3', '4', '5'],
  ['6', '7', '8', '9', '10', '11', '12'],
  ['13', '14', '15', '16', '17', '18', '19'],
  ['20', '21', '22', '23', '24', '25', '26'],
  ['27', '28', '29', '30', '31', '1', '2'],
];

/**
 * Cena 13 — "Previsão da semana": IA, calendário, meta.
 * Referência: 934F3467-1214-4325-82FB-EA619BEFDCFB.png
 */
export const S13Previsao: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const calS = springAt(frame, fps, 14, SPRINGS.snappy);
  const chartS = springAt(frame, fps, 28, SPRINGS.soft);
  const goalS = springAt(frame, fps, 80, SPRINGS.snappy);
  const robotS = springAt(frame, fps, 70, SPRINGS.pop);

  return (
    <AbsoluteFill>
      <BgLight tone="cool" charts={false} grain={0.16} />

      {/* raios de luz do canto direito, como na arte */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            right: -160 + i * 60,
            top: 620 + i * 140,
            width: 1100,
            height: 190,
            background:
              'linear-gradient(90deg, rgba(5,213,142,0) 0%, rgba(5,213,142,0.16) 55%, rgba(5,213,142,0) 100%)',
            filter: 'blur(48px)',
            transform: `rotate(${-14 + i * 4}deg)`,
            opacity: prog(frame, 6 + i * 4, 30),
          }}
        />
      ))}

      <Scene total={total} zoom={0.045} driftY={-10}>
        <Logo
          size={72}
          color={COLORS.ink}
          delay={0}
          style={{ position: 'absolute', left: 86, top: 88 }}
        />

        {/* título */}
        <div style={{ position: 'absolute', left: 92, top: 372 }}>
          <div
            style={{
              fontFamily: FONTS.ui,
              fontWeight: 600,
              fontSize: 66,
              letterSpacing: '-0.03em',
              color: COLORS.ink,
              opacity: prog(frame, 2, 12),
              transform: `translateY(${(1 - prog(frame, 2, 18)) * 26}px)`,
            }}
          >
            {COPY.s13.title[0]}
          </div>
          <div
            style={{
              fontFamily: FONTS.ui,
              fontWeight: 600,
              fontSize: 66,
              letterSpacing: '-0.03em',
              color: COLORS.green,
              opacity: prog(frame, 7, 12),
              transform: `translateY(${(1 - prog(frame, 7, 18)) * 26}px)`,
            }}
          >
            {COPY.s13.title[1]}
          </div>
          <div style={{ height: 18 }} />
          {COPY.s13.sub.map((s, i) => (
            <UiText key={s} size={30} weight={400} color={COLORS.gray} delay={13 + i * 4}>
              {s}
            </UiText>
          ))}
        </div>

        {/* calendário */}
        <div
          style={{
            position: 'absolute',
            left: 660,
            top: 328,
            width: 348,
            borderRadius: 26,
            background: COLORS.white,
            boxShadow: SHADOW.card,
            padding: '22px 20px 26px',
            opacity: prog(frame, 14, 12),
            transform: `translateY(${(1 - calS) * 60}px) scale(${0.93 + calS * 0.07})`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <Chevron dir="left" size={22} color={COLORS.green} strokeWidth={2.6} />
            <span
              style={{
                fontFamily: FONTS.ui,
                fontWeight: 500,
                fontSize: 27,
                color: COLORS.ink,
              }}
            >
              {COPY.s13.calendarMonth}
            </span>
            <Chevron dir="right" size={22} color={COLORS.green} strokeWidth={2.6} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {COPY.s13.weekLabels.map((w, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  fontFamily: FONTS.ui,
                  fontSize: 21,
                  color: COLORS.grayLight,
                  paddingBottom: 6,
                  opacity: prog(frame, 19 + i, 9),
                }}
              >
                {w}
              </div>
            ))}
            {CAL_DAYS.flatMap((row, r) =>
              row.map((d, c) => {
                const idx = r * 7 + c;
                const isToday = r === 4 && c === 0;
                const inWeek = r === 4 && c <= 4;
                const muted = (r === 0 && c < 2) || (r === 4 && c > 4);
                const p = prog(frame, 22 + idx * 0.5, 9);
                const sel = isToday ? prog(frame, 44, 12, EASE.back) : 0;
                const wk = inWeek ? prog(frame, 47, 13) : 0;
                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      height: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10,
                      fontFamily: FONTS.ui,
                      fontSize: 22,
                      color: isToday
                        ? '#FFFFFF'
                        : muted
                          ? '#C7CDCC'
                          : COLORS.inkSoft,
                      background: isToday
                        ? COLORS.greenDeep
                        : wk > 0
                          ? `rgba(205,238,227,${wk})`
                          : 'transparent',
                      opacity: p,
                      transform: isToday ? `scale(${0.6 + sel * 0.4})` : undefined,
                    }}
                  >
                    {d}
                  </div>
                );
              }),
            )}
          </div>
        </div>

        {/* card do gráfico de previsão */}
        <div
          style={{
            position: 'absolute',
            left: 74,
            top: 682,
            width: 934,
            height: 560,
            borderRadius: 34,
            background: COLORS.white,
            boxShadow: SHADOW.card,
            opacity: prog(frame, 28, 12),
            transform: `translateY(${(1 - chartS) * 70}px) scale(${0.95 + chartS * 0.05})`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 36,
              top: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              opacity: prog(frame, 33, 10),
            }}
          >
            <Sparkle size={30} color={COLORS.greenBright} style={{ transform: `rotate(${breathe(frame, 0.05, 8)}deg)` }} />
            <span
              style={{
                fontFamily: FONTS.ui,
                fontWeight: 500,
                fontSize: 36,
                color: COLORS.ink,
              }}
            >
              {COPY.s13.aiLabel}
            </span>
          </div>

          <div
            style={{
              position: 'absolute',
              left: 36,
              top: 92,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 22px',
              borderRadius: 999,
              background: COLORS.greenPaler,
              opacity: prog(frame, 37, 10),
              transform: `scale(${springAt(frame, fps, 37, SPRINGS.pop)})`,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: COLORS.green }} />
            <span style={{ fontFamily: FONTS.ui, fontSize: 25, color: COLORS.greenDeep }}>
              {COPY.s13.confidence}
            </span>
          </div>

          {/* hastes verticais */}
          <svg width={934} height={560} style={{ position: 'absolute', left: 0, top: 0 }}>
            {SERIES.map((p, i) => (
              <line
                key={i}
                x1={p[0] + 36}
                y1={p[1] + 150}
                x2={p[0] + 36}
                y2={452}
                stroke="#E4E9E8"
                strokeWidth={2}
                strokeDasharray="5 6"
                opacity={prog(frame, 41 + i * 2, 10)}
              />
            ))}
          </svg>

          <LineChart
            id="prev"
            points={SERIES.map((p) => [p[0], p[1]] as [number, number])}
            width={868}
            height={330}
            delay={41}
            dur={44}
            color={COLORS.green}
            areaFrom="rgba(1,146,102,0.16)"
            strokeWidth={6}
            smooth={false}
            nodeRadius={13}
            dashFrom={4}
            baseline={302}
            style={{ left: 36, top: 150 }}
          />

          {/* balões de previsão */}
          {COPY.s13.forecasts.map((f, i) => {
            const d = 68 + i * 7;
            const s = springAt(frame, fps, d, SPRINGS.pop);
            const pos = [
              { left: 496, top: 148 },
              { left: 648, top: 88 },
            ][i];
            return (
              <div
                key={f}
                style={{
                  position: 'absolute',
                  left: pos.left,
                  top: pos.top,
                  padding: '12px 20px',
                  borderRadius: 16,
                  background: '#F2FBF7',
                  border: `1.6px dashed ${COLORS.greenBright}`,
                  textAlign: 'center',
                  opacity: prog(frame, d, 12),
                  transform: `scale(${0.6 + s * 0.4}) translateY(${breathe(frame, 0.05, 4, i)}px)`,
                }}
              >
                <div style={{ fontFamily: FONTS.ui, fontSize: 21, color: COLORS.gray }}>
                  Previsão
                </div>
                <div
                  style={{
                    fontFamily: FONTS.ui,
                    fontWeight: 600,
                    fontSize: 30,
                    color: COLORS.green,
                  }}
                >
                  {f}
                </div>
              </div>
            );
          })}

          {/* seta final */}
          <div
            style={{
              position: 'absolute',
              left: 868,
              top: 112,
              opacity: prog(frame, 78, 10),
              transform: `scale(${springAt(frame, fps, 78, SPRINGS.pop)}) rotate(-6deg)`,
            }}
          >
            <ArrowUpRight size={62} color={COLORS.green} strokeWidth={3} />
          </div>

          {/* rótulos dos dias */}
          {COPY.s13.days.map((d, i) => (
            <div
              key={d}
              style={{
                position: 'absolute',
                left: SERIES[i][0] + 36,
                top: 476,
                transform: 'translateX(-50%)',
                fontFamily: FONTS.ui,
                fontSize: 28,
                color: COLORS.inkSoft,
                opacity: prog(frame, 44 + i * 2, 10),
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* robô + card do assistente */}
        <div
          style={{
            position: 'absolute',
            left: 92,
            top: 1272,
            width: 452,
            height: 208,
            borderRadius: 26,
            background: 'rgba(255,255,255,0.88)',
            boxShadow: SHADOW.card,
            opacity: prog(frame, 74, 12),
            transform: `translateX(${(1 - springAt(frame, fps, 74, SPRINGS.snappy)) * -80}px)`,
            paddingLeft: 132,
            paddingTop: 34,
            paddingRight: 22,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: FONTS.ui, fontWeight: 500, fontSize: 32, color: COLORS.ink }}>
              {COPY.s13.assistant.name}
            </span>
            <Sparkle size={22} color={COLORS.greenBright} />
          </div>
          <div
            style={{
              fontFamily: FONTS.ui,
              fontSize: 20,
              lineHeight: 1.45,
              color: COLORS.gray,
              marginTop: 10,
              opacity: prog(frame, 78, 12),
            }}
          >
            {COPY.s13.assistant.body}
          </div>
        </div>
        <Img
          src={staticFile('cutouts/robot.png')}
          style={{
            position: 'absolute',
            left: 24,
            top: 1236,
            width: 176,
            opacity: prog(frame, 70, 12),
            transform: `translateY(${(1 - robotS) * 50}px) scale(${0.8 + robotS * 0.2}) rotate(${breathe(frame, 0.03, 2.4)}deg)`,
            filter: 'drop-shadow(0 18px 26px rgba(9,32,27,0.16))',
          }}
        />

        {/* card da meta */}
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 1256,
            width: 466,
            height: 240,
            borderRadius: 26,
            background: 'linear-gradient(140deg, #0E6B4B 0%, #04452F 100%)',
            boxShadow: '0 26px 60px rgba(4,69,47,0.34)',
            overflow: 'hidden',
            opacity: prog(frame, 78, 12),
            transform: `translateX(${(1 - goalS) * 90}px) scale(${0.94 + goalS * 0.06})`,
            padding: '22px 26px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 18px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.34)',
              opacity: prog(frame, 84, 10),
            }}
          >
            <Star size={18} color="#FFFFFF" />
            <span style={{ fontFamily: FONTS.ui, fontSize: 21, color: '#FFFFFF' }}>
              {COPY.s13.goal.tag}
            </span>
          </div>
          <div
            style={{
              fontFamily: FONTS.ui,
              fontWeight: 500,
              fontSize: 34,
              color: '#FFFFFF',
              marginTop: 16,
              opacity: prog(frame, 87, 10),
            }}
          >
            {COPY.s13.goal.label}
          </div>
          <Counter
            to={COPY.s13.goal.value}
            delay={90}
            dur={30}
            prefix="+"
            suffix="%"
            size={64}
            weight={700}
            color={COLORS.greenGlow}
            style={{ marginTop: 4, textShadow: '0 0 24px rgba(47,233,166,0.5)' }}
          />
          <div
            style={{
              fontFamily: FONTS.ui,
              fontSize: 21,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 6,
              opacity: prog(frame, 100, 10),
            }}
          >
            {COPY.s13.goal.caption}
          </div>

          {/* alvo luminoso */}
          <div style={{ position: 'absolute', right: 12, top: 26 }}>
            {[0, 1, 2].map((i) => {
              const p = prog(frame, 88 + i * 5, 18, EASE.back);
              const size = 174 - i * 48;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    right: 92 - size / 2,
                    top: 96 - size / 2,
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    border: `${7 - i}px solid rgba(120,255,214,${0.3 + i * 0.22})`,
                    transform: `scale(${p})`,
                    boxShadow: `0 0 ${28 + breathe(frame, 0.09, 12, i)}px rgba(47,233,166,0.5)`,
                  }}
                />
              );
            })}
            <div
              style={{
                position: 'absolute',
                right: 85,
                top: 89,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: `0 0 ${20 + breathe(frame, 0.12, 8)}px #FFFFFF`,
                opacity: prog(frame, 100, 9),
              }}
            />
          </div>
        </div>

        {/* pílulas finais */}
        {COPY.s13.pills.map((p, i) => {
          const d = 106 + i * 7;
          const s = springAt(frame, fps, d, SPRINGS.pop);
          return (
            <div
              key={p}
              style={{
                position: 'absolute',
                left: i === 0 ? 132 : 452,
                top: 1560,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px 30px',
                borderRadius: 22,
                background: i === 0 ? COLORS.white : COLORS.greenPaler,
                boxShadow: SHADOW.chip,
                opacity: prog(frame, d, 12),
                transform: `translateY(${(1 - s) * 40}px) scale(${0.9 + s * 0.1})`,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: i === 0 ? '#FFFFFF' : '#C9EEDD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: i === 0 ? '2px solid #E7EBEA' : 'none',
                }}
              >
                {i === 0 ? (
                  <TrendUp size={30} color={COLORS.green} strokeWidth={2.4} />
                ) : (
                  <ArrowUpRight size={30} color={COLORS.green} strokeWidth={2.6} />
                )}
              </div>
              <span
                style={{
                  fontFamily: FONTS.ui,
                  fontWeight: 400,
                  fontSize: 34,
                  color: COLORS.inkSoft,
                }}
              >
                {p}
              </span>
            </div>
          );
        })}
      </Scene>

      <Sparks
        count={20}
        delay={88}
        origin={[930, 1330]}
        spread={260}
        rise={180}
        color={COLORS.greenNeon}
        seed="prev"
      />
      <Flash at={28} dur={7} max={0.3} />
      <LightSweep delay={46} dur={40} />

      <SfxTrack
        cues={[
          { name: 'whooshTransition', at: 0, volume: 0.78 },
          { name: 'whooshShort', at: 2 },
          { name: 'popSoft', at: 14 },
          { name: 'tickMicro', at: 22 },
          { name: 'tickMicro', at: 26, rate: 1.1 },
          { name: 'whooshShort', at: 28, rate: 0.9 },
          { name: 'popUi', at: 37 },
          { name: 'riserShort', at: 40, volume: 0.42 },
          { name: 'tapButton', at: 44, volume: 1.1 },
          { name: 'clickDigital', at: 47 },
          { name: 'notificationPop', at: 68 },
          { name: 'notificationPop', at: 75, rate: 1.08 },
          { name: 'popSoft', at: 70 },
          { name: 'whooshShort', at: 78, rate: 1.06 },
          { name: 'sparkleShine', at: 88 },
          { name: 'successChime', at: 90, volume: 0.8 },
          { name: 'bassHit', at: 90, volume: 0.55 },
          { name: 'popUi', at: 106 },
          { name: 'popUi', at: 113, rate: 1.08 },
        ]}
      />
    </AbsoluteFill>
  );
};
