import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

/**
 * As palavras que atravessam a sequência.
 *
 * Entram e saem por opacidade, desfoque e um deslocamento vertical curto —
 * nada que dispute atenção com a cena. Ficam atrás do documento (ver a ordem
 * em LawyerSequence) para funcionarem como legenda de fundo, não como título.
 */
export const SceneCaption: React.FC<{
  texto: string;
  entra: [number, number];
  sai: [number, number];
  variante?: 'rotulo' | 'frase';
  /** 'base' assenta a legenda no rodapé do quadro, livre do documento */
  ancora?: 'centro' | 'base';
}> = ({ texto, entra, sai, variante = 'rotulo', ancora = 'centro' }) => {
  const frame = useCurrentFrame();

  const visivel = interpolate(
    frame,
    [entra[0], entra[1], sai[0], sai[1]],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  if (visivel <= 0.002) return null;

  const deslocamento = interpolate(visivel, [0, 1], [14, 0]);
  const desfoque = interpolate(visivel, [0, 1], [7, 0]);

  const frase = variante === 'frase';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        // 'centro' assenta no terço superior: no meio exato a legenda cai
        // sobre o terno escuro do personagem e some
        placeItems: ancora === 'base' ? 'end center' : 'start center',
        paddingTop: ancora === 'base' ? 0 : 132,
        paddingBottom: ancora === 'base' ? 60 : 0,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          transform: `translateY(${deslocamento}px)`,
          opacity: visivel,
          filter: `blur(${desfoque}px)`,
          textAlign: 'center',
          color: frase ? 'rgba(244,243,239,0.92)' : 'rgba(244,243,239,0.34)',
          fontFamily: frase
            ? '"Cormorant Garamond", Georgia, serif'
            : 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: frase ? 26 : 15,
          fontWeight: frase ? 300 : 500,
          letterSpacing: frase ? '-0.01em' : '0.52em',
          textTransform: frase ? 'none' : 'uppercase',
          textIndent: frase ? 0 : '0.52em',
        }}
      >
        {texto}
      </div>
    </div>
  );
};
