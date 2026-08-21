import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { PhoneSpinRow } from '../components/Carousel';
import { Stage } from '../components/Stage';
import { KineticText } from '../components/Type';
import { ToastPair, Wordmark } from '../components/Ui';
import { beat, fadeOut } from '../config/beat';

/**
 * 0–5s — VOCÊ VENDE. A GENTE FAZ CHEGAR.
 *
 * Da copy: "3 iphones, cada um com um marketplace... notificações de novas
 * compras dentro de cada celular de forma individual", "texto gigante ao
 * lado" e "Logo Três Estrelas pequeno".
 *
 * Os três aparelhos giram no próprio eixo e as notificações entram aos pares
 * — os dois lados no mesmo quadro, um par por tempo.
 */
export const S1VoceVende: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  // a ordem na tela segue a arte: Shopee, Mercado Livre, Shein
  const slots = [
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

  const pares = [
    {
      at: 2, top: '12%',
      left: { title: 'Novo pedido #98254', subtitle: 'Shopee · São Paulo - SP', accent: '#ee4d2d' },
      right: { title: 'Novo pedido #98731', subtitle: 'Mercado Livre · Curitiba', accent: '#ffe600' },
    },
    {
      at: 3, top: '19%',
      left: { title: 'Novo pedido #98199', subtitle: 'Shein · Salvador - BA', accent: '#111827' },
      right: { title: 'Novo pedido #71206', subtitle: 'Shopee · Recife - PE', accent: '#ee4d2d' },
    },
    {
      at: 4, top: '26%',
      left: { title: 'Novo pedido #45120', subtitle: 'Mercado Livre · Manaus', accent: '#ffe600' },
      right: { title: 'Novo pedido #45118', subtitle: 'Shein · Fortaleza - CE', accent: '#111827' },
    },
  ];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Stage scene="s1" duration={duration} push="in" />

      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 25 }}>
        <Wordmark start={beat(0.5)} />
      </div>

      {pares.map((p, i) => (
        <ToastPair key={i} start={beat(p.at)} top={p.top} left={p.left} right={p.right} width={292} inset="2%" />
      ))}

      <div style={{ position: 'absolute', top: 600, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <PhoneSpinRow
          slots={slots}
          start={beat(0.5)}
          width={296}
          gap={24}
          turnBeats={8}
          ordersStart={beat(2)}
        />
      </div>

      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 1330,
          display: 'flex', justifyContent: 'center', zIndex: 25,
        }}
      >
        <KineticText lines={['Você vende.', 'A gente', 'faz chegar.']} start={beat(5)} size={118} align="center" />
      </div>
    </AbsoluteFill>
  );
};
