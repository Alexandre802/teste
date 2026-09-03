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

  // Nos últimos frames tudo se apaga, menos o fundo. Como a seção seguinte
  // (ProcessWords) começa no mesmo #030405, não há corte perceptível entre a
  // sequência e a primeira palavra — era isso que a transição branca fazia,
  // e mal.
  const apagamento = interpolate(
    frame,
    [BEAT.final.from + 1, BEAT.final.to],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

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
          opacity: interpolate(assentamento, [0, 1], [0, 1]) * apagamento,
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

      {/*
        Uma legenda só, discreta, e fora do beat do gesto. As três anteriores
        (Análise / Estratégia / Orientação) disputavam atenção justamente
        enquanto a mão trabalhava; as palavras grandes agora ficam por conta
        do ProcessWords, depois da sequência.
      */}
      <AbsoluteFill style={{ zIndex: 5 }}>
        <SceneCaption
          texto="Orientação"
          entra={[BEAT.papel.from, BEAT.papel.from + 14]}
          sai={[BEAT.aproximacao.from, BEAT.aproximacao.from + 12]}
        />
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

      <AbsoluteFill style={{ zIndex: 8, opacity: apagamento }}>
        <SceneCaption
          texto="Clareza para decisões importantes."
          entra={[BEAT.assinatura.to - 8, BEAT.final.from]}
          sai={[BEAT.final.to + 60, BEAT.final.to + 61]}
          variante="frase"
          ancora="base"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
