import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ArtBuild, plateSrc } from '../components/ArtBuild';
import { BoxField } from '../components/SceneFx';
import { beat } from '../config/beat';

/**
 * 27–30s — ASSINATURA SEM FINAL. Da copy: "Caixas continuam entrando e
 * saindo... e ao fundo surge novamente o fluxo de pedidos da primeira cena."
 *
 * Os pedidos que voltam são os da própria arte, trazidos pela faixa da
 * esquerda — desenhar outros por cima duplicava cada cartão. Sem fade de
 * saída: o último quadro entrega o movimento cheio para emendar no primeiro.
 */
export const S7Assinatura: React.FC<{ duration: number }> = ({ duration }) => (
  <AbsoluteFill>
    <ArtBuild
      src={plateSrc('s7_assinatura.png')}
      duration={duration}
      push={[1.04, 1.0]}
      bands={[
        { from: 0.28, to: 0.68, at: beat(0), dir: 0 },    // TRÊS ESTRELAS
        { from: 0.68, to: 1.00, at: beat(1), dir: 1 },    // o pátio operando
        { from: 0.00, to: 0.28, at: beat(1.5), dir: -1 }, // o fluxo de pedidos volta
      ]}
    >
      {/* as caixas seguem atravessando: nada encerra */}
      <BoxField start={0} duration={duration} count={60} converge={false} />
    </ArtBuild>
  </AbsoluteFill>
);
