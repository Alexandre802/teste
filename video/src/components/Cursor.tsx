/**
 * Cursor de mouse dirigido por waypoints.
 *
 * Recebe uma lista de pontos com frame de chegada; interpola a posição
 * com easing entre eles e desenha o ponteiro, a onda de clique e um
 * leve rastro nos trechos rápidos.
 */
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../lib/anim";

export type Waypoint = {
  /** Frame (relativo à cena) em que o cursor chega neste ponto. */
  at: number;
  x: number;
  y: number;
  /** Dispara a onda de clique ao chegar. */
  click?: boolean;
  /** Mantém o botão pressionado (arrasto/rolagem). */
  hold?: boolean;
};

const posAt = (frame: number, path: Waypoint[]) => {
  if (frame <= path[0].at) return { x: path[0].x, y: path[0].y, moving: 0 };
  const last = path[path.length - 1];
  if (frame >= last.at) return { x: last.x, y: last.y, moving: 0 };

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (frame >= a.at && frame <= b.at) {
      const p = interpolate(frame, [a.at, b.at], [0, 1], {
        easing: EASE.inOutCubic,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const pPrev = interpolate(frame - 1, [a.at, b.at], [0, 1], {
        easing: EASE.inOutCubic,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      return {
        x: a.x + (b.x - a.x) * p,
        y: a.y + (b.y - a.y) * p,
        moving: Math.abs(p - pPrev) * dist,
      };
    }
  }
  return { x: last.x, y: last.y, moving: 0 };
};

export const Cursor: React.FC<{
  path: Waypoint[];
  size?: number;
  /** Frame em que o cursor aparece. */
  appearAt?: number;
  opacity?: number;
}> = ({ path, size = 46, appearAt = 0, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { x, y, moving } = posAt(frame, path);

  const show = interpolate(frame, [appearAt, appearAt + 10], [0, 1], {
    easing: EASE.outExpo,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // clique mais recente já disparado
  const clicks = path.filter((w) => w.click);
  const pressed = path.some(
    (w) => w.click && frame >= w.at && frame < w.at + 7,
  );
  const holding = (() => {
    for (let i = 0; i < path.length - 1; i++) {
      if (path[i].hold && frame >= path[i].at && frame <= path[i + 1].at) return true;
    }
    return false;
  })();

  const squash = pressed ? 0.82 : holding ? 0.9 : 1;
  const trail = Math.min(moving * 0.05, 7);

  return (
    <>
      {/* ondas de clique */}
      {clicks.map((c, i) => {
        const age = frame - c.at;
        if (age < 0 || age > 26) return null;
        const p = age / 26;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              width: size * 2.4 * p,
              height: size * 2.4 * p,
              marginLeft: -size * 1.2 * p,
              marginTop: -size * 1.2 * p,
              borderRadius: "50%",
              border: `${Math.max(1, 3 * (1 - p))}px solid rgba(199,125,255,${0.85 * (1 - p)})`,
              boxShadow: `0 0 ${20 * (1 - p)}px rgba(199,125,255,${0.6 * (1 - p)})`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* ponteiro */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          opacity: show * opacity,
          transform: `scale(${show * squash})`,
          transformOrigin: "4px 4px",
          filter: trail > 0.6 ? `blur(${trail * 0.35}px)` : undefined,
          pointerEvents: "none",
          zIndex: 40,
        }}
      >
        <svg width={size} height={size * 1.32} viewBox="0 0 26 34" fill="none">
          <path
            d="M3 2.2 21.4 18.1l-7.7.6 4.3 9.4-3.6 1.7-4.3-9.4-5.4 5.2z"
            fill="#FFFFFF"
            stroke="#1A0330"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
};
