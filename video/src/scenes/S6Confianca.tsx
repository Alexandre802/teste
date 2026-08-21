import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ArtBuild, plateSrc } from '../components/ArtBuild';
import { beat, fade, fadeOut, pulse } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 20–27s — CONFIANÇA.
 *
 * A arte entrega a caixa protegida, os quatro selos, o fluxo até ENTREGUE e
 * as estrelas. A composição se remonta por faixas — frase, caixa, fluxo — e
 * o que se acrescenta é só luz: a estrutura respirando ao redor da caixa e as
 * estrelas acendendo uma a uma.
 *
 * Antes eu desenhava retângulos de realce sobre os selos; dois deles caíam em
 * cima do papelão e apareciam como caixas vazias no meio da cena.
 */

/** Centros das cinco estrelas da arte, no espaço 3840×1280. */
const ESTRELAS = [3060, 3165, 3270, 3375, 3470];

export const S6Confianca: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);
  const glow = pulse(frame, 2);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <ArtBuild
        src={plateSrc('s6_confianca.png')}
        duration={duration}
        push={[1.0, 1.035]}
        bands={[
          { from: 0.33, to: 0.62, at: beat(0), dir: 0 },    // a caixa protegida
          { from: 0.00, to: 0.33, at: beat(1.5), dir: -1 }, // a frase e os selos da esquerda
          { from: 0.62, to: 1.00, at: beat(3), dir: 1 },    // os selos da direita e o fluxo
        ]}
      >
        {/* a estrutura digital respirando: luz aditiva, nunca um contorno */}
        <AbsoluteFill
          style={{
            background:
              `radial-gradient(circle 460px at 49% 50%, ` +
              `${theme.cyan}${Math.round(18 + glow * 26).toString(16).padStart(2, '0')} 0%, transparent 68%)`,
            mixBlendMode: 'screen',
            opacity: fade(frame, beat(0.5), 1),
          }}
        />

        {/* as estrelas da arte acendem uma a uma, por trás */}
        {ESTRELAS.map((x, i) => {
          const at = beat(8.5 + i * 0.25);
          return (
            <div
              key={x}
              style={{
                position: 'absolute', left: x, top: 1014,
                width: 96, height: 96, borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${theme.amber}bb 0%, transparent 66%)`,
                opacity: fade(frame, at, 0.25) * 0.8,
                mixBlendMode: 'screen',
              }}
            />
          );
        })}
      </ArtBuild>
    </AbsoluteFill>
  );
};
