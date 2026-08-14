import type { FC } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, hexA } from "../config/theme";
import { useFloat } from "./anim";

const COLUMNS = [
  { x: -60, y: 300, w: 210, h: 620, o: 0.55, s: 1 },
  { x: 120, y: 980, w: 150, h: 430, o: 0.4, s: 1.6 },
  { x: 760, y: 120, w: 190, h: 540, o: 0.45, s: 0.7 },
  { x: 900, y: 760, w: 230, h: 700, o: 0.5, s: 1.25 },
  { x: 640, y: 1380, w: 170, h: 520, o: 0.35, s: 1.9 },
  { x: -40, y: 1500, w: 200, h: 480, o: 0.42, s: 0.9 },
];

/** Fundo claro com as colunas arredondadas verde-claras das referências. */
export const BackdropLight: FC<{ duration: number; drift?: number }> = ({ duration, drift = 46 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duration], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: COLORS.bg, overflow: "hidden" }}>
      {COLUMNS.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: c.x,
            top: c.y - t * drift * c.s,
            width: c.w,
            height: c.h,
            borderRadius: c.w * 0.42,
            background: `linear-gradient(180deg, ${hexA(COLORS.mint, 0.34 * c.o)}, ${hexA(
              COLORS.mint,
              0.06 * c.o,
            )})`,
          }}
        />
      ))}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 70% at 50% 8%, ${hexA(COLORS.white, 0.85)}, transparent 60%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Fundo escuro com brilho neon e colunas de luz (cenas 5 e 10). */
export const BackdropDark: FC<{ duration: number; intensity?: number }> = ({
  duration,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duration], [0, 1], { extrapolateRight: "clamp" });
  const pulse = useFloat(0.06, 110);
  return (
    <AbsoluteFill style={{ background: COLORS.darkBg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(90% 55% at 50% 104%, ${hexA(
            COLORS.neon,
            (0.3 + pulse) * intensity,
          )}, transparent 66%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 40% at 12% 68%, ${hexA(COLORS.neon, 0.14 * intensity)}, transparent 62%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 36% at 90% 40%, ${hexA(COLORS.neon, 0.11 * intensity)}, transparent 60%)`,
        }}
      />
      {COLUMNS.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: c.x,
            top: c.y + 260 - t * 60 * c.s,
            width: c.w * 0.7,
            height: c.h * 0.9,
            borderRadius: c.w * 0.3,
            background: `linear-gradient(180deg, ${hexA(COLORS.neon, 0.02)}, ${hexA(COLORS.neon, 0.16 * c.o)})`,
            filter: "blur(1px)",
          }}
        />
      ))}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${hexA("#000000", 0.55)} 0%, transparent 34%, transparent 62%, ${hexA(
            "#000000",
            0.35,
          )} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
