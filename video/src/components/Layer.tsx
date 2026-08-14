import type { CSSProperties, FC, ReactNode } from "react";
import { useEnter, useFloat, type EnterOpts } from "./anim";

/**
 * Camada posicionada de forma absoluta na tela 1080x1920.
 *
 * Cada elemento reconstruído das referências vira uma Layer própria — é isso
 * que permite animar cards, ícones, números e decorativos individualmente em
 * vez de mover a imagem inteira.
 */
export const Layer: FC<{
  x?: number;
  y?: number;
  w?: number | string;
  h?: number | string;
  /** rotação final fixa (o tilt dos cards da referência) */
  rotate?: number;
  /** animação de entrada */
  enter?: EnterOpts;
  /** flutuação contínua depois de entrar */
  float?: { amp?: number; period?: number; phase?: number };
  z?: number;
  style?: CSSProperties;
  children?: ReactNode;
}> = ({ x = 0, y = 0, w, h, rotate = 0, enter, float, z, style, children }) => {
  const e = useEnter(enter ?? { fade: false });
  const fy = useFloat(float?.amp ?? 0, float?.period ?? 90, float?.phase ?? 0);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: z,
        transform: `translateY(${fy.toFixed(2)}px)${rotate ? ` rotate(${rotate}deg)` : ""}`,
      }}
    >
      <div style={{ width: "100%", height: "100%", ...e, ...style }}>{children}</div>
    </div>
  );
};
