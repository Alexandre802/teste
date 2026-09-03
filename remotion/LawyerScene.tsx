import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import { BEAT } from './constants';
import { FONTE, MASCARAS, POSE_GRAVATA } from './personagem';

/**
 * Cena do advogado baseada no vídeo de referência enviado.
 *
 * O corpo permanece praticamente imóvel. O gesto acontece principalmente na
 * mão que segura o nó, com o antebraço acompanhando pouco e o próprio nó da
 * gravata reagindo ainda menos. A mão vai para a esquerda, para a direita e
 * volta ao centro antes da sequência da pasta começar.
 */
export const LawyerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const presa = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

  const entrada = interpolate(
    frame,
    [BEAT.entrada.from, BEAT.entrada.to],
    [0, 1],
    presa,
  );
  const escalaEntrada = interpolate(
    frame,
    [BEAT.entrada.from, BEAT.entrada.to],
    [1.018, 1],
    presa,
  );

  // Movimento inspirado no vídeo: curto, controlado e sem balanço exagerado.
  // 20 -> 45: leva o nó levemente para a esquerda
  // 45 -> 72: corrige para a direita
  // 72 -> 96: retorna ao centro e assenta
  const chaves = [BEAT.gravata.from, 45, 72, BEAT.gravata.to];

  const maoX = interpolate(frame, chaves, [0, -6, 5, 0], presa);
  const maoY = interpolate(frame, chaves, [0, -1.5, 0.8, 0], presa);
  const maoGiro = interpolate(frame, chaves, [0, -0.9, 0.8, 0], presa);

  // O antebraço acompanha o punho, mas com amplitude bem menor para preservar
  // a sensação de braço conectado ao ombro.
  const bracoX = maoX * 0.34;
  const bracoY = maoY * 0.32;
  const bracoGiro = maoGiro * 0.42;

  // O nó reage sutilmente ao ajuste, como no vídeo.
  const noX = interpolate(frame, chaves, [0, -1.8, 1.5, 0], presa);
  const noY = interpolate(frame, chaves, [0, -0.6, 0.35, 0], presa);
  const noGiro = interpolate(frame, chaves, [0, -0.55, 0.5, 0], presa);
  const noEscala = interpolate(
    frame,
    [BEAT.gravata.from, 56, BEAT.gravata.to],
    [1, 1.006, 1],
    presa,
  );

  // Reação mínima de corpo e cabeça. O vídeo mantém o personagem quase parado,
  // então a amplitude é deliberadamente pequena.
  const giroCabeca = interpolate(
    frame,
    [BEAT.gravata.from, 52, BEAT.gravata.to, BEAT.transicaoPasta.to],
    [0, 0.28, 0, 0],
    presa,
  );
  const giroTorso = interpolate(
    frame,
    [BEAT.gravata.from, 55, BEAT.gravata.to, BEAT.transicaoPasta.to],
    [0, 0.5, 0, 0],
    presa,
  );

  // Pequeno assentamento final depois que a mão volta ao centro.
  const assentamento = interpolate(
    frame,
    [BEAT.gravata.to - 10, BEAT.gravata.to],
    [0, 1],
    presa,
  );

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

  const opacidade = entrada * (1 - cedeFoco * 0.22) * (1 - saida * 0.95);
  const desfoque = saida * 8;
  const escala =
    escalaEntrada *
    (1 - assentamento * 0.004) *
    (1 - cedeFoco * 0.025) *
    (1 + saida * 0.1);
  const recuoY = cedeFoco * 8 + saida * -28;

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
          bottom: 34,
          width: 1160,
          height: 840,
          transform: 'translateX(-50%)',
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(30,58,78,0.56) 0%, rgba(17,29,40,0.22) 46%, transparent 73%)',
          opacity: entrada * (1 - cedeFoco * 0.34),
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
        {/* Torso sem a região central da mão, para evitar uma cópia fantasma. */}
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

        {/* Antebraço acompanha a mão de forma suave. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${bracoX}px, ${bracoY}px) rotate(${bracoGiro}deg)`,
            transformOrigin: '37% 46%',
            WebkitMaskImage: MASCARAS.braco,
            maskImage: MASCARAS.braco,
            willChange: 'transform',
          }}
        >
          <Img src={FONTE} alt="" style={foto} />
        </div>

        {/* Cabeça praticamente estática, como na referência. */}
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

        {/* Nó da gravata acompanha o gesto alguns pixels. */}
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

        {/* Mão: esquerda -> direita -> centro. */}
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
