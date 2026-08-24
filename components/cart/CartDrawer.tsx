'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/catalog';
import { cartTotal, lineProduct, useShop, type FulfillmentMode } from '@/lib/store';
import { orderWhatsappUrl } from '@/lib/whatsapp';
import { ProductImage } from '../ui/ProductImage';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { WhatsAppIcon } from '../ui/Icons';
import LoginSheet from '../account/LoginSheet';
import PaymentStep from './PaymentStep';

type Step = 'sacola' | 'entrega' | 'pagamento';

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lines = useShop((s) => s.lines);
  const mode = useShop((s) => s.mode);
  const customer = useShop((s) => s.customer);
  const { setQty, setNote, remove, clear, setMode, recordOrder } = useShop();

  const [step, setStep] = useState<Step>('sacola');
  const [orderNote, setOrderNote] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);

  const total = cartTotal(lines);
  const empty = lines.length === 0;

  const goToPayment = () => {
    if (!customer) {
      setLoginOpen(true);
      return;
    }
    setStep('pagamento');
  };

  /** Fecha o pedido pelo WhatsApp — funciona sem gateway configurado. */
  const finishOnWhatsapp = (paymentStatus?: 'pago' | 'pagar-na-entrega') => {
    const url = orderWhatsappUrl({ lines, mode, customer, note: orderNote, paymentStatus });
    window.open(url, '_blank', 'noopener,noreferrer');
    recordOrder();
    setStep('sacola');
    setOrderNote('');
    onClose();
  };

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={step === 'sacola' ? 'Sua sacola' : step === 'entrega' ? 'Entrega ou retirada' : 'Pagamento'}
        footer={
          empty ? undefined : (
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-muted">Subtotal</span>
                <span className="text-2xl font-extrabold text-gold">{formatPrice(total)}</span>
              </div>

              {step === 'sacola' && (
                <Button size="lg" className="w-full" onClick={() => setStep('entrega')}>
                  Continuar
                </Button>
              )}

              {step === 'entrega' && (
                <div className="flex flex-col gap-2">
                  <Button size="lg" className="w-full" onClick={goToPayment}>
                    Ir para o pagamento
                  </Button>
                  <Button variant="ghost" onClick={() => setStep('sacola')} className="w-full">
                    Voltar
                  </Button>
                </div>
              )}
            </div>
          )
        }
      >
        {empty && (
          <div className="py-16 text-center">
            <p className="text-lg font-bold text-cream">Sua sacola está vazia</p>
            <p className="mt-2 text-sm text-muted">
              Escolha um lanche no cardápio e ele aparece aqui.
            </p>
          </div>
        )}

        {/* ─────────────── passo 1: itens ─────────────── */}
        {!empty && step === 'sacola' && (
          <ul className="flex flex-col gap-4">
            {lines.map((line) => {
              const product = lineProduct(line);
              if (!product) return null;
              return (
                <li key={line.productId} className="flex gap-4 border-b border-flame/12 pb-4 last:border-0">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                    <ProductImage product={product} sizes="80px" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold leading-tight text-cream">{product.name}</h3>
                      <button
                        type="button"
                        onClick={() => remove(line.productId)}
                        aria-label={`Remover ${product.name}`}
                        className="shrink-0 text-xs font-bold text-muted underline underline-offset-2 hover:text-gold"
                      >
                        remover
                      </button>
                    </div>

                    <p className="mt-0.5 text-sm font-extrabold text-gold">
                      {formatPrice(product.price * line.qty)}
                    </p>

                    <div className="mt-2 flex items-center gap-1 rounded-full bg-ink-3 p-1 ring-1 ring-inset ring-flame/25 w-fit">
                      <button
                        type="button"
                        onClick={() => setQty(line.productId, line.qty - 1)}
                        aria-label={`Diminuir ${product.name}`}
                        className="grid h-8 w-8 place-items-center rounded-full font-bold text-gold hover:bg-flame/20"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-extrabold text-cream">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(line.productId, line.qty + 1)}
                        aria-label={`Aumentar ${product.name}`}
                        className="grid h-8 w-8 place-items-center rounded-full font-bold text-gold hover:bg-flame/20"
                      >
                        +
                      </button>
                    </div>

                    <input
                      value={line.note}
                      onChange={(e) => setNote(line.productId, e.target.value)}
                      placeholder="Observação deste item"
                      aria-label={`Observação para ${product.name}`}
                      className="mt-2 w-full rounded-xl bg-ink-3/70 px-3 py-2 text-xs text-cream placeholder:text-muted/50 ring-1 ring-inset ring-flame/20 focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </li>
              );
            })}

            <li>
              <button
                type="button"
                onClick={clear}
                className="text-xs font-bold text-muted underline underline-offset-2 hover:text-gold"
              >
                Esvaziar sacola
              </button>
            </li>
          </ul>
        )}

        {/* ─────────────── passo 2: entrega ─────────────── */}
        {!empty && step === 'entrega' && (
          <div className="flex flex-col gap-5">
            <fieldset>
              <legend className="mb-3 text-sm font-bold text-cream">Como você prefere?</legend>
              <div className="grid grid-cols-2 gap-3">
                {(['entrega', 'retirada'] as FulfillmentMode[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMode(option)}
                    aria-pressed={mode === option}
                    className={`rounded-2xl px-4 py-4 text-sm font-extrabold capitalize transition-all ${
                      mode === option
                        ? 'bg-gradient-to-r from-gold to-flame text-ink'
                        : 'bg-ink-3 text-cream/75 ring-1 ring-inset ring-flame/25 hover:text-gold'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="glass rounded-2xl p-4">
              {customer ? (
                <>
                  <p className="text-sm font-bold text-cream">{customer.name}</p>
                  <p className="text-sm text-muted">{customer.phone}</p>
                  {mode === 'entrega' && (
                    <p className="mt-1 text-sm text-muted">
                      {customer.address || 'Endereço ainda não informado'}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setLoginOpen(true)}
                    className="mt-2 text-xs font-bold text-gold underline underline-offset-2"
                  >
                    alterar dados
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted">
                    Falta só se identificar para a casa saber quem está pedindo.
                  </p>
                  <Button size="sm" className="mt-3" onClick={() => setLoginOpen(true)}>
                    Identificar-me
                  </Button>
                </>
              )}
            </div>

            <div>
              <label htmlFor="obs-pedido" className="mb-2 block text-sm font-bold text-cream">
                Observações do pedido
              </label>
              <textarea
                id="obs-pedido"
                rows={3}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                maxLength={400}
                placeholder="Ponto de referência, troco, alguma preferência…"
                className="w-full resize-none rounded-2xl bg-ink-3 px-4 py-3 text-sm text-cream placeholder:text-muted/55 ring-1 ring-inset ring-flame/25 focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
        )}

        {/* ─────────────── passo 3: pagamento ─────────────── */}
        {!empty && step === 'pagamento' && (
          <PaymentStep
            lines={lines}
            mode={mode}
            note={orderNote}
            onBack={() => setStep('entrega')}
            onPaid={() => finishOnWhatsapp('pago')}
            onWhatsappOnly={() => finishOnWhatsapp('pagar-na-entrega')}
          />
        )}
      </Sheet>

      <LoginSheet
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onDone={() => setStep('pagamento')}
      />
    </>
  );
}

export function WhatsappFinishButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} size="lg" className="w-full">
      <WhatsAppIcon className="h-5 w-5" />
      Finalizar pelo WhatsApp
    </Button>
  );
}
