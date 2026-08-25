'use client';

import { useEffect, useState } from 'react';
import { linkWhatsApp } from '@/lib/whatsapp';
import { IconeWhatsApp } from './Icons';

/**
 * Botão flutuante do WhatsApp.
 *
 * Some enquanto o cliente desce a página e volta assim que ele sobe. Não é
 * enfeite: no celular a bolha ficava exatamente em cima do botão de carrinho
 * de alguns cards e roubava o toque — cinco cards, em cinco alturas
 * diferentes. Como quem está descendo está olhando produto, e quem sobe está
 * procurando ação, esconder na descida devolve o toque ao card sem tirar o
 * atalho de quem quer falar com a loja.
 *
 * Fica acima da barra de navegação do iOS (`env(safe-area-inset-bottom)`).
 */
export default function WhatsAppFloatingButton() {
  const [escondido, setEscondido] = useState(false);

  useEffect(() => {
    let ultimo = window.scrollY;
    let agendado = false;

    function avaliar() {
      const atual = window.scrollY;
      // a folga de 8px evita piscar com o repique da rolagem por toque;
      // acima de 320px porque no topo a bolha não cobre nada
      if (atual > ultimo + 8 && atual > 320) setEscondido(true);
      else if (atual < ultimo - 8) setEscondido(false);
      ultimo = atual;
      agendado = false;
    }

    function aoRolar() {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(avaliar);
    }

    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  return (
    <a
      href={linkWhatsApp()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp com a Casa de Ração Bandeira Branca"
      aria-hidden={escondido}
      tabIndex={escondido ? -1 : undefined}
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      className={`fixed right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-wa text-white shadow-[0_6px_20px_rgba(0,0,0,0.22)] transition-all duration-200 hover:bg-wa-dark sm:right-6 ${
        escondido ? 'pointer-events-none translate-y-24 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <IconeWhatsApp className="h-7 w-7" />
    </a>
  );
}
