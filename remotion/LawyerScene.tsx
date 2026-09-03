import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import { BEAT } from './constants';
import { FONTE, MASCARAS, POSE_GRAVATA } from './personagem';

/**
 * Cena do advogado.
 *
 * A nova fotografia já começa com a mão sobre o nó da gravata. O gesto é
 * construído em camadas: torso quase imóvel, antebraço acompanhando com pouca
 * amplitude, mão fazendo o trajeto esquerda -> direita -> centro e o nó da
 * gravata respondendo alguns pixels. Assim o scroll realmente comunica um
 * ajuste de gravata, em vez de mover a fotografia inteira.
 */
export const LawyerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const presa = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

  // entrada do personagem
  const entrada = interpolate(frame, [BEAT.entrada.from, BEAT.entrada.to], [0, 1], presa);
  const escalaEntrada = interpolate(frame, [BEAT.entrada.from, BEAT.entrada.to], [1.025, 1], presa);

  // gesto em três tempos: esquerda, direita e volta exatamente para o centro
  const chaves = [BEAT.gravata.from, 43, 63, BEAT.gravata.to];
  const maoX = interpolate(frame, chaves, [0, -14, 12, 0], presa);
  const maoY = interpolate(frame, chaves, [0, -2, 1.5, 0], presa);
  const maoGiro = interpolate(frame, chaves, [0, -2.2, 2, 0], presa);

  // o antebraço acompanha menos que a mão: mantém o punho conectado ao corpo
  const bracoX = maoX * 0.34;
  const bracoY = maoY * 0.28;
  const bracoGiro = maoGiro * 0.42;

  // o nó reage, mas com amplitude bem menor
  const noX = interpolate(frame, chaves, [0, -3.2, 2.8, 0], presa);
  const noY = interpolate(frame, chaves, [0, -1, 0.6, 0], presa);
  const noGiro = interpolate(frame, chaves, [0, -1.2, 1.15, 0], presa);
  const noEscala = interpolate(frame, [BEAT.gravata.from, 51, BEAT.gravata.to], [1, 1.012, 1], presa);

  // micro reação corporal para o gesto não parecer uma mão solta
  const giroCabeca = interpolate(
    frame,
    [BEAT.gravata.from, 46, BEAT.gravata.to, BEAT.transicaoPasta.to],
    [0, 0.8, 0.25, 0],
    presa,
  );
  const giroTorso = interpolate(
    frame,
    [BEAT.gravata.from, 48, BEAT.gravata.to, BEAT.transicaoPasta.to],
    [0, 1.45, 0.35, 0],
    presa,
  );

  // depois que a mão volta ao centro, o homem cede espaço para a sequência da pasta
  const cedeFoco = interpolate(
    frame,
    [BEAT.transicaoPasta.from, BEAT.transicaoPasta.to],
    [0, 1],
    presa,
  );

  const saida = interpolate(
    frame,
    [BEAT.aproximacao.from, BEAT.aproximacao.to],
    [0, 1],
    presa,
  );

  const opacidade = entrada * (1 - cedeFoco * 0.18) * (1 - saida * 0.94);
  const desfoque = saida * 9;
  const escala = escalaEntrada * (1 - cedeFoco * 0.025) * (1 + saida * 0.12);
  const recuoY = cedeFoco * 9 + saida * -30;

  const foto = {
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
    objectPosition: 'bottom center',
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'end center',
        perspective: 1500,
        opacity: opacidade,
        filter: desfoque > 0.05 ? `blur(${desfoque}px)` : undefined,
        transform: `translateY(${recuoY}px) scale(${escala})`,
        transformOrigin: '50% 78%',
        willChange: 'transform, opacity, filter',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 35,
          width: 1160,
          height: 840,
          transform: 'translateX(-50%)',
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(30,58,78,0.58) 0%, rgba(17,29,40,0.24) 46%, transparent 73%)',
          opacity: entrada * (1 - cedeFoco * 0.32),
        }}
      />

      <div
        style={{
          position: 'relative',
          width: 620,
          height: 1000,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* torso: a pequena área da mão é vazada para a cópia móvel não duplicar a mão */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `rotateY(${giroTorso}deg)`,
            transformOrigin: '50% 48%',
            WebkitMaskImage: MASCARAS.torso,
            maskImage: MASCARAS.torso,
            willChange: 'transform',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              WebkitMaskImage: MASCARAS.recorteMao,
              maskImage: MASCARAS.recorteMao,
            }}
          >
            <Img src={FONTE} alt="" style={foto} />
          </div>
        </div>

        {/* braço acompanha o gesto com cerca de um terço da amplitude */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${bracoX}px, ${bracoY}px) rotate(${bracoGiro}deg)`,
            transformOrigin: '39% 49%',
            WebkitMaskImage: MASCARAS.braco,
            maskImage: MASCARAS.braco,
            willChange: 'transform',
          }}
        >
          <Img src={FONTE} alt="" style={foto} />
        </div>

        {/* cabeça quase imóvel, apenas reagindo ao ajuste */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `rotateY(${giroCabeca}deg)`,
            transformOrigin: '50% 19%',
            WebkitMaskImage: MASCARAS.cabeca,
            maskImage: MASCARAS.cabeca,
            willChange: 'transform',
          }}
        >
          <Img src={FONTE} alt="" style={foto} />
        </div>

        {/* nó da gravata reage alguns pixels ao movimento da mão */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${noX}px, ${noY}px) rotate(${noGiro}deg) scale(${noEscala})`,
            transformOrigin: '50.5% 34.5%',
            WebkitMaskImage: MASCARAS.no,
            maskImage: MASCARAS.no,
            willChange: 'transform',
          }}
        >
          <Img src={FONTE} alt="" style={foto} />
        </div>

        {/* mão: esquerda -> direita -> centro, encerrando o gesto antes da pasta */}
        {POSE_GRAVATA ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translate(${maoX}px, ${maoY}px) rotate(${maoGiro}deg)`,
              transformOrigin: '50.5% 39%',
              WebkitMaskImage: MASCARAS.mao,
              maskImage: MASCARAS.mao,
              willChange: 'transform',
            }}
          >
            <Img src={FONTE} alt="" style={foto} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
