'use client';

import { formatPrice } from '@/lib/catalog';
import { enderecoEmLinhas } from '@/lib/endereco';
import { taxaPara } from '@/lib/entrega';
import { ROTULO_FORMA, valorDoTroco } from '@/lib/pagamento';
import { cartTotal, lineProduct, orderTotal, useShop } from '@/lib/store';
import { formatarTelefone } from '@/lib/whatsapp';
import { Button } from '../ui/Button';
import { WhatsAppIcon } from '../ui/Icons';

/**
 * Revisão antes de enviar.
 *
 * É a última tela em que dá para consertar alguma coisa, então tudo que vai
 * para a cozinha aparece aqui — inclusive o endereço e o troco. Cada bloco
 * tem um atalho de volta ao passo que o gerou: descobrir um erro e ter que
 * recomeçar o checkout é o jeito mais rápido de perder o pedido.
 */
export default function ReviewStep({
  note,
  onNote,
  onEdit,
  onBack,
  onSubmit,
  enviando,
  erro,
}: {
  note: string;
  onNote: (valor: string) => void;
  onEdit: (passo: 'sacola' | 'modo' | 'login' | 'endereco' | 'pagamento') => void;
  onBack: () => void;
  onSubmit: () => void;
  enviando: boolean;
  erro: string;
}) {
  const lines = useShop((s) => s.lines);
  const mode = useShop((s) => s.mode);
  const customer = useShop((s) => s.customer);
  const address = useShop((s) => s.address);
  const payment = useShop((s) => s.payment);

  const entrega = mode === 'entrega';
  const subtotal = cartTotal(lines);
  const total = orderTotal(lines, mode);
  const taxa = entrega ? taxaPara(subtotal) : null;
  const volta = valorDoTroco(payment, total);
  const pagarAgora = payment.momento === 'online' && payment.forma !== 'dinheiro';

  return (
    <div className="flex flex-col gap-4">
      {/* ── itens ── */}
      <Bloco titulo="Itens" onEdit={() => onEdit('sacola')}>
        <ul className="flex flex-col gap-1.5">
          {lines.map((line) => {
            const produto = lineProduct(line);
            if (!produto) return null;
            return (
              <li key={line.productId} className="text-sm text-white/90">
                <span className="font-bold text-white">
                  {line.qty}x {produto.name}
                </span>
                <span className="float-right font-extrabold text-white">
                  {formatPrice(produto.price * line.qty)}
                </span>
                {line.note.trim() && (
                  <span className="mt-0.5 block text-xs text-muted">obs: {line.note.trim()}</span>
                )}
              </li>
            );
          })}
        </ul>
      </Bloco>

      {/* ── entrega ou retirada ── */}
      <Bloco titulo={entrega ? 'Entrega' : 'Retirada'} onEdit={() => onEdit('modo')}>
        {entrega ? (
          <div className="text-sm leading-relaxed text-white/90">
            {enderecoEmLinhas(address).map((linha) => (
              <p key={linha}>{linha}</p>
            ))}
            <button
              type="button"
              onClick={() => onEdit('endereco')}
              className="mt-1.5 text-xs font-bold text-white underline underline-offset-2"
            >
              alterar endereço
            </button>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-white/90">
            <strong className="font-extrabold text-white">Retirada no local.</strong> Você busca o
            pedido na lanchonete — nenhum endereço de entrega é necessário.
          </p>
        )}
      </Bloco>

      {/* ── quem pediu ── */}
      <Bloco titulo="Cliente" onEdit={() => onEdit('login')}>
        <p className="text-sm font-bold text-white">{customer?.name || 'Não informado'}</p>
        {customer?.phone && (
          <p className="text-sm text-white/90">{formatarTelefone(customer.phone)}</p>
        )}
        {customer?.email && <p className="text-sm text-white/90">{customer.email}</p>}
      </Bloco>

      {/* ── pagamento ── */}
      <Bloco titulo="Pagamento" onEdit={() => onEdit('pagamento')}>
        <p className="text-sm font-bold text-white">{ROTULO_FORMA[payment.forma]}</p>
        {payment.forma === 'dinheiro' && (
          <p className="text-sm text-white/90">
            {payment.precisaTroco && payment.trocoPara !== null
              ? `Troco para ${formatPrice(payment.trocoPara)}${
                  volta !== null && volta > 0 ? ` · levar ${formatPrice(volta)}` : ''
                }`
              : 'Não precisa de troco'}
          </p>
        )}
        {payment.forma !== 'dinheiro' && (
          <p className="text-sm text-white/90">
            {pagarAgora ? 'Pagar agora, pelo site' : `A pagar na ${entrega ? 'entrega' : 'retirada'}`}
          </p>
        )}
      </Bloco>

      {/* ── observações gerais ── */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="obs-pedido" className="text-sm font-bold text-white">
          Alguma observação para a casa? <span className="font-semibold text-white/65">(opcional)</span>
        </label>
        <textarea
          id="obs-pedido"
          rows={2}
          value={note}
          onChange={(e) => onNote(e.target.value)}
          maxLength={400}
          placeholder="Ex.: capricha na maionese, tocar a campainha"
          className="w-full resize-none rounded-2xl bg-white/15 px-4 py-3 text-sm text-white placeholder:text-white/55 ring-1 ring-inset ring-white/35 focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>

      {/* ── total ── */}
      <div className="glass rounded-2xl px-5 py-4">
        {taxa !== null && (
          <>
            <Linha rotulo="Subtotal" valor={formatPrice(subtotal)} />
            <Linha
              rotulo="Taxa de entrega"
              valor={taxa === 0 ? 'grátis' : formatPrice(taxa)}
            />
          </>
        )}
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-sm font-bold text-muted">Total</span>
          <span className="text-2xl font-extrabold text-white">{formatPrice(total)}</span>
        </div>
      </div>

      {erro && (
        <p role="alert" className="rounded-2xl bg-ember-deep/45 px-5 py-4 text-sm font-semibold text-white">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button size="lg" className="w-full" onClick={onSubmit} disabled={enviando}>
          {enviando ? (
            'Enviando…'
          ) : pagarAgora ? (
            `Pagar ${formatPrice(total)}`
          ) : (
            <>
              <WhatsAppIcon className="h-5 w-5" />
              Enviar pedido pelo WhatsApp
            </>
          )}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onBack} disabled={enviando}>
          Voltar
        </Button>
      </div>
    </div>
  );
}

function Bloco({
  titulo,
  onEdit,
  children,
}: {
  titulo: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white/12 p-4 ring-1 ring-inset ring-white/28">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">{titulo}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 text-xs font-bold text-white underline underline-offset-2 hover:text-white"
        >
          alterar
        </button>
      </div>
      {children}
    </section>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-muted">{rotulo}</span>
      <span className="font-bold text-white">{valor}</span>
    </div>
  );
}
