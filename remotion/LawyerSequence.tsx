import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BEAT, SCENE_BG } from './constants';
import { LawyerScene } from './LawyerScene';
import { PortfolioCase } from './PortfolioCase';
import { PaperDocument } from './PaperDocument';
import { SceneCaption } from './SceneCaption';

export type LawyerSequenceProps = {
  /** modo retrato: recorta as laterais e reenquadra para o celular */
  compact: boolean;
};

/**
 * Composição única da experiência — 240 frames a 30fps.
 *
 * A ordem dos filhos É a profundidade da cena: o documento sobe ENTRE o fundo
 * da pasta e a aba da frente, e só depois de sair passa à frente de tudo.
 */
export const LawyerSequence: React.FC<LawyerSequenceProps> = ({ compact = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // o quadro inteiro assenta com uma mola no primeiro segundo; é a única
  // parte da sequência em que a inércia física ajuda, o resto é interpolação
  // linear porque precisa casar exatamente com a posição de rolagem
  const assentamento = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.7 },
    durationInFrames: 26,
  });

  const luzFinal = interpolate(
    frame,
    [BEAT.assinatura.to - 10, BEAT.final.to],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const documentoNaFrente = frame >= BEAT.papel.to - 7;

  return (
    <AbsoluteFill style={{ background: SCENE_BG, overflow: 'hidden' }}>
      {/* iluminação azul muito escura, sem nada futurista */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(58% 46% at 50% 34%, rgba(24,44,58,0.5) 0%, transparent 70%)',
          opacity: 0.6 + luzFinal * 0.3,
        }}
      />

      <AbsoluteFill
        style={{
          transform: `scale(${interpolate(assentamento, [0, 1], [1.02, 1])})`,
          opacity: interpolate(assentamento, [0, 1], [0, 1]),
        }}
      >
        <AbsoluteFill style={{ zIndex: 1 }}>
          <LawyerScene />
        </AbsoluteFill>

        <AbsoluteFill style={{ zIndex: 2 }}>
          <PortfolioCase parte="fundo" />
        </AbsoluteFill>

        <AbsoluteFill style={{ zIndex: documentoNaFrente ? 6 : 3 }}>
          <PaperDocument compact={compact} />
        </AbsoluteFill>

        <AbsoluteFill style={{ zIndex: 4 }}>
          <PortfolioCase parte="frente" />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* legendas: atrás do documento enquanto ele domina o quadro */}
      <AbsoluteFill style={{ zIndex: 5 }}>
        <SceneCaption texto="Análise" entra={[10, 28]} sai={[60, 74]} />
        <SceneCaption texto="Estratégia" entra={[76, 92]} sai={[118, 132]} />
        <SceneCaption texto="Orientação" entra={[128, 144]} sai={[166, 178]} />
      </AbsoluteFill>

      {/* vinheta por cima de tudo, para fechar as bordas do quadro */}
      <AbsoluteFill
        style={{
          zIndex: 7,
          pointerEvents: 'none',
          background:
            'radial-gradient(112% 80% at 50% 46%, transparent 42%, rgba(3,4,5,0.78) 100%)',
        }}
      />

      <AbsoluteFill style={{ zIndex: 8 }}>
        <SceneCaption
          texto="Clareza para decisões importantes."
          entra={[BEAT.final.from - 3, BEAT.final.to]}
          sai={[BEAT.final.to + 60, BEAT.final.to + 61]}
          variante="frase"
          ancora="base"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
