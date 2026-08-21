import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { PhoneSwiper } from '../components/Carousel';
import { NotificationStack } from '../components/NotifStack';
import { Stage } from '../components/Stage';
import { KineticText } from '../components/Type';
import { Wordmark } from '../components/Ui';
import { beat, fadeOut } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 0–5s — VOCÊ VENDE. A GENTE FAZ CHEGAR.
 *
 * Os três marketplaces ficam numa sessão que desliza: o aparelho não gira,
 * a fileira passa para o lado e o próximo app assume o centro.
 *
 * As notificações seguem a referência do cliente — caem de cima e empilham,
 * cada nova empurrando as anteriores para baixo — e chegam aos pares, os dois
 * lados no mesmo quadro.
 */
export const S1VoceVende: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  // a fileira repete as marcas para o swipe seguir adiante sem salto
  const base = [
    {
      brand: 'shopee' as const,
      orders: [
        { id: 'Pedido #97519', status: 'Novo pedido recebido', city: 'São Paulo - SP' },
        { id: 'Pedido #72537', status: 'Novo pedido recebido', city: 'Rio de Janeiro - RJ' },
        { id: 'Pedido #97516', status: 'Novo pedido recebido', city: 'Belo Horizonte - MG' },
      ],
    },
    {
      brand: 'mercadolivre' as const,
      orders: [
        { id: 'Venda #200982', status: 'Pagamento aprovado', city: 'Curitiba - PR' },
        { id: 'Venda #200981', status: 'Pagamento aprovado', city: 'Salvador - BA' },
        { id: 'Venda #200980', status: 'Pagamento aprovado', city: 'Brasília - DF' },
      ],
    },
    {
      brand: 'shein' as const,
      orders: [
        { id: 'Pedido #3H48E11', status: 'Novo pedido', city: 'Fortaleza - CE' },
        { id: 'Pedido #3H45830', status: 'Novo pedido', city: 'Manaus - AM' },
        { id: 'Pedido #3H45819', status: 'Novo pedido', city: 'Porto Alegre - RS' },
      ],
    },
  ];
  const slots = [...base, ...base];

  const esquerda = [
    { app: 'Shopee', accent: '#ee4d2d', time: 'agora', body: <>Novo pedido <b>#98254</b> · São Paulo - SP</> },
    { app: 'Mercado Livre', accent: '#ffe600', time: 'agora', body: <>Pagamento aprovado <b>#200982</b> · Curitiba</> },
    { app: 'Shein', accent: '#111827', time: 'agora', body: <>Novo pedido <b>#3H48E11</b> · Fortaleza - CE</> },
  ];
  const direita = [
    { app: 'Mercado Livre', accent: '#ffe600', time: 'agora', body: <>Nova venda <b>#200981</b> · Salvador - BA</> },
    { app: 'Shopee', accent: '#ee4d2d', time: 'agora', body: <>Novo pedido <b>#71206</b> · Recife - PE</> },
    { app: 'Shein', accent: '#111827', time: 'agora', body: <>Novo pedido <b>#3H45830</b> · Manaus - AM</> },
  ];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Stage scene="s1" duration={duration} push="in" />

      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 30 }}>
        <Wordmark start={beat(0.5)} />
      </div>

      {/* os dois lados recebem no mesmo quadro */}
      <div style={{ position: 'absolute', top: 210, left: 24, zIndex: 20 }}>
        <NotificationStack items={esquerda} start={beat(2)} everyBeats={1.5} width={496} exitAt={beat(9.2)} />
      </div>
      <div style={{ position: 'absolute', top: 210, right: 24, zIndex: 20 }}>
        <NotificationStack items={direita} start={beat(2)} everyBeats={1.5} width={496} exitAt={beat(9.2)} />
      </div>

      <div style={{ position: 'absolute', top: 690, left: 0, right: 0, zIndex: 10 }}>
        <PhoneSwiper slots={slots} start={beat(0.5)} width={300} gap={54} everyBeats={2} ordersStart={beat(2)} />
      </div>

      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 1360,
          display: 'flex', justifyContent: 'center', zIndex: 30,
        }}
      >
        <KineticText
          lines={['Você vende.', 'A gente', 'faz chegar.']}
          start={beat(5)}
          size={118}
          align="center"
          accent={[2]}
          accentColor={theme.cyan}
        />
      </div>
    </AbsoluteFill>
  );
};
