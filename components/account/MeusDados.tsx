'use client';

import { useState } from 'react';
import { useShop } from '@/lib/store';
import { useAuth } from '@/lib/auth';

/**
 * Direito de eliminação (LGPD, art. 18, VI).
 *
 * Tudo que o site guarda do cliente vive no navegador dele: nome, telefone,
 * endereço, histórico de pedidos e o contador de tentativas de login. Não há
 * cópia em servidor nosso, então apagar aqui apaga de fato — este botão é o
 * mecanismo completo de exclusão, não um pedido que alguém precisa atender.
 */
export default function MeusDados() {
  const customer = useShop((s) => s.customer);
  const history = useShop((s) => s.history);
  const signOut = useShop((s) => s.signOut);
  const limparTentativas = useAuth((s) => s.limparTentativas);
  const [feito, setFeito] = useState(false);

  const temDados = Boolean(customer) || history.length > 0;
  if (!temDados && !feito) return null;

  const apagar = () => {
    signOut();
    limparTentativas();
    try {
      localStorage.removeItem('mfh-shop-v1');
      localStorage.removeItem('mfh-auth-v1');
    } catch {
      /* navegador com armazenamento bloqueado: o estado em memória já foi limpo */
    }
    setFeito(true);
  };

  return (
    <div className="glass rounded-3xl p-5">
      <h3 className="text-sm font-extrabold uppercase tracking-[0.1em] text-white">Meus dados</h3>
      {feito ? (
        <p className="mt-2 text-sm leading-relaxed text-white/90">
          Apagado. Nome, telefone, endereço e histórico de pedidos saíram deste aparelho.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            O site guarda seus dados só neste aparelho, para lembrar de você no próximo pedido.
            Nada fica em servidor nosso.
          </p>
          <button
            type="button"
            onClick={apagar}
            className="mt-4 rounded-full bg-white/18 px-5 py-2.5 text-sm font-extrabold text-white ring-1 ring-inset ring-white/40 transition-colors hover:bg-white hover:text-ember"
          >
            Apagar meus dados deste aparelho
          </button>
        </>
      )}
    </div>
  );
}
