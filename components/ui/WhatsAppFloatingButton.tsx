import { linkWhatsApp } from '@/lib/whatsapp';
import { IconeWhatsApp } from './Icons';

/**
 * Botão flutuante do WhatsApp. Fica acima da barra de navegação do iOS
 * (`env(safe-area-inset-bottom)`) e no canto, longe do botão de carrinho dos
 * cards, para não cobrir conteúdo.
 */
export default function WhatsAppFloatingButton() {
  return (
    <a
      href={linkWhatsApp()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp com a Casa de Ração Bandeira Branca"
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      className="fixed right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-wa text-white shadow-[0_6px_20px_rgba(0,0,0,0.22)] transition-colors hover:bg-wa-dark sm:right-6"
    >
      <IconeWhatsApp className="h-7 w-7" />
    </a>
  );
}
