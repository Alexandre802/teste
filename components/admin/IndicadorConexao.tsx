'use client';

import { useEffect, useState } from 'react';

/**
 * ● Online / ● Offline no topo do painel.
 *
 * O celular na cozinha perde sinal com frequência. Sem este indicador, uma
 * lista de pedidos parada parece "não entrou pedido" quando na verdade é "o
 * painel não está mais recebendo nada" — e a casa deixa cliente esperando.
 *
 * Começa como online mesmo antes de saber: o valor real só existe depois da
 * hidratação, e piscar "Offline" a cada carregamento treina a pessoa a
 * ignorar o aviso justamente quando ele for verdade.
 */
export default function IndicadorConexao() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const atualizar = () => setOnline(navigator.onLine);
    atualizar();
    window.addEventListener('online', atualizar);
    window.addEventListener('offline', atualizar);
    return () => {
      window.removeEventListener('online', atualizar);
      window.removeEventListener('offline', atualizar);
    };
  }, []);

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        online ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-rose-500'}`}
      />
      {online ? 'Online' : 'Offline'}
    </span>
  );
}
