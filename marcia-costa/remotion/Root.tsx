import { Composition } from "remotion";

import {
  AvaliacoesReel,
  avaliacoesReelSchema,
} from "./compositions/AvaliacoesReel";
import { avaliacoes } from "../data/avaliacoes";

/**
 * Composições do projeto. Abra com `npm run remotion` para editar no Studio,
 * e renderize com `npm run remotion:render` quando quiser um MP4 da peça
 * (para Instagram, por exemplo).
 *
 * A duração é calculada a partir dos dados: cada avaliação ocupa 110 frames.
 * Nada de número de frames escrito à mão dentro do componente.
 */

const FRAMES_POR_CARTAO = 110;

const entrada = avaliacoes.map((avaliacao) => ({
  nome: avaliacao.nome,
  nota: avaliacao.nota,
  texto: avaliacao.texto,
  origem: avaliacao.origem,
}));

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AvaliacoesReel"
      component={AvaliacoesReel}
      schema={avaliacoesReelSchema}
      durationInFrames={Math.max(entrada.length, 1) * FRAMES_POR_CARTAO}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{
        avaliacoes: entrada,
        framesPorCartao: FRAMES_POR_CARTAO,
      }}
    />
  );
};
