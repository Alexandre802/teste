import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Stage } from '../components/Stage';
import { TextBand } from '../components/TextBand';
import { KineticText, Sub } from '../components/Type';
import { beat, fadeOut } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 12–16s — URGÊNCIA. Da copy: "Pedido vendido → separado → enviado. A
 * interface começa a mostrar o prazo." Depois a frase e, rápido, "Carga
 * urgente. Operação diária."
 */
export const S4Urgencia: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Stage scene="s4" duration={duration} push="in" />

      <TextBand from={0.375} to={1.0} top={0.04} bottom={0.78} feather={5} />

      <AbsoluteFill
        style={{
          alignItems: 'flex-end', justifyContent: 'center',
          paddingRight: 170, paddingLeft: '38%', zIndex: 25,
        }}
      >
        <KineticText
          lines={['Quem vende mais', 'não pode esperar mais.']}
          start={beat(1)}
          size={182}
          align="right"
        />
        <div style={{ marginTop: 40 }}>
          <Sub start={beat(5)} align="right" size={58} color={theme.cyan}>
            Carga urgente. Operação diária.
          </Sub>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
