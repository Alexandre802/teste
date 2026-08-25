'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/catalog';
import { cartTotal, useShop, type CartLine, type FulfillmentMode } from '@/lib/store';
import { Button } from '../ui/Button';
import { WhatsAppIcon } from '../ui/Icons';

type Method = 'pix' | 'cartao' | 'na-entrega';

const METHODS: { id: Method; label: string; hint: string }[] = [
  { id: 'pix', label: 'Pix', hint: 'Aprovação na hora' },
  { id: 'cartao', label: 'Cartão', hint: 'Crédito ou débito' },
  { id: 'na-entrega', label: 'Na entrega', hint: 'Combina direto com a casa' },
];

/**
 * Pagamento no site.
 *
 * Fala com /api/checkout, que integra o Mercado Pago (Pix e cartão). Sem
 * MP_ACCESS_TOKEN no ambiente, a rota responde em modo demonstração: o fluxo
 * roda inteiro para você testar, mas nenhuma cobrança real acontece — e a
 * tela deixa isso explícito, para ninguém achar que pagou.
 */
export default function PaymentStep({
  lines,
  mode,
  note,
  onBack,
  onPaid,
  onWhatsappOnly,
}: {
  lines: CartLine[];
  mode: FulfillmentMode;
  note: string;
  onBack: () => void;
  onPaid: () => void;
  onWhatsappOnly: () => void;
}) {
  const customer = useShop((s) => s.customer);
  const [method, setMethod] = useState<Method>('pix');
  const [status, setStatus] = useState<'idle' | 'loading' | 'demo' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const total = cartTotal(lines);

  const pay = async () => {
    if (method === 'na-entrega') {
      onWhatsappOnly();
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines, mode, note, customer, method }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Falha ao iniciar o pagamento');

      if (data.demo) {
        setStatus('demo');
        setMessage(data.message);
        return;
      }

      // gateway ativo: segue para o checkout hospedado
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Erro inesperado');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-3 text-sm font-bold text-white">Forma de pagamento</legend>
        <div className="flex flex-col gap-2.5">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              aria-pressed={method === m.id}
              className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left transition-all ${
                method === m.id
                  ? 'bg-gradient-to-r from-white/30 to-white/20 ring-2 ring-inset ring-white'
                  : 'bg-white/15 ring-1 ring-inset ring-white/35 hover:ring-white/55'
              }`}
            >
              <span>
                <span className="block font-extrabold text-white">{m.label}</span>
                <span className="block text-xs text-muted">{m.hint}</span>
              </span>
              <span
                className={`h-4 w-4 shrink-0 rounded-full ring-2 ${
                  method === m.id ? 'bg-white ring-white' : 'ring-muted/50'
                }`}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="glass rounded-2xl px-5 py-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-muted">Total a pagar</span>
          <span className="text-2xl font-extrabold text-white">{formatPrice(total)}</span>
        </div>
        <p className="mt-1 text-xs text-muted">
          {mode === 'entrega' ? 'Entrega' : 'Retirada'}
          {customer?.name ? ` · ${customer.name}` : ''}
        </p>
      </div>

      {status === 'demo' && (
        <div className="rounded-2xl border border-white/45 bg-white/15 px-5 py-4">
          <p className="text-sm font-extrabold text-white">Modo demonstração</p>
          <p className="mt-1 text-sm leading-relaxed text-white/90">{message}</p>
          <Button size="sm" className="mt-3 w-full" onClick={onPaid}>
            <WhatsAppIcon className="h-4 w-4" />
            Simular pagamento e enviar o pedido
          </Button>
        </div>
      )}

      {status === 'error' && (
        <p role="alert" className="rounded-2xl bg-ember-deep/45 px-5 py-4 text-sm font-semibold text-white">
          {message}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button size="lg" className="w-full" onClick={pay} disabled={status === 'loading'}>
          {status === 'loading'
            ? 'Abrindo pagamento…'
            : method === 'na-entrega'
              ? 'Enviar pedido pelo WhatsApp'
              : `Pagar ${formatPrice(total)}`}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
