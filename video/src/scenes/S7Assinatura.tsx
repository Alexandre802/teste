import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BoxField } from '../components/SceneFx';
import { Stage } from '../components/Stage';
import { KineticText, Sub } from '../components/Type';
import { ToastPair } from '../components/Ui';
import { beat, fade } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 27–30s — ASSINATURA SEM FINAL.
 *
 * Da copy: "Não quero tela de encerramento. Quero que a última cena continue
 * se movimentando. Caixas continuam entrando e saindo... No centro: TRÊS
 * ESTRELAS / Logística para quem vende grande. E ao fundo surge novamente o
 * fluxo de pedidos da primeira cena."
 *
 * Por isso não há fade de saída: o último quadro entrega o movimento cheio
 * para emendar no primeiro.
 */
export const S7Assinatura: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Stage scene="s7" duration={duration} push="out" />

      {/* as caixas seguem atravessando: nada encerra */}
      <BoxField start={0} duration={duration} count={46} converge={false} />

      {/* o fluxo de pedidos da primeira cena volta */}
      <ToastPair
        start={beat(1.5)}
        top="14%"
        left={{ title: 'Novo pedido #98254', subtitle: 'Shopee · São Paulo - SP', accent: '#ee4d2d' }}
        right={{ title: 'Novo pedido #98731', subtitle: 'Mercado Livre · Curitiba - PR', accent: '#ffe600' }}
        width={286}
      />
      <ToastPair
        start={beat(2.5)}
        top="76%"
        left={{ title: 'Novo pedido #45120', subtitle: 'Shein · Manaus - AM', accent: '#111827' }}
        right={{ title: 'Novo pedido #71206', subtitle: 'Shopee · Recife - PE', accent: '#ee4d2d' }}
        width={286}
      />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', zIndex: 25 }}>
        <KineticText lines={['Três', 'Estrelas']} start={beat(0.5)} size={162} align="center" />
        <div style={{ marginTop: 26, opacity: fade(frame, beat(2), 0.6) }}>
          <Sub start={beat(2)} size={42} color={theme.white} weight={600} align="center">
            Logística para quem vende grande.
          </Sub>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
