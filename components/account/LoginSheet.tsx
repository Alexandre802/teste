'use client';

import { useState } from 'react';
import { useShop } from '@/lib/store';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';

/** Só dígitos, formatado como (00) 00000-0000 enquanto digita. */
function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const FACEBOOK_ENABLED = Boolean(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID);

/**
 * Identificação rápida do cliente.
 *
 * O caminho por telefone funciona sem backend: nome + telefone ficam no
 * navegador e passam a alimentar a saudação, o histórico e a mensagem do
 * pedido. Não há verificação por SMS — para isso é preciso um provedor
 * (Firebase Auth, Twilio Verify) e as chaves correspondentes.
 *
 * O botão do Facebook só aparece com NEXT_PUBLIC_FACEBOOK_APP_ID definido.
 */
export default function LoginSheet({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone?: () => void;
}) {
  const signIn = useShop((s) => s.signIn);
  const customer = useShop((s) => s.customer);

  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [address, setAddress] = useState(customer?.address ?? '');

  const digits = phone.replace(/\D/g, '');
  const valid = name.trim().length >= 2 && digits.length >= 10;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    signIn({ name: name.trim(), phone, address: address.trim() || undefined, provider: 'telefone' });
    onDone?.();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Identifique-se" centered>
      <p className="text-sm leading-relaxed text-muted">
        Rapidinho — é só para a casa saber quem está pedindo e para o site lembrar dos seus
        favoritos na próxima vez. Fica salvo só neste aparelho.
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="nome" className="mb-2 block text-sm font-bold text-white">
            Seu nome
          </label>
          <input
            id="nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            placeholder="Como podemos te chamar?"
            className="w-full rounded-2xl bg-white/15 px-4 py-3.5 text-white placeholder:text-white/60 ring-1 ring-inset ring-white/35 focus:ring-2 focus:ring-white"
          />
        </div>

        <div>
          <label htmlFor="tel" className="mb-2 block text-sm font-bold text-white">
            WhatsApp
          </label>
          <input
            id="tel"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="(12) 90000-0000"
            className="w-full rounded-2xl bg-white/15 px-4 py-3.5 text-white placeholder:text-white/60 ring-1 ring-inset ring-white/35 focus:ring-2 focus:ring-white"
          />
        </div>

        <div>
          <label htmlFor="end" className="mb-2 block text-sm font-bold text-white">
            Endereço <span className="font-normal text-muted">(para entrega)</span>
          </label>
          <input
            id="end"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoComplete="street-address"
            placeholder="Rua, número, bairro e complemento"
            className="w-full rounded-2xl bg-white/15 px-4 py-3.5 text-white placeholder:text-white/60 ring-1 ring-inset ring-white/35 focus:ring-2 focus:ring-white"
          />
        </div>

        <Button type="submit" size="lg" disabled={!valid} className="mt-2 w-full">
          Continuar
        </Button>
      </form>

      {FACEBOOK_ENABLED && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-white/25" /> ou <span className="h-px flex-1 bg-white/25" />
          </div>
          <a
            href="/api/auth/facebook"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-cream/30 px-6 py-3.5 font-bold text-white transition-colors hover:border-white hover:text-white"
          >
            Continuar com Facebook
          </a>
        </>
      )}
    </Sheet>
  );
}
