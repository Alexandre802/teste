import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import { BEAT } from './constants';
import { FONTE, MASCARAS, POSE_GRAVATA } from './personagem';

/**
 * O personagem.
 *
 * A fotografia é um recorte único, então o movimento do corpo não pode ser um
 * `rotate` na imagem inteira — isso lê como carta virando. A mesma imagem é
 * desenhada em camadas, cada uma revelada por uma máscara em gradiente e
 * movida com amplitude própria. A mão anda mais que o torso, o torso mais que
 * a cabeça: é essa diferença que produz profundidade.
 *
 * A camada da mão só é desenhada com `POSE_GRAVATA` ligado — ver personagem.ts
 * para o porquê e para como ativar.
 */

export const LawyerScene: React.FC = () => {
  const frame = useCurrentFrame();

  const presa = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

  // ── entrada ───────────────────────────────────────────────────────────
  const entrada = interpolate(
    frame,
    [BEAT.entrada.from, BEAT.entrada.to],
    [0, 1],
    presa,
  );
  const escalaEntrada = interpolate(frame, [0, BEAT.entrada.to], [1.025, 1], presa);

  // ── o gesto ───────────────────────────────────────────────────────────
  // ida, volta e retorno ao centro — três trechos, não um vaivém contínuo,
  // para o movimento ter o peso de quem alinha algo e não de um pêndulo
  const chaves = [BEAT.gravata.from, 45, 65, BEAT.gravata.to];

  const maoX = interpolate(frame, chaves, [0, -8, 7, 0], presa);
  const maoY = interpolate(frame, chaves, [0, -3, 1, 0], presa);
  const maoGiro = interpolate(frame, chaves, [0, -2, 2, 0], presa);

  // o nó responde com um terço da amplitude: acompanha, não imita
  const noX = interpolate(frame, chaves, [0, -2, 2, 0], presa);
  const noGiro = interpolate(frame, chaves, [0, -1.5, 1.5, 0], presa);
  const noEscala = interpolate(
    frame,
    [BEAT.gravata.from, 49, BEAT.gravata.to],
    [1, 1.008, 1],
    presa,
  );

  // cabeça e torso voltam ao eixo durante a transição para a pasta
  const giroCabeca = interpolate(
    frame,
    [BEAT.gravata.from, BEAT.gravata.to, BEAT.transicaoPasta.to],
    [0, 1.5, 0],
    presa,
  );
  const giroTorso = interpolate(
    frame,
    [BEAT.gravata.from, BEAT.gravata.to, BEAT.transicaoPasta.to],
    [0, 2.5, 0],
    presa,
  );

  // ── cede o foco à pasta ───────────────────────────────────────────────
  // perde cerca de 10% de presença: recua um pouco e escurece
  const cedeFoco = interpolate(
    frame,
    [BEAT.transicaoPasta.from, BEAT.transicaoPasta.to],
    [0, 1],
    presa,
  );

  // ── sai de quadro quando a câmera fecha no documento ──────────────────
  const saida = interpolate(
    frame,
    [BEAT.aproximacao.from, BEAT.aproximacao.to],
    [0, 1],
    presa,
  );

  const opacidade = entrada * (1 - cedeFoco * 0.1) * (1 - saida * 0.92);
  const desfoque = saida * 9;
  const escala = escalaEntrada * (1 - cedeFoco * 0.02) * (1 + saida * 0.14);

  const camadas = [
    { chave: 'torso', mask: MASCARAS.torso, giro: giroTorso, origem: '50% 45%' },
    { chave: 'braco', mask: MASCARAS.braco, giro: giroTorso * 0.6, origem: '46% 78%' },
    { chave: 'cabeca', mask: MASCARAS.cabeca, giro: giroCabeca, origem: '52% 18%' },
  ];

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
        transform: `translateY(${saida * -34}px) scale(${escala})`,
        transformOrigin: '50% 78%',
        willChange: 'transform, opacity, filter',
      }}
    >
      {/* luz atrás do personagem: separa a silhueta escura do fundo escuro */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 40,
          width: 1180,
          height: 820,
          transform: 'translateX(-50%)',
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(30,58,78,0.62) 0%, rgba(17,29,40,0.28) 45%, transparent 72%)',
          opacity: entrada * (1 - cedeFoco * 0.25),
        }}
      />

      <div
        style={{
          position: 'relative',
          width: 604,
          height: 1000,
          transformStyle: 'preserve-3d',
        }}
      >
        {camadas.map((camada) => (
          <div
            key={camada.chave}
            style={{
              position: 'absolute',
              inset: 0,
              transform: `rotateY(${camada.giro}deg)`,
              transformOrigin: camada.origem,
              WebkitMaskImage: camada.mask,
              maskImage: camada.mask,
              willChange: 'transform',
            }}
          >
            <Img
              src={FONTE}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'bottom center',
              }}
            />
          </div>
        ))}

        {/* o nó da gravata, numa cópia própria para poder assentar sozinho */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${noX}px, ${noX * 0.3}px) rotate(${noGiro}deg) scale(${noEscala})`,
            transformOrigin: '54% 31%',
            WebkitMaskImage: MASCARAS.no,
            maskImage: MASCARAS.no,
            willChange: 'transform',
          }}
        >
          <Img
            src={FONTE}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom center',
            }}
          />
        </div>

        {/* a mão sobre o nó — só com o asset da pose (ver personagem.ts) */}
        {POSE_GRAVATA ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translate(${maoX}px, ${maoY}px) rotate(${maoGiro}deg)`,
              transformOrigin: '54% 34%',
              WebkitMaskImage: MASCARAS.noHorizontal,
              maskImage: MASCARAS.noHorizontal,
              willChange: 'transform',
            }}
          >
            <Img
              src={FONTE}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'bottom center',
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
