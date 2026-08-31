'use client';

import { useId, useState } from 'react';
import { formatPrice } from '@/lib/catalog';
import {
  ROTULO_FORMA,
  aceitaOnline,
  lerValor,
  validarTroco,
  valorDoTroco,
  type FormaPagamento,
} from '@/lib/pagamento';
import { useShop, type CartLine, type FulfillmentMode } from '@/lib/store';
import { orderTotal } from '@/lib/store';
import { Button } from '../ui/Button';

/**
 * Forma de pagamento.
 *
 * Duas decisões separadas, porque são mesmo duas: COMO paga (Pix, cartão,
 * dinheiro) e QUANDO paga (agora pelo site, ou na entrega). Dinheiro só
 * existe na entrega; Pix e cartão existem nos dois momentos.
 *
 * Pagar agora depende do Mercado Pago estar configurado no servidor. Quando
 * não está, esta tela NÃO oferece a opção nem finge que cobrou — o site
 * simplesmente segue por "pagar na entrega", que é o que a casa faz hoje.
 * O componente pergunta ao servidor (`GET /api/checkout`) porque a chave do
 * gateway é secreta e não pode ser lida pelo navegador.
 */
export default function PaymentStep({
  lines,
  mode,
  onlineDisponivel,
  onBack,
  onDone,
}: {
  lines: CartLine[];
  mode: FulfillmentMode;
  /** O gateway está configurado no servidor? Decide se "pagar agora" aparece. */
  onlineDisponivel: boolean;
  onBack: () => void;
  onDone: () => void;
}) {
  const payment = useShop((s) => s.payment);
  const setPayment = useShop((s) => s.setPayment);
  const [trocoTexto, setTrocoTexto] = useState(
    payment.trocoPara !== null ? String(payment.trocoPara).replace('.', ',') : '',
  );
  const [mostrarErro, setMostrarErro] = useState(false);
  const idTroco = useId();

  const total = orderTotal(lines, mode);
  const erroTroco = validarTroco(payment, total);
  const volta = valorDoTroco(payment, total);

  const formas: FormaPagamento[] = ['pix', 'cartao', 'dinheiro'];

  const escolherForma = (forma: FormaPagamento) => {
    setMostrarErro(false);
    // dinheiro nunca é online; ao sair do dinheiro, o momento volta ao que o
    // gateway permite
    setPayment({
      forma,
      momento: forma === 'dinheiro' ? 'na-entrega' : payment.momento,
    });
    if (forma !== 'dinheiro') setTrocoTexto('');
  };

  const digitarTroco = (texto: string) => {
    setTrocoTexto(texto);
    setPayment({ trocoPara: lerValor(texto) });
  };

  const seguir = () => {
    if (erroTroco) {
      setMostrarErro(true);
      document.getElementById(idTroco)?.focus();
      return;
    }
    onDone();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── como paga ── */}
      <fieldset>
        <legend className="mb-3 text-sm font-bold text-white">Forma de pagamento</legend>
        <div className="flex flex-col gap-2.5">
          {formas.map((forma) => (
            <button
              key={forma}
              type="button"
              onClick={() => escolherForma(forma)}
              aria-pressed={payment.forma === forma}
              className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left transition-all ${
                payment.forma === forma
                  ? 'bg-gradient-to-r from-white/30 to-white/20 ring-2 ring-inset ring-white'
                  : 'bg-white/15 ring-1 ring-inset ring-white/35 hover:ring-white/55'
              }`}
            >
              <span>
                <span className="block font-extrabold text-white">{ROTULO_FORMA[forma]}</span>
                <span className="block text-xs text-muted">{DICA_FORMA[forma]}</span>
              </span>
              <span
                className={`h-4 w-4 shrink-0 rounded-full ring-2 ${
                  payment.forma === forma ? 'bg-white ring-white' : 'ring-muted/50'
                }`}
              />
            </button>
          ))}
        </div>
      </fieldset>

      {/* ── troco: só no dinheiro ── */}
      {payment.forma === 'dinheiro' && (
        <fieldset className="rounded-2xl bg-white/12 p-4 ring-1 ring-inset ring-white/30">
          <legend className="px-1 text-sm font-bold text-white">Precisa de troco?</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {[
              { valor: true, rotulo: 'Sim' },
              { valor: false, rotulo: 'Não precisa' },
            ].map((opcao) => (
              <button
                key={String(opcao.valor)}
                type="button"
                onClick={() => {
                  setMostrarErro(false);
                  setPayment({ precisaTroco: opcao.valor });
                  if (!opcao.valor) setTrocoTexto('');
                }}
                aria-pressed={payment.precisaTroco === opcao.valor}
                className={`rounded-2xl px-4 py-3 text-sm font-extrabold transition-all ${
                  payment.precisaTroco === opcao.valor
                    ? 'bg-white text-cocoa'
                    : 'bg-white/15 text-white/85 ring-1 ring-inset ring-white/35 hover:text-white'
                }`}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>

          {payment.precisaTroco && (
            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor={idTroco} className="text-sm font-bold text-white">
                Troco para quanto?
              </label>
              <input
                id={idTroco}
                type="text"
                inputMode="decimal"
                value={trocoTexto}
                onChange={(e) => digitarTroco(e.target.value)}
                onBlur={() => setMostrarErro(true)}
                placeholder="Ex.: 50,00"
                aria-invalid={mostrarErro && erroTroco ? true : undefined}
                aria-describedby={`${idTroco}-ajuda`}
                className={`w-full rounded-2xl bg-white/15 px-4 py-3 text-white placeholder:text-white/55 ring-1 ring-inset focus:outline-none focus:ring-2 ${
                  mostrarErro && erroTroco ? 'ring-2 ring-white' : 'ring-white/35 focus:ring-white'
                }`}
              />
              <p id={`${idTroco}-ajuda`} role={erroTroco ? 'alert' : undefined} className="text-xs text-white/85">
                {mostrarErro && erroTroco ? (
                  <span className="font-semibold text-white">{erroTroco}</span>
                ) : volta !== null && volta > 0 ? (
                  `O entregador leva ${formatPrice(volta)} de troco.`
                ) : (
                  `O total é ${formatPrice(total)}. Informe o valor da nota que você vai entregar.`
                )}
              </p>
            </div>
          )}
        </fieldset>
      )}

      {/* ── quando paga ── */}
      {aceitaOnline(payment.forma) && onlineDisponivel && (
        <fieldset>
          <legend className="mb-3 text-sm font-bold text-white">Quando pagar</legend>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'online' as const, rotulo: 'Pagar agora', dica: 'Pelo site' },
              { id: 'na-entrega' as const, rotulo: 'Na entrega', dica: 'Com a casa' },
            ].map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                onClick={() => setPayment({ momento: opcao.id })}
                aria-pressed={payment.momento === opcao.id}
                className={`rounded-2xl px-4 py-3 text-center transition-all ${
                  payment.momento === opcao.id
                    ? 'bg-white text-cocoa'
                    : 'bg-white/15 text-white/85 ring-1 ring-inset ring-white/35 hover:text-white'
                }`}
              >
                <span className="block text-sm font-extrabold">{opcao.rotulo}</span>
                <span className="block text-xs opacity-75">{opcao.dica}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Sem gateway configurado o site diz a verdade em vez de esconder:
          pagamento online indisponível, pedido segue pelo WhatsApp. */}
      {aceitaOnline(payment.forma) && !onlineDisponivel && (
        <p className="rounded-2xl border border-white/40 bg-white/12 px-4 py-3 text-sm leading-relaxed text-white/90">
          O pagamento online ainda não está disponível neste site. Você escolhe{' '}
          <strong className="font-extrabold text-white">{ROTULO_FORMA[payment.forma]}</strong> e
          acerta direto com a casa na {mode === 'entrega' ? 'entrega' : 'retirada'} — o pedido vai
          com essa informação.
        </p>
      )}

      <div className="glass rounded-2xl px-5 py-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-muted">Total</span>
          <span className="text-2xl font-extrabold text-white">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button size="lg" className="w-full" onClick={seguir}>
          Revisar o pedido
        </Button>
        <Button variant="ghost" className="w-full" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </div>
  );
}

const DICA_FORMA: Record<FormaPagamento, string> = {
  pix: 'Aprovação na hora',
  cartao: 'Crédito ou débito',
  dinheiro: 'Na entrega, com troco se precisar',
};
