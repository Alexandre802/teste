'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Icone } from '@/components/ui/Icone';
import { EstadoVazio } from '@/components/ui/EstadoVazio';
import { hora } from '@/lib/date';
import type { AppNotification } from '@/lib/types';

interface Props {
  aberto: boolean;
  notificacoes: AppNotification[];
  carregando: boolean;
  aoFechar: () => void;
  aoMarcarLida: (id: string) => void;
  aoMarcarTodasLidas: () => void;
}

/**
 * A central de notificações.
 *
 * No celular sobe de baixo, como uma folha; no computador desce do sino. As
 * mais recentes ficam em cima; as não lidas ganham um traço dourado à esquerda.
 */
export function NotificationPanel({
  aberto,
  notificacoes,
  carregando,
  aoFechar,
  aoMarcarLida,
  aoMarcarTodasLidas,
}: Props) {
  const temNaoLidas = notificacoes.some((n) => !n.read);

  return (
    <AnimatePresence>
      {aberto ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={aoFechar}
            className="fixed inset-0 z-40 bg-noite/70 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-label="Notificações"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            className="fixed inset-x-2 bottom-2 z-50 max-h-[78dvh] overflow-hidden rounded-3xl border border-grafite bg-noite-alta sm:inset-x-auto sm:top-[4.75rem] sm:right-4 sm:bottom-auto sm:w-[22rem] sm:rounded-2xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <header className="flex items-center justify-between border-b border-grafite px-4 py-3.5">
              <h2 className="text-[0.95rem] font-semibold text-neve">Notificações</h2>
              <div className="flex items-center gap-1">
                {temNaoLidas ? (
                  <button
                    type="button"
                    onClick={aoMarcarTodasLidas}
                    className="rounded-lg px-2 py-1 text-[0.75rem] font-medium text-ouro transition-opacity hover:opacity-80"
                  >
                    Marcar todas
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={aoFechar}
                  aria-label="Fechar"
                  className="rounded-lg p-1.5 text-fumaca-fraca transition-colors hover:text-neve"
                >
                  <Icone nome="fechar" tamanho={16} />
                </button>
              </div>
            </header>

            <div className="max-h-[62dvh] overflow-y-auto overscroll-contain">
              {carregando ? (
                <p className="px-4 py-8 text-center text-[0.85rem] text-fumaca-fraca">
                  Carregando…
                </p>
              ) : notificacoes.length === 0 ? (
                <EstadoVazio
                  icone="sino"
                  titulo="Nenhuma notificação"
                  descricao="Cada corte que o Gabriel ou o Nino registrar aparece aqui na hora."
                />
              ) : (
                <ul className="divide-y divide-grafite/70">
                  {notificacoes.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => !n.read && aoMarcarLida(n.id)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                          n.read ? 'opacity-60' : 'bg-ouro/[0.035]'
                        }`}
                      >
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            n.read ? 'bg-grafite' : 'bg-ouro'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.86rem] font-semibold text-neve">
                            {n.title}
                          </span>
                          <span className="mt-0.5 block text-[0.8rem] leading-snug text-fumaca">
                            {n.message}
                          </span>
                          <span className="mt-1 block text-[0.72rem] text-fumaca-fraca">
                            {hora(n.createdAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
