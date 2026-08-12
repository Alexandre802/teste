import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Backdrop, CardClip } from '../components/Backdrop';
import { Logo } from '../components/Logo';
import { Headline, RichLine } from '../components/Text';
import { Avatar, Counter, PhoneFrame } from '../components/Ui';
import { BellOutlineIcon, WarningIcon } from '../components/Icons';
import { Sfx, SfxSeries } from '../components/Sfx';
import { COLORS, FONT, SHADOW } from '../theme';
import { enter, float, iv, pulse, s, SPRING } from '../lib/anim';
import { TEXTS } from '../timeline';

const T = TEXTS.s10;
const INSET: [number, number] = [50, 58];

export const Scene10: React.FC = () => {
  const frame = useCurrentFrame();
  const bell = Math.sin(frame / 3.4) * Math.max(0, 1 - Math.max(0, frame - 70) / 40) * 9;
  const bannerIn = enter(frame, { delay: 74, x: -30, scale: 0.96, config: SPRING.pop, fade: 8 });
  const toggle = s(frame, { delay: 86, config: SPRING.bouncy });
  const ctaIn = enter(frame, { delay: 176, y: 60, scale: 0.86, config: SPRING.bouncy, fade: 10 });
  const ctaPulse = 1 + Math.max(0, Math.sin((frame - 176) / 13)) * 0.028;
  const ctaGlow = 0.3 + 0.3 * Math.max(0, Math.sin((frame - 176) / 13));

  return (
    <Backdrop
      inset={INSET}
      blobs={[
        { x: 1040, y: 80, r: 215, color: COLORS.primarySoft, delay: 0, drift: 8 },
        { x: 24, y: 1560, r: 245, color: COLORS.primarySoft, delay: 4, drift: 12 },
        { x: 1050, y: 1850, r: 160, color: COLORS.primary, delay: 8, drift: 8 },
      ]}
      fans={[{ x: 930, y: 350, size: 150, color: COLORS.peach, rotate: 170, delay: 12 }]}
      strokes={[{ x: 44, y: 1420, size: 92, color: COLORS.peachSoft, rotate: 200, delay: 16 }]}
    >
      <CardClip inset={INSET}>
        <div style={{ position: 'absolute', left: 112, top: 108 }}>
          <Logo size={86} delay={2} fontSize={72} gap={20} />
        </div>

        {/* Chamada principal */}
        <div style={{ position: 'absolute', top: 268, left: 50, right: 50 }}>
          <Headline
            lines={[T.lines[0]]}
            fontSize={112}
            align="center"
            delay={10}
            stagger={4}
            mode="pop"
          />
        </div>
        <div style={{ position: 'absolute', top: 404, left: 50, right: 50 }}>
          <Headline
            lines={[T.lines[1]]}
            fontSize={112}
            align="center"
            delay={22}
            stagger={4}
            mode="pop"
          />
        </div>

        <div style={{ position: 'absolute', top: 600, left: 0, right: 0 }}>
          <RichLine segments={T.subtitle} fontSize={48} delay={40} align="center" />
        </div>

        {/* Painel do app */}
        <div style={{ position: 'absolute', left: 200, top: 728 }}>
          <PhoneFrame
            width={680}
            height={1070}
            delay={50}
            borderWidth={12}
            radius={64}
            borderColor={COLORS.primarySoft}
            y={100}
            notch={false}
          >
            <div style={{ position: 'absolute', inset: 0, background: COLORS.cardBg }}>
              {/* Puxador */}
              <div
                style={{
                  width: 120,
                  height: 12,
                  borderRadius: 6,
                  background: COLORS.lavenderDeep,
                  margin: '18px auto 0',
                }}
              />

              {/* Cabeçalho do app */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 30px 14px',
                  opacity: iv(frame, [58, 68], [0, 1]),
                }}
              >
                <Logo size={44} delay={58} fontSize={38} gap={12} />
                <div style={{ transform: `rotate(${bell.toFixed(2)}deg)`, transformOrigin: 'top center' }}>
                  <BellOutlineIcon size={40} color={COLORS.dark} strokeWidth={7} />
                </div>
              </div>

              {/* Alerta âmbar */}
              <div
                style={{
                  margin: '10px 26px 0',
                  background: COLORS.amberBg,
                  borderRadius: 20,
                  padding: '20px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  opacity: bannerIn.opacity,
                  transform: bannerIn.transform,
                }}
              >
                <WarningIcon size={40} color={COLORS.amber} />
                <div
                  style={{
                    flex: 1,
                    fontFamily: FONT.family,
                    fontWeight: FONT.medium,
                    fontSize: 21,
                    lineHeight: 1.32,
                    color: '#6B5330',
                  }}
                >
                  {T.banner}
                </div>
                <div
                  style={{
                    width: 56,
                    height: 26,
                    borderRadius: 13,
                    background: COLORS.amber,
                    transform: `scaleX(${toggle.toFixed(3)})`,
                    transformOrigin: 'left center',
                  }}
                />
              </div>

              {/* Métricas */}
              <div style={{ display: 'flex', gap: 20, margin: '22px 26px 0' }}>
                {T.stats.map((st, i) => {
                  const d = 100 + i * 14;
                  const e = enter(frame, { delay: d, y: 26, scale: 0.9, config: SPRING.pop, fade: 8 });
                  return (
                    <div
                      key={st.label}
                      style={{
                        flex: 1,
                        background: COLORS.white,
                        borderRadius: 22,
                        boxShadow: SHADOW.cardSoft,
                        border: `1px solid ${COLORS.lavender}`,
                        padding: '26px 10px 24px',
                        textAlign: 'center',
                        opacity: e.opacity,
                        transform: e.transform,
                      }}
                    >
                      <Counter
                        value={st.value}
                        delay={d + 6}
                        fontSize={70}
                        duration={36}
                        color={st.accent ? COLORS.primaryText : COLORS.dark}
                      />
                      <div
                        style={{
                          fontFamily: FONT.family,
                          fontWeight: FONT.regular,
                          fontSize: 24,
                          color: COLORS.body,
                          lineHeight: 1.25,
                          marginTop: 6,
                        }}
                      >
                        {st.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Conversas */}
              <div style={{ margin: '20px 26px 0' }}>
                {T.rows.map((r, i) => {
                  const d = 140 + i * 11;
                  const e = enter(frame, { delay: d, x: 40, config: SPRING.pop, fade: 7 });
                  const badgeG = s(frame, { delay: d + 6, config: SPRING.bouncy });
                  return (
                    <div
                      key={r.initials}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                        padding: '18px 4px',
                        borderBottom:
                          i === T.rows.length - 1 ? 'none' : `1px solid ${COLORS.lavender}`,
                        opacity: e.opacity,
                        transform: e.transform,
                      }}
                    >
                      <Avatar
                        size={62}
                        initials={r.initials}
                        bg={COLORS.lavenderDeep}
                        color={COLORS.primaryText}
                        badge="online"
                        delay={d + 3}
                        fontSize={24}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: FONT.family,
                            fontWeight: FONT.bold,
                            fontSize: 26,
                            color: COLORS.dark,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {r.name}
                        </div>
                        <div
                          style={{
                            fontFamily: FONT.family,
                            fontWeight: FONT.regular,
                            fontSize: 23,
                            color: COLORS.body,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {r.text}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontFamily: FONT.family,
                            fontWeight: FONT.medium,
                            fontSize: 22,
                            color: COLORS.muted,
                          }}
                        >
                          {r.time}
                        </div>
                        {r.badge ? (
                          <div
                            style={{
                              marginTop: 6,
                              marginLeft: 'auto',
                              width: 34,
                              height: 28,
                              borderRadius: 10,
                              background: COLORS.primary,
                              color: COLORS.white,
                              fontFamily: FONT.family,
                              fontWeight: FONT.bold,
                              fontSize: 20,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transform: `scale(${badgeG.toFixed(3)})`,
                            }}
                          >
                            {r.badge}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </PhoneFrame>
        </div>

        {/* Botão final */}
        <div
          style={{
            position: 'absolute',
            left: 148,
            top: 1680,
            width: 784,
            opacity: ctaIn.opacity,
            transform: `${ctaIn.transform} scale(${ctaPulse.toFixed(4)})`,
          }}
        >
          <div
            style={{
              background: `linear-gradient(120deg, ${COLORS.primary}, ${COLORS.primaryDeep})`,
              borderRadius: 66,
              padding: '34px 0',
              textAlign: 'center',
              fontFamily: FONT.family,
              fontWeight: FONT.bold,
              fontSize: 54,
              color: COLORS.white,
              letterSpacing: '-0.025em',
              boxShadow: `0 22px 50px rgba(75,69,241,${ctaGlow.toFixed(2)})`,
            }}
          >
            {T.cta}
          </div>
        </div>
      </CardClip>

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="pop_ui" at={4} />
      <Sfx name="impact" at={10} gain={0.6} />
      <Sfx name="whoosh_short" at={10} />
      <Sfx name="impact" at={22} gain={0.6} />
      <Sfx name="whoosh_short" at={22} gain={0.9} />
      <Sfx name="soft_pop" at={40} />
      <Sfx name="whoosh_transition" at={48} gain={0.6} />
      <Sfx name="digital_click" at={58} />
      <Sfx name="notification_pop" at={74} gain={0.8} />
      <Sfx name="tap" at={86} />
      <Sfx name="pop_ui" at={100} />
      <SfxSeries name="tick" from={106} count={9} every={4} gain={0.3} />
      <Sfx name="pop_ui" at={114} gain={0.9} />
      <SfxSeries name="tick" from={120} count={9} every={4} gain={0.3} />
      <SfxSeries name="soft_pop" from={140} count={4} every={11} gain={0.7} />
      <Sfx name="riser" at={150} gain={0.6} />
      <Sfx name="logo_sting" at={172} />
      <Sfx name="impact" at={176} gain={0.6} />
      <Sfx name="sparkle" at={186} gain={0.8} />
      <Sfx name="success_chime" at={196} gain={0.7} />
    </Backdrop>
  );
};
