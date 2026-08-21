/**
 * Efeitos sonoros. O video nao tem narracao - so a camada de SFX.
 * <Sfx at={f} name="pop_ui" /> dispara o efeito no quadro f da cena.
 */
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { SFX_GAIN } from "../config";

export type SfxName = keyof typeof SFX_GAIN;

export const Sfx: React.FC<{
  at: number;
  name: SfxName;
  /** Multiplicador sobre o ganho padrao do efeito. */
  gain?: number;
  /** Corta o efeito depois de N quadros (evita cauda longa demais). */
  cut?: number;
}> = ({ at, name, gain = 1, cut }) => (
  <Sequence from={at} durationInFrames={cut ?? 120} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={(SFX_GAIN[name] ?? 0.3) * gain} />
  </Sequence>
);

/** Dispara o mesmo efeito em varios quadros (entradas em cascata). */
export const SfxEach: React.FC<{
  at: number[];
  name: SfxName;
  gain?: number;
}> = ({ at, name, gain }) => (
  <>
    {at.map((f, i) => (
      <Sfx key={`${name}-${i}-${f}`} at={f} name={name} gain={gain} />
    ))}
  </>
);
