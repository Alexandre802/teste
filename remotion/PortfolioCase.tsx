import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BEAT } from './constants';

/**
 * Pasta de couro da segunda parte da sequência.
 *
 * Na nova abertura o advogado não segura pasta: ele ajusta a gravata. Por isso
 * a pasta não tenta mais nascer sobre um objeto existente na fotografia. Ela
 * entra como a próxima batida visual, subindo do centro inferior somente
 * depois que a mão termina o gesto e volta ao meio.
 */

const CENTRO_X = 960;
const CENTRO_Y = 712;
const LARGURA = 430;
const ALTURA = 296;

export const PortfolioCase: React.FC<{ parte: 'fundo' | 'frente' }> = ({ parte }) => {
  const frame = useCurrentFrame();
  const presa = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

  // só começa depois do ajuste da gravata ter terminado
  const surgimento = interpolate(
    frame,
    [BEAT.transicaoPasta.from + 5, BEAT.pasta.from + 4],
    [0, 1],
    presa,
  );

  // a pasta sobe do centro inferior e ganha escala, assumindo o foco da cena
  const avanco = interpolate(
    frame,
    [BEAT.transicaoPasta.from + 3, BEAT.pasta.from + 8],
    [0, 1],
    presa,
  );
  const x = CENTRO_X;
  const y = interpolate(avanco, [0, 1], [895, CENTRO_Y]);
  const escala = interpolate(avanco, [0, 1], [0.68, 1]);
  const inclinacaoEntrada = interpolate(avanco, [0, 1], [3.5, 0], presa);

  // abertura da tampa
  const abertura = interpolate(frame, [BEAT.pasta.from + 4, BEAT.pasta.to], [0, 1], presa);
  const anguloTampa = interpolate(abertura, [0, 1], [-2, -116]);

  // sai quando a câmera fecha no documento
  const saida = interpolate(
    frame,
    [BEAT.aproximacao.from, BEAT.aproximacao.from + 22],
    [0, 1],
    presa,
  );

  const opacidade = surgimento * (1 - saida);
  if (opacidade <= 0.003) return null;

  const couro = 'linear-gradient(158deg, #1b2732 0%, #10181f 46%, #070b0e 100%)';

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: LARGURA,
        height: ALTURA,
        marginLeft: -LARGURA / 2,
        marginTop: -ALTURA / 2,
        transform: `scale(${escala}) rotate(${inclinacaoEntrada}deg) translateY(${saida * 26}px)`,
        transformOrigin: '50% 60%',
        opacity: opacidade,
        filter: saida > 0.02 ? `blur(${saida * 7}px)` : undefined,
        perspective: 1250,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    >
      {parte === 'fundo' ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: couro,
              borderRadius: '10px 10px 4px 4px',
              border: '1px solid rgba(184,155,97,0.20)',
              transform: `rotateX(${anguloTampa}deg)`,
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              boxShadow: '0 26px 60px rgba(0,0,0,0.7)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 10,
                borderRadius: 6,
                background:
                  'linear-gradient(180deg, rgba(24,44,58,0.85) 0%, rgba(7,9,11,0.9) 100%)',
                transform: 'rotateX(180deg)',
                backfaceVisibility: 'hidden',
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: couro,
              borderRadius: '4px 4px 12px 12px',
              border: '1px solid rgba(184,155,97,0.16)',
              boxShadow:
                'inset 0 1px 0 rgba(210,191,146,0.30), inset 0 18px 34px rgba(0,0,0,0.62)',
            }}
          />
        </>
      ) : (
        <>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 132,
              background: couro,
              borderRadius: '2px 2px 12px 12px',
              borderTop: '1px solid rgba(184,155,97,0.30)',
              boxShadow: '0 -16px 34px rgba(0,0,0,0.55)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 58,
              width: 54,
              height: 1,
              marginLeft: -27,
              background: 'rgba(210,191,146,0.55)',
            }}
          />
        </>
      )}
    </div>
  );
};
