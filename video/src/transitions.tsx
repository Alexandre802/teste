import type { FC } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { COLORS, hexA } from "./config/theme";
import type { TransitionKind } from "./config/scenes";

/* ------------------------------------------------------------------ wipe -- */

type WipeProps = { color: string };

const WipeGreenComp: FC<TransitionPresentationComponentProps<WipeProps>> = ({
  children,
  presentationProgress: p,
  presentationDirection: dir,
  passedProps,
}) => {
  const entering = dir === "entering";
  // A cortina verde cruza a tela na diagonal revelando a cena nova.
  const edge = entering ? p * 145 - 25 : p * 145 - 25;
  const clip = entering
    ? `polygon(0% ${edge + 22}%, 100% ${edge - 22}%, 100% 200%, 0% 200%)`
    : `polygon(0% -100%, 100% -100%, 100% ${edge - 22}%, 0% ${edge + 22}%)`;

  return (
    <AbsoluteFill style={{ clipPath: clip }}>
      {children}
      {entering ? (
        // faixa verde colada na borda da cortina, acompanhando o avanço dela
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${passedProps.color} ${Math.max(0, edge - 26).toFixed(
              1,
            )}%, ${hexA(passedProps.color, 0.55)} ${(edge + 6).toFixed(1)}%, ${hexA(
              passedProps.color,
              0,
            )} ${(edge + 30).toFixed(1)}%)`,
            opacity: interpolate(p, [0, 0.75, 1], [1, 0.9, 0]),
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
