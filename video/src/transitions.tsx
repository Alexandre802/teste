import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { COLORS, hexA } from "./config/theme";
import type { TransitionKind } from "./config/scenes";

/* ------------------------------------------------------------------ wipe -- */

/**
 * ATENÇÃO ao escrever uma presentation nova:
 *
 * O Remotion mantém a cena embrulhada na presentation durante TODA a
 * sequência, não apenas durante o cruzamento — `presentationProgress` fica
 * travado em 0 antes da transição e em 1 depois dela. Logo, a presentation
 * precisa deixar a cena 100% visível nos extremos certos:
 *
 *   - `entering` em p = 1  -> totalmente visível
 *   - `exiting`  em p = 0  -> totalmente visível
 *
 * Errar isso não quebra o cruzamento (que continua parecendo correto no
 * meio): apaga o corpo inteiro das cenas vizinhas.
 */

type WipeProps = { color: string };

/** Inclinação da diagonal, em % da altura. */
const WIPE_SKEW = 22;

const WipeGreenComp: FC<TransitionPresentationComponentProps<WipeProps>> = ({
  children,
  presentationProgress: p,
  presentationDirection: dir,
  passedProps,
}) => {
  const entering = dir === "entering";

  // A cortina desce: em p = 0 está acima da tela, em p = 1 já passou por ela.
  const edge = interpolate(p, [0, 1], [-WIPE_SKEW - 4, 100 + WIPE_SKEW + 4]);
  const top = `polygon(0% -100%, 100% -100%, 100% ${(edge - WIPE_SKEW).toFixed(2)}%, 0% ${(
    edge + WIPE_SKEW
  ).toFixed(2)}%)`;
  const bottom = `polygon(0% ${(edge + WIPE_SKEW).toFixed(2)}%, 100% ${(edge - WIPE_SKEW).toFixed(
    2,
  )}%, 100% 200%, 0% 200%)`;

  // A cena nova é revelada acima da diagonal; a antiga permanece abaixo dela.
  return (
    <AbsoluteFill style={{ clipPath: entering ? top : bottom }}>
      {children}
      {entering ? (
        // faixa verde colada na borda de ataque da cortina
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${hexA(passedProps.color, 0)} ${(edge - 36).toFixed(
              2,
            )}%, ${hexA(passedProps.color, 0.7)} ${(edge - 8).toFixed(2)}%, ${
              passedProps.color
            } ${(edge + 4).toFixed(2)}%)`,
            opacity: interpolate(p, [0, 0.72, 1], [1, 0.95, 0]),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const wipeGreen = (color = COLORS.green): TransitionPresentation<WipeProps> => ({
  component: WipeGreenComp,
  props: { color },
});

/* ---------------------------------------------------------------- glitch -- */

type GlitchProps = { tint: string };

const GlitchComp: FC<TransitionPresentationComponentProps<GlitchProps>> = ({
  children,
  presentationProgress: p,
  presentationDirection: dir,
  passedProps,
}) => {
  const entering = dir === "entering";
  const peak = Math.sin(p * Math.PI); // 0 -> 1 -> 0
  const jitter = (entering ? 1 : -1) * peak * 26 * Math.sin(p * 41);
  const scale = entering ? interpolate(p, [0, 1], [1.07, 1]) : interpolate(p, [0, 1], [1, 0.96]);
  const opacity = entering
    ? interpolate(p, [0, 0.32, 1], [0, 1, 1])
    : interpolate(p, [0, 0.5, 1], [1, 0.5, 0]);

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateX(${jitter.toFixed(2)}px) scale(${scale.toFixed(4)})`,
      }}
    >
      {children}
      {/* faixas digitais deslizando */}
      <AbsoluteFill
        style={{
          opacity: peak * 0.5,
          background: `repeating-linear-gradient(0deg, ${hexA(passedProps.tint, 0.16)} 0px, ${hexA(
            passedProps.tint,
            0.16,
          )} 3px, transparent 3px, transparent 12px)`,
          transform: `translateY(${(peak * 40 * Math.sin(p * 23)).toFixed(1)}px)`,
          mixBlendMode: "screen",
        }}
      />
      {/* estouro de preto no meio da troca */}
      <AbsoluteFill
        style={{
          background: "#000",
          opacity: entering ? interpolate(p, [0, 0.18, 0.45], [0.85, 0.4, 0]) : 0,
        }}
      />
    </AbsoluteFill>
  );
};

const glitchDark = (tint = COLORS.neon): TransitionPresentation<GlitchProps> => ({
  component: GlitchComp,
  props: { tint },
});

/* -------------------------------------------------------------- fadeScale -- */

const FadeScaleComp: FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationProgress: p,
  presentationDirection: dir,
}) => {
  const entering = dir === "entering";
  return (
    <AbsoluteFill
      style={{
        opacity: entering ? p : 1 - p,
        transform: entering
          ? `scale(${interpolate(p, [0, 1], [1.09, 1]).toFixed(4)})`
          : `scale(${interpolate(p, [0, 1], [1, 0.94]).toFixed(4)})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const fadeScale = (): TransitionPresentation<Record<string, never>> => ({
  component: FadeScaleComp,
  props: {},
});

/* ------------------------------------------------------------------ mapa -- */

/**
 * As presentations do Remotion são genéricas nos próprios props; como
 * misturamos presets e customizadas numa lista só, o tipo é apagado aqui.
 */
export const presentationFor = (kind: TransitionKind): TransitionPresentation<never> => {
  const pick = (): unknown => {
    switch (kind) {
      case "slideUp":
        return slide({ direction: "from-bottom" });
      case "slideLeft":
        return slide({ direction: "from-right" });
      case "fadeScale":
        return fadeScale();
      case "wipeGreen":
        return wipeGreen();
      case "glitchDark":
        return glitchDark();
      default:
        return fade();
    }
  };
  return pick() as TransitionPresentation<never>;
};
