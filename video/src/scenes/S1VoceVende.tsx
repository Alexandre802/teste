import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Bg } from '../components/Bg';
import { beat, fadeOut, pulse } from '../config/beat';
import { theme } from '../config/theme';

/** A arte é 3:1. */
const ART_ASPECT = 2172 / 724;

/**
 * 0–5s — VOCÊ VENDE. A GENTE FAZ CHEGAR.
 *
 * A arte-chave é a própria cena: Mercado Livre no meio, Shopee à esquerda,
 * Shein à direita, as notificações de novas compras dentro de cada tela, a
 * frase gigante ao lado e o logo pequeno.
 *
 * O movimento é de câmera. Começa fechado, atravessando os aparelhos, e
 * depois recua até a composição inteira caber no quadro — é o único jeito de
 * a frase aparecer legível num 9:16 sem cortar palavra no meio.
 */
export const S1VoceVende: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const out = fadeOut(frame, duration, 0.6);
  const glow = pulse(frame, 3);

  // largura da arte na tela: fechado (cobrindo a altura) → aberto (cabe inteira)
  const artW = interpolate(
    frame,
    [0, beat(3), beat(6), duration],
    [H * ART_ASPECT, H * ART_ASPECT * 0.92, W * 1.04, W * 1.0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  // ponto da arte que fica no centro do quadro
  const focal = interpolate(
    frame,
    [0, beat(3), beat(6), duration],
    [0.14, 0.34, 0.5, 0.5],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const artH = artW / ART_ASPECT;
  // quanto a câmera já recuou: 1 quando a arte inteira cabe no quadro
  const opened = interpolate(artW, [W * 1.05, W * 1.6], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: out, overflow: 'hidden', backgroundColor: theme.navy }}>
      {/* ambiente por trás, para a faixa não flutuar no vazio quando a câmera recua */}
      <AbsoluteFill style={{ opacity: opened }}>
        <Bg duration={duration} drift={14} trails={34} glowAt={[50, 48]} />
      </AbsoluteFill>

      <Img
        src={staticFile('plates/s1_phones.png')}
        style={{
          position: 'absolute',
          width: artW, height: artH,
          left: W / 2 - focal * artW,
          top: H / 2 - artH / 2,
          borderRadius: opened * 26,
          boxShadow: opened > 0.2 ? `0 40px 90px rgba(0,0,0,${opened * 0.55})` : undefined,
        }}
      />

      {/* reflexo no piso: ocupa o espaço que sobra quando a câmera recua */}
      {opened > 0.05 ? (
        <Img
          src={staticFile('plates/s1_phones.png')}
          style={{
            position: 'absolute',
            width: artW, height: artH,
            left: W / 2 - focal * artW,
            top: H / 2 + artH / 2 + 14,
            transform: 'scaleY(-1)',
            opacity: opened * 0.28,
            filter: 'blur(6px)',
            maskImage: 'linear-gradient(0deg, transparent 8%, #000 92%)',
            WebkitMaskImage: 'linear-gradient(0deg, transparent 8%, #000 92%)',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {/* brilho acompanhando a câmera, para o quadro nunca ficar chapado */}
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(ellipse 70% 40% at 50% 50%, ` +
            `${theme.cyan}${Math.round(8 + glow * 12).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 64% at 50% 50%, transparent 46%, ${theme.navy}aa 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
