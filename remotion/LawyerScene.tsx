import React from 'react';
import { Img, useCurrentFrame } from 'remotion';
import { BEAT } from './constants';
import { FONTE } from './personagem';

/**
 * Advogado estático.
 *
 * O personagem agora é apenas uma imagem fixa: sem movimento de mão, braço,
 * gravata, cabeça, torso, escala, blur ou parallax. O Remotion continua
 * animando somente as demais partes da experiência (maleta, papel, caneta,
 * assinatura e transições posteriores).
 */
export const LawyerScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Mantém a imagem fixa durante a introdução e a entrada da maleta. Quando a
  // câmera passa a fechar no documento, retiramos o personagem de uma vez para
  // ele não competir visualmente com o papel. Não existe interpolação/motion no
  // homem em nenhum momento.
  if (frame >= BEAT.aproximacao.from) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'end center',
        overflow: 'hidden',
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
        }}
      />

      <div
        style={{
          position: 'relative',
          width: 620,
          height: 1000,
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
    </div>
  );
};
