import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { BoxField } from '../components/SceneFx';
import { NotificationStack } from '../components/NotifStack';
import { beat } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 27–30s — ASSINATURA SEM FINAL. Da copy: "Não quero tela de encerramento...
 * Caixas continuam entrando e saindo... E ao fundo surge novamente o fluxo de
 * pedidos da primeira cena."
 *
 * Por isso não há fade de saída: o último quadro entrega o movimento cheio
 * para emendar no primeiro.
 */
export const S7Assinatura: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], [1.04, 1.0]);

  const pedidos = [
    { app: 'Pedido #9283', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'São Paulo - SP' },
    { app: 'Pedido #4118', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'Belo Horizonte - MG' },
    { app: 'Pedido #7252', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'Curitiba - PR' },
  ];

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: theme.navy }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile('plates/s7_assinatura.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* espaço limpo para as notificações animadas chegarem */}
        <AbsoluteFill
          style={{
            background: `linear-gradient(90deg, ${theme.navyDeep} 0%, ${theme.navyDeep}f0 9%, transparent 15%)`,
          }}
        />
      </AbsoluteFill>

      {/* as caixas seguem atravessando: nada encerra */}
      <BoxField start={0} duration={duration} count={60} converge={false} />

      <div style={{ position: 'absolute', top: 170, left: 34, zIndex: 20 }}>
        <NotificationStack
          items={pedidos}
          start={beat(1)}
          everyBeats={1.2}
          width={420}
          cardHeight={112}
          gap={40}
          tone="light"
          side="left"
        />
      </div>
    </AbsoluteFill>
  );
};
