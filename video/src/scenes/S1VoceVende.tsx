import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { NotificationStack } from '../components/NotifStack';
import { ScreenList } from '../components/ScreenList';
import { beat, fadeOut, pulse } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 0–5s — VOCÊ VENDE. A GENTE FAZ CHEGAR.
 *
 * Em 3:1 a arte-chave coincide com o quadro e entra inteira: os três
 * marketplaces com Mercado Livre no meio, Shopee à esquerda e Shein à
 * direita, a frase gigante ao lado, o logo pequeno e o pátio ao fundo.
 *
 * Sobre ela animam as listas dentro das três telas e as notificações
 * chegando pelas laterais.
 */

/**
 * Retângulos das listas, medidos sobre a arte (2172×724) e convertidos para
 * 3840×1280. Começam abaixo do cabeçalho de cada app, que fica sendo o da arte.
 */
const TELAS = {
  shopee: { x: 499, y: 460, w: 401, h: 524 },
  mercadolivre: { x: 948, y: 455, w: 476, h: 589 },
  shein: { x: 1471, y: 500, w: 401, h: 484 },
};

export const S1VoceVende: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);
  const glow = pulse(frame, 3);

  // respiração lenta de câmera: a arte nunca fica parada
  const scale = interpolate(frame, [0, duration], [1.0, 1.035]);

  const esquerda = [
    { app: 'Pedido #72519', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #72520', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #72521', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
  ];
  const direita = [
    { app: 'Pedido #SH45822', accent: '#111827', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #SH45823', accent: '#111827', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #SH45820', accent: '#111827', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
  ];

  return (
    <AbsoluteFill style={{ opacity: out, overflow: 'hidden', backgroundColor: theme.navy }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile('plates/s1_phones.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* apaga os cards embutidos nas duas colunas onde as notificações animadas chegam */}
        <AbsoluteFill
          style={{
            background:
              `linear-gradient(90deg, ${theme.navyDeep} 0%, ${theme.navyDeep}f0 8%, transparent 13%), ` +
              `linear-gradient(90deg, transparent 47%, ${theme.navyDeep}f0 51%, ${theme.navyDeep}f0 61%, transparent 65%)`,
          }}
        />

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
      </AbsoluteFill>

      {/* as notificações chegam nas duas colunas, aos pares */}
      <div style={{ position: 'absolute', top: 150, left: 26, zIndex: 20 }}>
        <NotificationStack
          items={esquerda}
          start={beat(2)}
          everyBeats={1.5}
          width={410}
          cardHeight={112}
          gap={40}
          tone="light"
          side="left"
        />
      </div>
      <div style={{ position: 'absolute', top: 150, left: 1935, zIndex: 20 }}>
        <NotificationStack
          items={direita}
          start={beat(2)}
          everyBeats={1.5}
          width={410}
          cardHeight={112}
          gap={40}
          tone="light"
          side="left"
        />
      </div>

      <AbsoluteFill
        style={{
          background:
            `radial-gradient(ellipse 46% 70% at 30% 50%, ` +
            `${theme.cyan}${Math.round(6 + glow * 10).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};
