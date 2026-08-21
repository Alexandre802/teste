import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ArtBuild, plateSrc } from '../components/ArtBuild';
import { beat, fadeOut } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 16–20s — A GRANDE PROMESSA.
 *
 * A arte já traz o mapa, a rota e a caixa atravessando. Desenhar outra rota
 * por cima criava duas linhas e duas caixas no mesmo quadro — o que anima
 * aqui é a própria arte: o texto entra pela esquerda, o mapa pela direita, e
 * um brilho corre no sentido Goiânia → São Paulo.
 */
export const S5Promessa: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  // o brilho percorre o trecho do mapa, acompanhando a rota da arte
  const run = interpolate(frame, [beat(1.5), beat(5)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <ArtBuild
        src={plateSrc('s5_mapa.png')}
        duration={duration}
        push={[1.03, 1.0]}
        bands={[
          { from: 0.00, to: 0.46, at: beat(0), dir: -1 },   // FULL DE VERDADE
          { from: 0.46, to: 1.00, at: beat(1), dir: 1 },    // o mapa e a rota
        ]}
      >
        {run > 0 && run < 1 ? (
          <AbsoluteFill
            style={{
              background:
                `radial-gradient(ellipse 14% 40% at ${interpolate(run, [0, 1], [64, 92])}% 56%, ` +
                `${theme.cyanSoft}66 0%, transparent 70%)`,
              mixBlendMode: 'screen',
            }}
          />
        ) : null}
      </ArtBuild>
    </AbsoluteFill>
  );
};
