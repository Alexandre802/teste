'use client';

import { business } from '@/lib/business';
import { Button } from '../ui/Button';
import { WhatsAppIcon } from '../ui/Icons';

/**
 * Confirmação, depois que o pedido saiu.
 *
 * Existe por um motivo prático: no celular, abrir o WhatsApp tira o cliente
 * do site, e quando ele volta a sacola já está vazia. Sem esta tela, a
 * impressão é de que o pedido sumiu. Aqui ele encontra o número do pedido e
 * um botão para reabrir a conversa, caso a primeira janela tenha sido
 * bloqueada pelo navegador.
 */
export default function ConfirmStep({
  referencia,
  whatsappUrl,
  onClose,
}: {
  referencia: string;
  whatsappUrl: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <span
        aria-hidden
        className="grid h-16 w-16 place-items-center rounded-full bg-white text-3xl text-cocoa"
      >
        ✓
      </span>

      <div>
        <h3 className="text-xl font-extrabold text-white">Deu tudo certo</h3>
        <p className="mx-auto mt-2 max-w-[32ch] text-sm leading-relaxed text-white/90">
          Abrimos o WhatsApp da {business.name} com o seu pedido. É só tocar em enviar na conversa
          para a casa começar a preparar.
        </p>
      </div>

      <p className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold tracking-wide text-white ring-1 ring-inset ring-white/30">
        Pedido nº {referencia}
      </p>

      <div className="flex w-full flex-col gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-extrabold text-cocoa transition-transform hover:-translate-y-0.5"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Abrir a conversa de novo
        </a>
        <Button variant="ghost" className="w-full" onClick={onClose}>
          Voltar ao cardápio
        </Button>
      </div>

      <p className="max-w-[34ch] text-xs leading-relaxed text-white/70">
        Se a janela do WhatsApp não abriu, o navegador pode ter bloqueado. Use o botão acima.
      </p>
    </div>
  );
}
