/**
 * <L> posiciona um sprite recortado da arte original exatamente onde ele
 * estava, e aplica a animacao por cima. Como cada camada e um PNG com alpha
 * e o fundo foi reconstruido, mover uma peca nao deixa rastro.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { LAYERS, type LayerBox } from "../layers.gen";
import type { SceneId } from "../config";
import type { Enter } from "./anim";

const cache = new Map<string, Map<string, LayerBox>>();

export const box = (scene: SceneId, name: string): LayerBox => {
  let m = cache.get(scene);
  if (!m) {
    m = new Map(LAYERS[scene].map((l) => [l.name, l]));
    cache.set(scene, m);
  }
  const b = m.get(name);
  if (!b) throw new Error(`camada inexistente: ${scene}/${name}`);
  return b;
};

/** Nomes das camadas de um grupo (ex.: "h1" -> h1w1, h1w2...), em ordem. */
export const words = (scene: SceneId, prefix: string): string[] =>
  LAYERS[scene]
    .map((l) => l.name)
    .filter((n) => new RegExp(`^${prefix}w\\d+$`).test(n))
    .sort(
      (a, b) =>
        Number(a.match(/\d+$/)![0]) - Number(b.match(/\d+$/)![0])
    );

export const src = (scene: SceneId, name: string) =>
  staticFile(`layers/${scene}/${name}.png`);

type Props = {
  scene: SceneId;
  name: string;
  /** Preset de entrada ja resolvido para este quadro. */
  a?: Enter;
  /** Transform extra aplicado depois do preset (flutuacao, paralaxe...). */
  extra?: string;
  /** Origem da transformacao, relativa ao proprio sprite. */
  origin?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export const L: React.FC<Props> = ({
  scene,
  name,
  a,
  extra,
  origin = "center center",
  style,
  children,
}) => {
  const b = box(scene, name);
  if (a && a.opacity <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: b.x,
        top: b.y,
        width: b.w,
        height: b.h,
        transformOrigin: origin,
        willChange: "transform, opacity, filter",
        opacity: a?.opacity ?? 1,
        transform: [a?.transform, extra].filter(Boolean).join(" ") || undefined,
        filter: a?.filter,
        ...style,
      }}
    >
      <Img
        src={src(scene, name)}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {children}
    </div>
  );
};

/** Placa de fundo da cena (a arte com todas as pecas removidas). */
export const Plate: React.FC<{ scene: SceneId; zoom: number; extra?: string }> = ({
  scene,
  zoom,
  extra,
}) => (
  <AbsoluteFill>
    <Img
      src={staticFile(`layers/${scene}/bg.jpg`)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${zoom}) ${extra ?? ""}`,
        transformOrigin: "center center",
      }}
    />
  </AbsoluteFill>
);

/** Recorta o conteudo a um retangulo da cena (telas de app, cards). */
export const Clip: React.FC<{
  rect: [number, number, number, number]; // x, y, w, h
  radius?: number;
  children: React.ReactNode;
}> = ({ rect, radius = 0, children }) => {
  const [x, y, w, h] = rect;
  return (
    <AbsoluteFill
      style={{
        clipPath: `inset(${y}px ${1080 - (x + w)}px ${1920 - (y + h)}px ${x}px round ${radius}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
