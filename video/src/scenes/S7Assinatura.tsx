import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BoxField } from '../components/SceneFx';
import { Stage } from '../components/Stage';
import { TextBand } from '../components/TextBand';
import { KineticText, Sub } from '../components/Type';
import { beat, fade } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 27–30s — ASSINATURA SEM FINAL. Da copy: "Caixas continuam entrando e
 * saindo... e ao fundo surge novamente o fluxo de pedidos da primeira cena."
 *
 * Sem fade de saída: o último quadro entrega o movimento cheio para emendar
 * no primeiro.
 */
export const S7Assinatura: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Stage scene="s7" duration={duration} push="out" />

      {/* as caixas seguem atravessando: nada encerra */}
      <BoxField start={0} duration={duration} count={70} converge={false} />

      {/* os cards de pedido são os da arte; só a assinatura é animada */}
      <TextBand from={0.27} to={0.70} top={0.16} bottom={0.76} feather={6} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <KineticText lines={['Três Estrelas']} start={beat(0.5)} size={250} align="center" />
        <div style={{ marginTop: 34, opacity: fade(frame, beat(2), 0.6) }}>
          <Sub start={beat(2)} size={64} color={theme.white} weight={600} align="center">
            Logística para quem vende grande.
          </Sub>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
