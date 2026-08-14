import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { COLORS, EASE, FONTS } from '../config/theme';
import { prog, tween } from './anim';
import { Tone, toneColor } from './Type';

/**
 * Tipografia cinética.
 *
 * O gesto base do reel: a palavra chega de baixo, grande e borrada, e
 * "encaixa" no lugar com um leve overshoot. Rápido de propósito — cada
 * palavra pousa a poucos frames da anterior.
 */

export type Word = {
  t: string;
  tone?: Tone;
  /** caixa de destaque atrás da palavra */
  box?: Tone;
  /** cor do texto quando há caixa */
  boxText?: Tone;
  /** sublinhado que se desenha */
  underline?: Tone;
  /** multiplicador de tamanho desta palavra */
  scale?: number;
  /** peso próprio */
  weight?: number;
  /** família própria */
  family?: string;
};

/** Curva de pouso: sobe, passa um pouco do ponto e assenta. */
const land = (frame: number, delay: number, dur: number) => {
  const p = prog(frame, delay, dur, EASE.out);
  const pf = prog(frame, delay, Math.max(3, dur * 0.36), EASE.out);
  const over = tween(frame, [delay, delay + dur * 1.35], [0, 1], EASE.back);
  return { p, pf, over };
};

/** Uma palavra animada — camada independente. */
export const KineticWord: React.FC<{
  word: Word;
  size: number;
  delay: number;
  dur?: number;
  weight?: number;
  family?: string;
  rise?: number;
  zoom?: number;
  blur?: number;
  tracking?: string;
  lineHeight?: number;
  drift?: number;
  index?: number;
}> = ({
  word,
  size,
  delay,
  dur = 15,
  weight = 800,
  family = FONTS.sans,
  rise = 0.42,
  zoom = 0.3,
  blur = 34,
  tracking = '-0.04em',
  lineHeight = 0.94,
  drift = 1.6,
  index = 0,
}) => {
  const frame = useCurrentFrame();
  const { p, pf, over } = land(frame, delay, dur);
  const fs = size * (word.scale ?? 1);

  // respiro contínuo depois do pouso — nada fica totalmente parado
  const alive = Math.sin((frame - delay) * 0.055 + index) * drift * p;

  const hasBox = Boolean(word.box);
  const color = hasBox
    ? toneColor(word.boxText ?? 'white')
    : toneColor(word.tone ?? 'ink');

  // a caixa abre horizontalmente logo depois da palavra pousar
  const boxP = prog(frame, delay + dur * 0.5, 12, EASE.out);
  const underP = prog(frame, delay + dur * 0.7, 14, EASE.out);

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        opacity: pf,
        transform: `translate3d(0, ${(1 - p) * fs * rise + alive}px, 0) scale(${1 + zoom - over * zoom})`,
        filter: pf < 0.999 ? `blur(${(1 - pf) * blur}px)` : undefined,
        transformOrigin: 'center bottom',
        willChange: 'transform, filter',
      }}
    >
      {hasBox && (
        <span
          style={{
            position: 'absolute',
            left: '-0.09em',
            right: '-0.09em',
            top: '0.11em',
            bottom: '0.09em',
            background: toneColor(word.box as Tone),
            borderRadius: fs * 0.06,
            transform: `scaleX(${boxP})`,
            transformOrigin: 'left center',
          }}
        />
      )}
      <span
        style={{
          position: 'relative',
          fontFamily: word.family ?? family,
          fontWeight: word.weight ?? weight,
          fontSize: fs,
          lineHeight,
          letterSpacing: tracking,
          color,
          whiteSpace: 'pre',
        }}
      >
        {word.t}
      </span>
      {word.underline && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: `-0.04em`,
            height: fs * 0.07,
            borderRadius: 99,
            background: toneColor(word.underline),
            transform: `scaleX(${underP})`,
            transformOrigin: 'left center',
          }}
        />
      )}
    </span>
  );
};

/**
 * Uma linha de palavras que se encaixam em sequência.
 * O layout é fixado pelo flex — só transformações animam, nada reflui.
 */
export const KineticLine: React.FC<{
  words: Word[];
  size: number;
  delay?: number;
  step?: number;
  dur?: number;
  weight?: number;
  family?: string;
  tracking?: string;
  lineHeight?: number;
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end';
  rise?: number;
  zoom?: number;
  blur?: number;
  style?: React.CSSProperties;
  startIndex?: number;
}> = ({
  words,
  size,
  delay = 0,
  step = 6,
  dur = 15,
  weight = 800,
  family = FONTS.sans,
  tracking = '-0.04em',
  lineHeight = 0.94,
  gap,
  align = 'flex-start',
  rise = 0.42,
  zoom = 0.3,
  blur = 34,
  style,
  startIndex = 0,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: align,
      gap: gap ?? size * 0.24,
      lineHeight,
      ...style,
    }}
  >
    {words.map((w, i) => (
      <KineticWord
        key={`${w.t}-${i}`}
        word={w}
        size={size}
        delay={delay + i * step}
        dur={dur}
        weight={weight}
        family={family}
        tracking={tracking}
        lineHeight={lineHeight}
        rise={rise}
        zoom={zoom}
        blur={blur}
        index={startIndex + i}
      />
    ))}
  </div>
);

/**
 * Bloco de várias linhas com contagem contínua de palavras — o stagger
 * atravessa as linhas, então a leitura flui sem pausas artificiais.
 */
export const KineticBlock: React.FC<{
  lines: Word[][];
  size: number;
  delay?: number;
  step?: number;
  dur?: number;
  weight?: number;
  family?: string;
  tracking?: string;
  lineHeight?: number;
  lineGap?: number;
  align?: 'flex-start' | 'center' | 'flex-end';
  rise?: number;
  zoom?: number;
  blur?: number;
  style?: React.CSSProperties;
  /** pausa extra (frames) ao trocar de linha */
  lineStep?: number;
}> = ({
  lines,
  size,
  delay = 0,
  step = 6,
  dur = 15,
  weight = 800,
  family = FONTS.sans,
  tracking = '-0.04em',
  lineHeight = 0.94,
  lineGap = 0,
  align = 'flex-start',
  rise = 0.42,
  zoom = 0.3,
  blur = 34,
  style,
  lineStep = 2,
}) => {
  let n = 0;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align,
        gap: lineGap,
        ...style,
      }}
    >
      {lines.map((ws, li) => {
        const d = delay + n * step + li * lineStep;
        const start = n;
        n += ws.length;
        return (
          <KineticLine
            key={li}
            words={ws}
            size={size}
            delay={d}
            step={step}
            dur={dur}
            weight={weight}
            family={family}
            tracking={tracking}
            lineHeight={lineHeight}
            align={align}
            rise={rise}
            zoom={zoom}
            blur={blur}
            startIndex={start}
          />
        );
      })}
    </div>
  );
};

/**
 * "Batida" dentro de uma cena: um bloco aparece, segura por alguns frames e
 * sai encolhendo/borrando enquanto o próximo entra. É o que dá o ritmo de
 * uma ideia a cada ~1,5s em vez de um único bloco parado a cena inteira.
 *
 * Os filhos enxergam o frame a partir do início da batida, então os delays
 * das palavras são escritos localmente.
 */
const BeatBody: React.FC<{
  len: number;
  hold: boolean;
  exitDur: number;
  children: React.ReactNode;
}> = ({ len, hold, exitDur, children }) => {
  const frame = useCurrentFrame();
  const e = hold ? 0 : tween(frame, [len - exitDur, len], [0, 1], EASE.in);
  return (
    <div
      style={{
        opacity: 1 - e,
        transform: `scale(${1 - e * 0.22}) translate3d(0, ${-e * 46}px, 0)`,
        filter: e > 0.001 ? `blur(${e * 30}px)` : undefined,
        transformOrigin: 'center center',
        willChange: 'transform, filter',
      }}
    >
      {children}
    </div>
  );
};

export const Beat: React.FC<{
  from: number;
  len: number;
  /** true = não sai sozinha (a saída da cena cuida disso) */
  hold?: boolean;
  exitDur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ from, len, hold = false, exitDur = 10, children, style }) => (
  <Sequence
    from={from}
    durationInFrames={len + (hold ? 0 : 2)}
    layout="none"
    name="beat"
  >
    <AbsoluteFill style={style}>
      <BeatBody len={len} hold={hold} exitDur={exitDur}>
        {children}
      </BeatBody>
    </AbsoluteFill>
  </Sequence>
);

/**
 * Troca de palavra no mesmo lugar: a antiga sai comprimida e borrada
 * enquanto a nova encaixa.
 */
export const WordSwap: React.FC<{
  words: string[];
  at: number[];
  size: number;
  tone?: Tone;
  weight?: number;
  family?: string;
  tracking?: string;
  style?: React.CSSProperties;
}> = ({
  words,
  at,
  size,
  tone = 'green',
  weight = 800,
  family = FONTS.sans,
  tracking = '-0.04em',
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      {words.map((w, i) => {
        const inAt = at[i];
        const outAt = at[i + 1] ?? Infinity;
        if (frame < inAt - 2 || frame > outAt + 12) return null;
        const pin = prog(frame, inAt, 12, EASE.out);
        const pout = outAt === Infinity ? 0 : prog(frame, outAt, 10, EASE.in);
        return (
          <span
            key={w}
            style={{
              position: i === 0 ? 'relative' : 'absolute',
              left: 0,
              top: 0,
              fontFamily: family,
              fontWeight: weight,
              fontSize: size,
              letterSpacing: tracking,
              color: toneColor(tone),
              whiteSpace: 'pre',
              opacity: pin * (1 - pout),
              transform: `translateY(${(1 - pin) * size * 0.4 - pout * size * 0.35}px) scale(${(0.82 + pin * 0.18) * (1 - pout * 0.16)})`,
              filter: `blur(${((1 - pin) * 22 + pout * 20).toFixed(2)}px)`,
              transformOrigin: 'left center',
            }}
          >
            {w}
          </span>
        );
      })}
    </span>
  );
};

/** Dígitos que rolam como odômetro. */
export const RollNumber: React.FC<{
  value: string;
  size: number;
  delay?: number;
  step?: number;
  tone?: Tone;
  weight?: number;
  family?: string;
  style?: React.CSSProperties;
}> = ({
  value,
  size,
  delay = 0,
  step = 3,
  tone = 'ink',
  weight = 800,
  family = FONTS.ui,
  style,
}) => {
  const frame = useCurrentFrame();
  const chars = value.split('');
  return (
    <span style={{ display: 'inline-flex', ...style }}>
      {chars.map((c, i) => {
        const d = delay + i * step;
        const p = prog(frame, d, 18, EASE.out);
        const isDigit = /[0-9]/.test(c);
        if (!isDigit) {
          return (
            <span
              key={i}
              style={{
                fontFamily: family,
                fontWeight: weight,
                fontSize: size,
                color: toneColor(tone),
                opacity: p,
              }}
            >
              {c}
            </span>
          );
        }
        const target = Number(c);
        // rola de um dígito acima até parar no alvo
        const spins = 1.4;
        const pos = (1 - p) * (10 * spins) + target;
        const offset = (pos % 10) * size * 1.06;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              height: size * 1.06,
              overflow: 'hidden',
              width: size * 0.58,
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                transform: `translateY(-${offset}px)`,
              }}
            >
              {Array.from({ length: 30 }).map((_, k) => (
                <span
                  key={k}
                  style={{
                    height: size * 1.06,
                    lineHeight: `${size * 1.06}px`,
                    fontFamily: family,
                    fontWeight: weight,
                    fontSize: size,
                    color: toneColor(tone),
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {k % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
};

/** Pílula que aparece com pop ao lado de um texto. */
export const Badge: React.FC<{
  label: string;
  delay?: number;
  size?: number;
  bg?: string;
  color?: string;
  style?: React.CSSProperties;
}> = ({
  label,
  delay = 0,
  size = 30,
  bg = COLORS.green,
  color = '#FFFFFF',
  style,
}) => {
  const frame = useCurrentFrame();
  const p = tween(frame, [delay, delay + 13], [0, 1], EASE.back);
  const wob = Math.sin((frame - delay) * 0.09) * 1.6 * Math.min(1, p);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: `${size * 0.3}px ${size * 0.62}px`,
        borderRadius: 999,
        background: bg,
        color,
        fontFamily: FONTS.ui,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        opacity: prog(frame, delay, 6),
        transform: `scale(${p}) rotate(${(1 - p) * -10 + wob}deg)`,
        ...style,
      }}
    >
      {label}
    </span>
  );
};
