'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Icone } from '@/components/ui/Icone';

interface Props {
  naoLidas: number;
  aberto: boolean;
  aoAlternar: () => void;
}

/**
 * O sino do Maicon.
 *
 * O número no cantinho conta só o que ainda não foi lido. Quando chega algo
 * novo, o sino balança uma vez — o suficiente para o olho ir até lá sem que a
 * tela inteira se mexa.
 */
export function NotificationBell({ naoLidas, aberto, aoAlternar }: Props) {
  return (
    <button
      type="button"
      onClick={aoAlternar}
      aria-label={
        naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : 'Notificações'
      }
      aria-expanded={aberto}
      className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
        aberto ? 'border-ouro/45 bg-ouro/12 text-ouro' : 'border-grafite bg-carvao text-fumaca'
      }`}
    >
      <motion.span
        // A chave muda a cada notificação nova: isso remonta o span e roda o
        // balanço uma única vez, sem loop.
        key={naoLidas}
        animate={naoLidas > 0 ? { rotate: [0, -14, 11, -7, 4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ transformOrigin: '50% 22%' }}
      >
        <Icone nome="sino" tamanho={20} />
      </motion.span>

      <AnimatePresence>
        {naoLidas > 0 ? (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 620, damping: 26 }}
            className="numero absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-b from-ouro-claro to-ouro px-1 text-[0.68rem] font-bold text-noite"
          >
            {naoLidas > 99 ? '99+' : naoLidas}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}
