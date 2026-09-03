import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BEAT } from './constants';

/**
 * A pasta de couro.
 *
 * Ela é desenhada, não fotografada: a pasta do recorte é uma imagem fechada e
 * plana, que não abre. A peça desenhada nasce pequena e apagada sobre a região
 * onde a pasta aparece na foto, vem à frente e só então abre — quando cresce o
 * bastante para revelar a diferença, a fotográfica já saiu de cena.
 *
 * `parte` existe para o documento poder subir ENTRE o fundo e a aba da frente.
 * As duas partes leem a mesma geometria, então continuam encaixadas.
 */

const CENTRO_X = 960;
const CENTRO_Y = 712;
const LARGURA = 430;
const ALTURA = 296;

export const PortfolioCase: React.FC<{ parte: 'fundo' | 'frente' }> = ({ parte }) => {
  const frame = useCurrentFrame();

  // A opacidade sobe tarde e rápido de propósito. Enquanto a peça desenhada
  // está semitransparente ela se sobrepõe à pasta da fotografia e lê como uma
  // laje de vidro; encurtar essa janela faz a troca passar despercebida.
  const surgimento = interpolate(
    frame,
    [BEAT.pasta.from + 14, BEAT.pasta.from + 27],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // vem da posição da pasta fotografada para o centro do quadro
  const avanco = interpolate(frame, [BEAT.pasta.from, BEAT.pasta.from + 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const x = interpolate(avanco, [0, 1], [1062, CENTRO_X]);
  const y = interpolate(avanco, [0, 1], [792, CENTRO_Y]);
  const escala = interpolate(avanco, [0, 1], [0.52, 1]);

  // abertura da tampa
  const abertura = interpolate(frame, [BEAT.pasta.from + 22, BEAT.pasta.to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const anguloTampa = interpolate(abertura, [0, 1], [-2, -116]);

  // sai junto com o advogado quando a câmera fecha no documento
  const saida = interpolate(
    frame,
    [BEAT.aproximacao.from, BEAT.aproximacao.from + 22],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const opacidade = surgimento * (1 - saida);
  if (opacidade <= 0.003) return null;

  const couro =
    'linear-gradient(158deg, #1b2732 0%, #10181f 46%, #070b0e 100%)';

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
        transform: `scale(${escala}) translateY(${saida * 26}px)`,
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
          {/* tampa, articulada na borda de cima */}
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
            {/* forro interno, visível quando a tampa passa da vertical */}
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

          {/* corpo da pasta */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: couro,
              borderRadius: '4px 4px 12px 12px',
              border: '1px solid rgba(184,155,97,0.16)',
              // o fio claro no topo separa o couro escuro do fundo escuro
              boxShadow:
                'inset 0 1px 0 rgba(210,191,146,0.30), inset 0 18px 34px rgba(0,0,0,0.62)',
            }}
          />
        </>
      ) : (
        <>
          {/* aba da frente: passa por cima do papel que sobe */}
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
          {/* fio dourado — único detalhe metálico da peça */}
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
