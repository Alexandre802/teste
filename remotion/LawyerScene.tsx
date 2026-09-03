import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import { BEAT } from './constants';

/**
 * O personagem.
 *
 * O asset é um recorte único, então o giro do corpo não pode ser um
 * `rotate()` na imagem inteira — isso lê como carta virando. Aqui a mesma
 * fotografia é desenhada três vezes, cada cópia revelada por uma máscara em
 * gradiente (cabeça/ombros, torso, braço e pasta) e girada com um fator
 * próprio sobre um `transform-origin` próprio. As bordas das máscaras são
 * suaves justamente para que a diferença de velocidade entre as camadas não
 * apareça como emenda.
 */

const FONTE = '/advocacia-premium/advogado.webp';

type Camada = {
  chave: string;
  /** máscara vertical que isola a região do corpo */
  mask: string;
  /** quanto desta camada acompanha o giro (1 = mais solta, à frente) */
  fator: number;
  origem: string;
  /** deslocamento lateral extra, em px da composição */
  deriva: number;
};

const CAMADAS: Camada[] = [
  {
    chave: 'cabeca',
    mask: 'linear-gradient(to bottom, #000 0%, #000 20%, transparent 33%)',
    fator: 1,
    origem: '52% 18%',
    deriva: 10,
  },
  {
    chave: 'torso',
    mask:
      'linear-gradient(to bottom, transparent 14%, #000 27%, #000 60%, transparent 73%)',
    fator: 0.68,
    origem: '50% 45%',
    deriva: 4,
  },
  {
    chave: 'braco-pasta',
    mask: 'linear-gradient(to bottom, transparent 54%, #000 67%, #000 100%)',
    fator: 0.4,
    origem: '46% 78%',
    deriva: -6,
  },
];

export const LawyerScene: React.FC = () => {
  const frame = useCurrentFrame();

  // surge do escuro
  const entrada = interpolate(frame, [BEAT.entrada.from, BEAT.entrada.to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const escalaEntrada = interpolate(frame, [0, BEAT.entrada.to], [1.03, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // giro do corpo — ângulo base, que cada camada consome em proporção diferente
  const giro = interpolate(frame, [BEAT.giro.from, BEAT.giro.to], [0, 13], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // a partir da aproximação o personagem cede o quadro ao documento
  const saida = interpolate(
    frame,
    [BEAT.aproximacao.from, BEAT.aproximacao.to],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const opacidade = entrada * (1 - saida * 0.92);
  const desfoque = saida * 9;
  const escalaSaida = 1 + saida * 0.14;
  const subida = saida * -34;

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
        transform: `translateY(${subida}px) scale(${escalaEntrada * escalaSaida})`,
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
          opacity: entrada,
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
        {CAMADAS.map((camada) => (
          <div
            key={camada.chave}
            style={{
              position: 'absolute',
              inset: 0,
              transform: `rotateY(${giro * camada.fator}deg) translateX(${
                (giro / 13) * camada.deriva
              }px)`,
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
      </div>
    </div>
  );
};
