import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { NotificationStack } from '../components/NotifStack';
import { ScreenList } from '../components/ScreenList';
import { Stage } from '../components/Stage';
import { TextBand } from '../components/TextBand';
import { KineticText } from '../components/Type';
import { beat, fadeOut } from '../config/beat';

/**
 * 0–5s — VOCÊ VENDE. A GENTE FAZ CHEGAR.
 *
 * A arte entra inteira, com os três marketplaces. Por cima animam as listas
 * dentro de cada tela, as notificações chegando em leque nas duas colunas e a
 * frase, escrita em código sobre a área que a arte reserva para ela.
 */

/** Retângulos das listas, medidos sobre a arte e convertidos para 3840×1280. */
const TELAS = {
  shopee: { x: 499, y: 460, w: 401, h: 524 },
  mercadolivre: { x: 948, y: 455, w: 476, h: 589 },
  shein: { x: 1471, y: 500, w: 401, h: 484 },
};

export const S1VoceVende: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  const esquerda = [
    { app: 'Pedido #72519', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #72520', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #72521', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
  ];
  const direita = [
    { app: 'Pedido #SH45822', accent: '#111827', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #SH45823', accent: '#111827', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #SH45824', accent: '#111827', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
  ];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Stage scene="s1" duration={duration} push="in" />

      {/* a arte entrega a imagem; a tipografia é a animada, então a faixa da
          frase e as colunas de notificação da arte são cobertas */}
      <TextBand from={0.635} to={1.0} top={0.02} bottom={0.72} feather={5} />
      <TextBand from={0.0} to={0.105} feather={3} />
      <TextBand from={0.485} to={0.625} feather={3} />

      <ScreenList
        rect={TELAS.shopee}
        start={beat(1)}
        accent="#ee4d2d"
        footer="Ver todos os pedidos"
        rows={[
          { id: 'Pedido #72518', status: 'Novo pedido recebido', city: 'São Paulo - SP' },
          { id: 'Pedido #72517', status: 'Novo pedido recebido', city: 'Rio de Janeiro - RJ' },
          { id: 'Pedido #72516', status: 'Novo pedido recebido', city: 'Belo Horizonte - MG' },
        ]}
      />
      <ScreenList
        rect={TELAS.mercadolivre}
        start={beat(0.5)}
        accent="#3483fa"
        footer="Ver todas as vendas"
        rows={[
          { id: 'Venda #200982', status: 'Pagamento aprovado', city: 'Curitiba - PR' },
          { id: 'Venda #200981', status: 'Pagamento aprovado', city: 'Salvador - BA' },
          { id: 'Venda #200980', status: 'Pagamento aprovado', city: 'Brasília - DF' },
        ]}
      />
      <ScreenList
        rect={TELAS.shein}
        start={beat(1.5)}
        tone="dark"
        accent="#8b8f98"
        footer="Ver todos os pedidos"
        rows={[
          { id: 'Pedido #SH45821', status: 'Novo pedido recebido', city: 'Fortaleza - CE' },
          { id: 'Pedido #SH45820', status: 'Novo pedido recebido', city: 'Manaus - AM' },
          { id: 'Pedido #SH45819', status: 'Novo pedido recebido', city: 'Porto Alegre - RS' },
        ]}
      />

      <div style={{ position: 'absolute', top: 170, left: 30, zIndex: 20 }}>
        <NotificationStack
          items={esquerda}
          start={beat(1.5)}
          everyBeats={1.2}
          width={400}
          cardHeight={108}
          gap={38}
          tone="light"
          side="left"
        />
      </div>
      <div style={{ position: 'absolute', top: 170, left: 1900, zIndex: 20 }}>
        <NotificationStack
          items={direita}
          start={beat(1.5)}
          everyBeats={1.2}
          width={400}
          cardHeight={108}
          gap={38}
          tone="light"
          side="left"
        />
      </div>

      <AbsoluteFill
        style={{
          alignItems: 'flex-end', justifyContent: 'center',
          paddingRight: 150, paddingLeft: '62%', zIndex: 25,
        }}
      >
        <KineticText
          lines={['Você vende.', 'A gente faz chegar.']}
          start={beat(2.5)}
          size={172}
          align="right"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
