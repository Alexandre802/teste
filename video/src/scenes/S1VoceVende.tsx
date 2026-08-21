import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ArtBuild, plateSrc } from '../components/ArtBuild';
import { ScreenList } from '../components/ScreenList';
import { beat, fadeOut } from '../config/beat';

/**
 * 0–5s — VOCÊ VENDE. A GENTE FAZ CHEGAR.
 *
 * A composição se remonta em faixas: primeiro os três aparelhos, depois as
 * notificações de cada lado e por fim a frase com o pátio. Como cada faixa é
 * um recorte da própria arte, as notificações chegam sem que eu precise
 * redesenhá-las — era daí que vinham os cards duplicados.
 *
 * O que é redesenhado é só a lista dentro de cada tela, que a arte entrega
 * parada.
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

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <ArtBuild
        src={plateSrc('s1_phones.png')}
        duration={duration}
        push={[1.0, 1.035]}
        bands={[
          { from: 0.11, to: 0.50, at: beat(0), dir: 0 },    // os três aparelhos
          { from: 0.00, to: 0.11, at: beat(2), dir: -1 },   // notificações à esquerda
          { from: 0.50, to: 0.63, at: beat(2), dir: 1 },    // notificações à direita
          { from: 0.63, to: 1.00, at: beat(3.5), dir: 1 },  // a frase e o pátio
        ]}
      >
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
      </ArtBuild>
    </AbsoluteFill>
  );
};
