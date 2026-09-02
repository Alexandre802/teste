"use client";

import { Player } from "@remotion/player";
import { useMemo } from "react";

import { AvaliacoesReel } from "@/remotion/compositions/AvaliacoesReel";
import { avaliacoes } from "@/data/avaliacoes";

/**
 * O Player e a composição ficam neste arquivo sozinhos, e o arquivo inteiro é
 * carregado por import dinâmico. Assim o bundle do Remotion não viaja junto
 * com a home: ele só chega quando o visitante rola até as avaliações.
 */

const FRAMES_POR_CARTAO = 110;

export default function AvaliacoesPlayer({ tocando }: { tocando: boolean }) {
  const propsDaPeca = useMemo(
    () => ({
      avaliacoes: avaliacoes.map((item) => ({
        nome: item.nome,
        nota: item.nota,
        texto: item.texto,
        origem: item.origem,
      })),
      framesPorCartao: FRAMES_POR_CARTAO,
    }),
    [],
  );

  return (
    <Player
      component={AvaliacoesReel}
      inputProps={propsDaPeca}
      durationInFrames={Math.max(avaliacoes.length, 1) * FRAMES_POR_CARTAO}
      fps={30}
      compositionWidth={1080}
      compositionHeight={1080}
      style={{ width: "100%" }}
      loop
      autoPlay={tocando}
      acknowledgeRemotionLicense
    />
  );
}
