/**
 * Primitivas de motion graphics sobre a arte ORIGINAL.
 *
 * Regra da casa: nenhum pixel da arte e recriado, borrado ou apagado, e a
 * mesma peca nunca aparece duas vezes. Toda animacao vem de:
 *   - camera (transformacao do quadro inteiro)
 *   - revelacao por mascara (a arte surge, nunca e substituida)
 *   - cortina de cor lida da propria arte (telas de app, cards)
 *   - overlay de luz em modo screen (brilho, clarao, passada)
 *
 * <Backdrop> palco: degrade lido das bordas da arte
 * <Art>      a arte inteira, sob a camera
 * <Reveal>   revela um pedaco da arte com uma varredura de borda suave
 * <Piece>    realca um elemento dentro da janela dele (nunca vaza nem duplica)
 * <Curtain>  tapa uma superficie e recua revelando o conteudo original
 * <Glint>    brilho que percorre um caminho, por cima do traco que ja existe
 * <Sweep>    passada de luz diagonal
 * <Flash>    clarao curto para as batidas
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { R, SURF, BACKDROP, type Rect, type Surface } from "../regions.gen";
import type { SceneId } from "../config";

export const rect = (scene: SceneId, name: string): Rect => {
  const r = R[scene]?.[name];
  if (!r) throw new Error(`regiao inexistente: ${scene}/${name}`);
  return r;
};

const surface = (scene: SceneId, name: string): Surface => {
  const s = SURF[scene]?.[name];
  if (!s) throw new Error(`superficie inexistente: ${scene}/${name}`);
  return s;
};

const artSrc = (scene: SceneId) => staticFile(`art/${scene}.jpg`);

export const Backdrop: React.FC<{ scene: SceneId }> = ({ scene }) => (
  <AbsoluteFill style={{ background: BACKDROP[scene] }} />
);

const ArtImg: React.FC<{ scene: SceneId; t?: string; o?: string }> = ({ scene, t, o }) => (
  <Img
    src={artSrc(scene)}
    style={{
      width: "100%",
      height: "100%",
      display: "block",
      transform: t,
      transformOrigin: o,
    }}
  />
);

export const Art: React.FC<{ scene: SceneId; cam?: string; style?: React.CSSProperties }> = ({
  scene,
  cam,
  style,
}) => (
  <AbsoluteFill style={{ transform: cam, transformOrigin: "center center", ...style }}>
    <ArtImg scene={scene} />
  </AbsoluteFill>
);

const clipOf = (r: Rect) =>
  `inset(${r.y}px ${1080 - (r.x + r.w)}px ${1920 - (r.y + r.h)}px ${r.x}px)`;

export type Dir = "down" | "up" | "left" | "right" | "none";

/** Mascara suave da varredura, em porcentagem do quadro. */
export const wipeMask = (r: Rect, p: number, dir: Dir, soft = 26): string | undefined => {
  if (dir === "none" || p >= 1) return undefined;
  const s = soft; // largura da borda suave, em px
  if (dir === "down" || dir === "up") {
    const edge = dir === "down" ? r.y + r.h * p : r.y + r.h * (1 - p);
    const a = ((edge - s) / 1920) * 100;
    const b = ((edge + s) / 1920) * 100;
    return dir === "down"
      ? `linear-gradient(180deg, #000 ${a}%, transparent ${b}%)`
      : `linear-gradient(180deg, transparent ${a}%, #000 ${b}%)`;
  }
  const edge = dir === "right" ? r.x + r.w * p : r.x + r.w * (1 - p);
  const a = ((edge - s) / 1080) * 100;
  const b = ((edge + s) / 1080) * 100;
  return dir === "right"
    ? `linear-gradient(90deg, #000 ${a}%, transparent ${b}%)`
    : `linear-gradient(90deg, transparent ${a}%, #000 ${b}%)`;
};

/**
 * Revela um pedaco da arte. `p` vai de 0 (nada) a 1 (pedaco inteiro).
 * O deslocamento opcional some ate o fim da revelacao, entao em repouso a
 * peca esta exatamente onde estava na arte.
 */
export const Reveal: React.FC<{
  scene: SceneId;
  r: Rect;
  p: number;
  dir?: Dir;
  soft?: number;
  /** deslocamento inicial, que vai a zero conforme p -> 1 */
  dx?: number;
  dy?: number;
  scale?: number;
  cam?: string;
  filter?: string;
  opacity?: number;
}> = ({ scene, r, p, dir = "down", soft = 26, dx = 0, dy = 0, scale = 1, cam, filter, opacity = 1 }) => {
  if (p <= 0.001 || opacity <= 0.001) return null;
  const k = 1 - Math.min(1, p);
  const mask = wipeMask(r, p, dir, soft);
  const moved = dx * k !== 0 || dy * k !== 0 || scale !== 1;
  return (
    <AbsoluteFill style={{ transform: cam, transformOrigin: "center center" }}>
      <AbsoluteFill
        style={{
          clipPath: clipOf(r),
          opacity,
          filter,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        <ArtImg
          scene={scene}
          t={
            moved
              ? `translate3d(${(dx * k).toFixed(2)}px,${(dy * k).toFixed(2)}px,0) scale(${scale})`
              : undefined
          }
          o={`${r.x + r.w / 2}px ${r.y + r.h / 2}px`}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Realce dentro da janela do proprio elemento: a imagem cresce por dentro do
 * recorte, cobrindo sempre o proprio lugar. Serve para dar batida sem
 * descobrir buraco nem deixar copia por baixo.
 */
export const Piece: React.FC<{
  scene: SceneId;
  name: string;
  /** escala do realce; nunca abaixo de 1 */
  scale?: number;
  /** intensidade do brilho, 0..1 */
  glow?: number;
  opacity?: number;
  cam?: string;
}> = ({ scene, name, scale = 1, glow = 0, opacity = 1, cam }) => {
  const r = rect(scene, name);
  // fora da batida o realce nao existe: senao ele mostraria o elemento
  // antes de a cena revelar aquela area
  if (opacity <= 0.001 || (scale <= 1.0001 && glow <= 0.001)) return null;
  const filter = glow > 0.001 ? `brightness(${(1 + glow).toFixed(3)})` : undefined;
  return (
    <AbsoluteFill style={{ transform: cam, transformOrigin: "center center" }}>
      <AbsoluteFill style={{ clipPath: clipOf(r), opacity, filter }}>
        <ArtImg
          scene={scene}
          t={`scale(${Math.max(1, scale)})`}
          o={`${r.x + r.w / 2}px ${r.y + r.h / 2}px`}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Cortina sobre uma superficie da arte (tela de app, card de status).
 *
 * O poligono vem dos cantos MEDIDOS na arte, entao ela acompanha a
 * inclinacao real do celular. A cor e lida da propria tela. A cortina recua
 * de cima para baixo e o conteudo original vai aparecendo na ordem -
 * nenhum pixel e recriado.  `p` = 0 tapada, 1 aberta.
 */
/** Caixa que envolve uma superficie - util para mirar a camera nela. */
export const surfaceBox = (scene: SceneId, name: string): Rect => {
  const q = surface(scene, name).quad;
  const xs = q.map((p) => p[0]);
  const ys = q.map((p) => p[1]);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
};

/** Ponto da borda da cortina em progresso p (para o brilho acompanhar). */
export const curtainEdge = (
  scene: SceneId,
  name: string,
  p: number,
  side = 0.16
): [number, number] => {
  const [tl, tr, br, bl] = surface(scene, name).quad;
  const l = lerp(tl, bl, p);
  const r = lerp(tr, br, p);
  return [l[0] + (r[0] - l[0]) * side, l[1] + (r[1] - l[1]) * side];
};

const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
const poly = (pts: [number, number][]) =>
  `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ")})`;

export const Curtain: React.FC<{
  scene: SceneId;
  name: string;
  p: number;
  cam?: string;
  edge?: boolean;
  /** mesma mascara da revelacao do aparelho: a cortina nasce junto com ele,
      em vez de aparecer depois e apagar o que ja estava na tela */
  mask?: string;
}> = ({ scene, name, p, cam, edge = true, mask }) => {
  const s = surface(scene, name);
  if (p >= 0.999) return null;
  const k = Math.max(0, Math.min(1, p));
  const [tl, tr, br, bl] = s.quad;
  const l = lerp(tl, bl, k);
  const r = lerp(tr, br, k);
  const le = lerp(tl, bl, Math.min(1, k + 0.012));
  const re = lerp(tr, br, Math.min(1, k + 0.012));
  return (
    <AbsoluteFill
      style={{
        transform: cam,
        transformOrigin: "center center",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <AbsoluteFill style={{ clipPath: poly([l, r, br, bl]), background: s.rgb }} />
      {edge && k > 0.001 && (
        <AbsoluteFill
          style={{
            clipPath: poly([l, r, re, le]),
            background: "rgba(150,205,255,.95)",
            filter: "blur(2px)",
            mixBlendMode: "screen",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

/** Brilho percorrendo um caminho, por cima do traco que ja existe na arte. */
export const Glint: React.FC<{
  at: [number, number];
  size?: number;
  color?: string;
  opacity?: number;
  cam?: string;
}> = ({ at, size = 46, color = "#bfe6ff", opacity = 1, cam }) => {
  if (opacity <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{ transform: cam, transformOrigin: "center center", mixBlendMode: "screen" }}
    >
      <div
        style={{
          position: "absolute",
          left: at[0] - size / 2,
          top: at[1] - size / 2,
          width: size,
          height: size,
          borderRadius: size,
          opacity,
          background: `radial-gradient(circle, #ffffff 0%, ${color} 38%, rgba(255,255,255,0) 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Passada de luz diagonal sobre a cena inteira. */
export const Sweep: React.FC<{ p: number; strength?: number }> = ({ p, strength = 0.45 }) => {
  if (p <= 0 || p >= 1) return null;
  const x = p * 150 - 25;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: strength * Math.sin(Math.PI * p),
        background: `linear-gradient(105deg, transparent ${x - 20}%, rgba(185,222,255,.8) ${x}%, transparent ${
          x + 20
        }%)`,
      }}
    />
  );
};

/** Clarao curto, para as batidas. */
export const Flash: React.FC<{ p: number; color?: string; spread?: string; strength?: number }> = ({
  p,
  color = "#cfe4ff",
  spread = "70% 45% at 50% 50%",
  strength = 0.3,
}) => {
  if (p <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity: p * strength,
        background: `radial-gradient(${spread}, ${color}, rgba(0,0,0,0) 72%)`,
      }}
    />
  );
};

/* ------------------------------------------------------------------------
 * Montagem da cena por faixas.
 *
 * As faixas cobrem o quadro inteiro, entao a arte se monta sem deixar
 * buraco. Onde uma faixa cai sobre area ja revelada, os pixels sao os
 * mesmos - nao ha emenda nem copia. O passo final e uma revelacao do quadro
 * inteiro, que so tem efeito em sobras minusculas.
 * ---------------------------------------------------------------------- */

export type Step = {
  r: Rect;
  /** quadro em que comeca */
  at: number;
  /** quantos quadros leva */
  dur?: number;
  dir?: Dir;
  dx?: number;
  dy?: number;
  soft?: number;
};

/** Faixa de largura total, entre duas alturas. */
export const band = (y0: number, y1: number): Rect => ({ x: 0, y: y0, w: 1080, h: y1 - y0 });
/** Pedaco de uma faixa, entre dois x. */
export const slice = (x0: number, y0: number, x1: number, y1: number): Rect => ({
  x: x0,
  y: y0,
  w: x1 - x0,
  h: y1 - y0,
});
export const FULL: Rect = { x: 0, y: 0, w: 1080, h: 1920 };

const ease = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

export const Build: React.FC<{
  scene: SceneId;
  steps: Step[];
  frame: number;
  cam?: string;
  /** quadro em que a arte inteira termina de preencher as sobras */
  fillAt: number;
}> = ({ scene, steps, frame, cam, fillAt }) => (
  <>
    {steps.map((s, i) => (
      <Reveal
        key={i}
        scene={scene}
        r={s.r}
        p={ease((frame - s.at) / (s.dur ?? 12))}
        dir={s.dir ?? "down"}
        soft={s.soft}
        dx={s.dx}
        dy={s.dy}
        cam={cam}
      />
    ))}
    {/* rede de seguranca: fecha qualquer sobra entre as faixas */}
    <Art
      scene={scene}
      cam={cam}
      style={{ opacity: ease((frame - fillAt) / 14) }}
    />
  </>
);
