'use client';

/**
 * Botão flutuante do WhatsApp. Entra depois da primeira rolagem, com um gesto
 * curto — sem pulsar sem parar. No celular fica acima da barra de navegação do
 * sistema e nunca cobre um botão da página (as seções reservam o espaço).
 */
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { mensagens, whatsapp } from '@/data/academy';

export function WhatsAppButton() {
  const [visivel, setVisivel] = useState(false);
  const semMovimento = useReducedMotion();

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > 520);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  return (
    <AnimatePresence>
      {visivel && (
        <motion.a
          href={whatsapp(mensagens.geral)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com a Allp Fit no WhatsApp"
          initial={semMovimento ? { opacity: 1 } : { opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={semMovimento ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          whileHover={semMovimento ? undefined : { scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-[60] flex items-center gap-2.5 rounded-full bg-[#25D366] py-3.5 pl-4 pr-4 text-void shadow-[0_16px_40px_-12px_rgba(37,211,102,0.75)] md:pr-5"
        >
          <MessageCircle size={22} aria-hidden className="shrink-0" strokeWidth={2.4} />
          <span className="hidden text-sm font-bold md:inline">WhatsApp</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
