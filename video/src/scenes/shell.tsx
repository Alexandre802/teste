import type { FC, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { BackdropDark, BackdropLight } from "../components/Backdrop";
import { SfxTrack } from "../components/SfxTrack";
import { useExit } from "../components/anim";
import { SCENES, type SceneConfig } from "../config/scenes";

/** Base comum: fundo, saída suave e trilha de efeitos sonoros da cena. */
export const SceneShell: FC<{ cfg: SceneConfig; dark?: boolean; children: ReactNode }> = ({
  cfg,
  dark = false,
  children,
}) => {
  // A saída existe para dar profundidade ao cruzamento com a próxima cena.
  // Na última não há cruzamento nenhum: aplicá-la faria o reel terminar
  // esmaecido e encolhido sobre o fundo.
  const isLast = SCENES[SCENES.length - 1]?.id === cfg.id;
  const exit = useExit(isLast ? Number.MAX_SAFE_INTEGER : cfg.durationInFrames);
  return (
    <AbsoluteFill>
      {dark ? (
        <BackdropDark duration={cfg.durationInFrames} />
      ) : (
        <BackdropLight duration={cfg.durationInFrames} />
      )}
      <AbsoluteFill style={exit}>{children}</AbsoluteFill>
      <SfxTrack cues={cfg.sfx} />
    </AbsoluteFill>
  );
};
