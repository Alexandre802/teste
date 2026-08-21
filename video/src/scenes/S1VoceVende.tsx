import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { NotificationStack } from '../components/NotifStack';
import { ScreenList } from '../components/ScreenList';
import { beat, fadeOut, pulse } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 0–5s — VOCÊ VENDE. A GENTE FAZ CHEGAR.
 *
 * A arte vertical do cliente preenche o quadro inteiro. Sobre ela animam duas
 * coisas: as listas dentro das três telas, com os pedidos entrando um a um,
 * e as notificações chegando pelas laterais.
 *
 * As laterais recebem um degradê que apaga os cards embutidos na arte, para
 * que as notificações animadas cheguem num espaço limpo em vez de aparecerem
 * duplicadas por cima das que já estão desenhadas.
 */

/** Retângulos das listas, medidos sobre a arte e convertidos para 1080×1920. */
const TELAS = {
  shopee: { x: 189, y: 442, w: 197, h: 362 },
  mercadolivre: { x: 399, y: 424, w: 253, h: 420 },
  shein: { x: 662, y: 442, w: 219, h: 362 },
};

export const S1VoceVende: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);
  const glow = pulse(frame, 3);

  // respiração lenta de câmera: a arte nunca fica parada
  const scale = interpolate(frame, [0, duration], [1.0, 1.045]);

  const esquerda = [
    { app: 'Pedido #72519', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #72520', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #72521', accent: '#ee4d2d', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
  ];
  const direita = [
    { app: 'Pedido #SH45822', accent: '#111827', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #SH45823', accent: '#111827', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #SH45820', accent: '#111827', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
    { app: 'Pedido #SH45824', accent: '#111827', glyph: 'S', time: 'agora', body: 'Novo pedido recebido' },
  ];

  return (
    <AbsoluteFill style={{ opacity: out, overflow: 'hidden', backgroundColor: theme.navy }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile('plates/s1_vertical.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* apaga os cards embutidos nas laterais */}
        <AbsoluteFill
          style={{
            background:
              `linear-gradient(90deg, ${theme.navyDeep} 0%, ${theme.navyDeep}f2 14%, transparent 30%), ` +
              `linear-gradient(270deg, ${theme.navyDeep} 0%, ${theme.navyDeep}f2 14%, transparent 30%)`,
            maskImage: 'linear-gradient(180deg, #000 0%, #000 52%, transparent 60%)',
            WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 52%, transparent 60%)',
          }}
        />

        {/* as listas dentro de cada aparelho */}
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

      {/* as notificações chegam pelas laterais, aos pares */}
      <div style={{ position: 'absolute', top: 140, left: 6, zIndex: 20 }}>
        <NotificationStack
          items={esquerda}
          start={beat(2)}
          everyBeats={1.5}
          width={244}
          cardHeight={78}
          gap={24}
          tone="light"
          side="left"
        />
      </div>
      <div style={{ position: 'absolute', top: 140, right: 6, zIndex: 20 }}>
        <NotificationStack
          items={direita}
          start={beat(2)}
          everyBeats={1.5}
          width={244}
          cardHeight={78}
          gap={24}
          tone="light"
          side="right"
        />
      </div>

      <AbsoluteFill
        style={{
          background:
            `radial-gradient(ellipse 70% 40% at 50% 34%, ` +
            `${theme.cyan}${Math.round(6 + glow * 10).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};
