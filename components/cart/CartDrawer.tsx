'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/catalog';
import { enderecoValido } from '@/lib/endereco';
import { faltaParaMinimo, taxaPara } from '@/lib/entrega';
import { escolhaValida } from '@/lib/pagamento';
import { cartTotal, lineProduct, orderTotal, useShop, type FulfillmentMode } from '@/lib/store';
import { orderWhatsappUrl } from '@/lib/whatsapp';
import { ProductImage } from '../ui/ProductImage';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { WhatsAppIcon } from '../ui/Icons';
import LoginStep from '../account/LoginStep';
import AddressStep from './AddressStep';
import PaymentStep from './PaymentStep';
import ReviewStep from './ReviewStep';
import ConfirmStep from './ConfirmStep';

/**
 * Checkout completo:
 *
 *   sacola → entrega ou retirada → identificação → endereço* → pagamento
 *          → revisão → WhatsApp ou gateway → confirmação
 *
 * (*) o endereço é pulado na retirada.
 *
 * O que muda em relação à versão anterior: o endereço passou a existir de
 * verdade (antes o pedido chegava na cozinha sem ele), a forma de pagamento
 * vai junto e nada é dado como pago sem o gateway ter confirmado.
 */
type Passo = 'sacola' | 'modo' | 'login' | 'endereco' | 'pagamento' | 'revisao' | 'confirmado';

const TITULOS: Record<Passo, string> = {
  sacola: 'Sua sacola',
  modo: 'Entrega ou retirada',
  login: 'Identifique-se',
  endereco: 'Endereço de entrega',
  pagamento: 'Pagamento',
  revisao: 'Revise o pedido',
  confirmado: 'Pedido enviado',
};

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lines = useShop((s) => s.lines);
  const mode = useShop((s) => s.mode);
  const customer = useShop((s) => s.customer);
  const address = useShop((s) => s.address);
  const payment = useShop((s) => s.payment);
  const { setQty, setNote, remove, clear, setMode, recordOrder } = useShop();

  const [passo, setPasso] = useState<Passo>('sacola');
  const [orderNote, setOrderNote] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [referencia, setReferencia] = useState('');
  const [urlWhatsapp, setUrlWhatsapp] = useState('');
  /** O gateway está de pé? Só o servidor sabe — a chave dele é secreta. */
  const [onlineDisponivel, setOnlineDisponivel] = useState(false);

  const subtotal = cartTotal(lines);
  const total = orderTotal(lines, mode);
  const taxa = mode === 'entrega' ? taxaPara(subtotal) : null;
  const falta = faltaParaMinimo(subtotal, mode);
  const vazia = lines.length === 0;

  // pergunta uma vez se o pagamento online existe neste ambiente
  useEffect(() => {
    let vivo = true;
    fetch('/api/checkout')
      .then((r) => (r.ok ? r.json() : { online: false }))
      .then((d) => vivo && setOnlineDisponivel(Boolean(d?.online)))
      .catch(() => vivo && setOnlineDisponivel(false));
    return () => {
      vivo = false;
    };
  }, []);

  /**
   * Passo efetivamente renderizado.
   *
   * Esvaziar a sacola no meio do checkout volta para o começo. Isto é
   * derivado em vez de corrigido num efeito: um `setState` dentro de efeito
   * renderiza duas vezes e pisca a tela intermediária antes de voltar.
   */
  const passoAtual: Passo = vazia && passo !== 'confirmado' ? 'sacola' : passo;

  /** Depois do modo: identificação, ou direto ao próximo se já entrou. */
  const depoisDoModo = () => setPasso(customer ? proximoDepoisDoLogin() : 'login');
  /** Entrega precisa de endereço; retirada pula direto para o pagamento. */
  const proximoDepoisDoLogin = (): Passo => (mode === 'entrega' ? 'endereco' : 'pagamento');

  /**
   * Fecha o pedido.
   *
   * Dois caminhos, e o que os separa é se o cliente escolheu pagar agora:
   *
   *  - pagar agora  → abre o checkout do Mercado Pago. O pedido só é dado
   *                   como pago quando o webhook confirmar; aqui ninguém
   *                   marca "pago" por conta própria.
   *  - pagar depois → abre o WhatsApp com o pedido montado e avisa a casa
   *                   pela Cloud API, quando ela estiver configurada.
   *
   * O aviso à casa vai sem `await`: se a Cloud API estiver fora do ar, o
   * cliente não pode ficar esperando nem perder o pedido — o deeplink wa.me
   * é o caminho garantido e continua sendo o principal.
   */
  const finalizar = async () => {
    if (!escolhaValida(payment, total)) {
      setErro('Confira o valor do troco antes de enviar.');
      setPasso('pagamento');
      return;
    }
    if (mode === 'entrega' && !enderecoValido(address)) {
      setErro('Falta completar o endereço de entrega.');
      setPasso('endereco');
      return;
    }
    if (falta !== null) {
      setErro(`O pedido mínimo para entrega é ${formatPrice(subtotal + falta)}.`);
      return;
    }

    setErro('');
    setEnviando(true);

    const pagarAgora = payment.momento === 'online' && payment.forma !== 'dinheiro';
    const corpo = {
      lines,
      mode,
      note: orderNote,
      customer,
      address: mode === 'entrega' ? address : null,
      payment,
    };

    if (pagarAgora) {
      try {
        const r = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(corpo),
        });
        const dados = await r.json();
        if (!r.ok || !dados.checkoutUrl) {
          throw new Error(dados?.error ?? 'Não foi possível abrir o pagamento.');
        }
        // o navegador sai daqui para o checkout do gateway; a confirmação
        // chega pelo webhook, não por esta tela
        window.location.assign(dados.checkoutUrl);
        return;
      } catch (e) {
        setEnviando(false);
        setErro(
          e instanceof Error
            ? `${e.message} Você pode voltar e escolher pagar na entrega.`
            : 'Erro inesperado.',
        );
        return;
      }
    }

    const ref = novaReferencia();
    const url = orderWhatsappUrl({
      lines,
      mode,
      customer,
      address: mode === 'entrega' ? address : null,
      payment,
      note: orderNote,
      reference: ref,
    });

    void fetch('/api/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...corpo, reference: ref }),
      keepalive: true,
    }).catch(() => {
      /* aviso à casa é melhor-esforço: o pedido segue pelo deeplink */
    });

    window.open(url, '_blank', 'noopener,noreferrer');

    setReferencia(ref);
    setUrlWhatsapp(url);
    recordOrder();
    setOrderNote('');
    setEnviando(false);
    setPasso('confirmado');
  };

  const fecharTudo = () => {
    setPasso('sacola');
    setErro('');
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={passoAtual === 'confirmado' ? fecharTudo : onClose}
      title={TITULOS[passoAtual]}
      footer={
        vazia || passoAtual === 'confirmado' ? undefined : (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-muted">
                {taxa !== null ? 'Total com entrega' : 'Subtotal'}
              </span>
              <span className="text-2xl font-extrabold text-white">{formatPrice(total)}</span>
            </div>

            {falta !== null && (
              <p className="text-xs font-semibold text-white">
                Faltam {formatPrice(falta)} para o pedido mínimo de entrega.
              </p>
            )}

            {passoAtual === 'sacola' && (
              <Button size="lg" className="w-full" onClick={() => setPasso('modo')}>
                Continuar
              </Button>
            )}

            {passoAtual === 'modo' && (
              <div className="flex flex-col gap-2">
                <Button size="lg" className="w-full" onClick={depoisDoModo}>
                  Continuar
                </Button>
                <Button variant="ghost" onClick={() => setPasso('sacola')} className="w-full">
                  Voltar
                </Button>
              </div>
            )}
          </div>
        )
      }
    >
      {vazia && passoAtual !== 'confirmado' && (
        <div className="py-16 text-center">
          <p className="text-lg font-bold text-white">Sua sacola está vazia</p>
          <p className="mt-2 text-sm text-muted">
            Escolha um lanche no cardápio e ele aparece aqui.
          </p>
        </div>
      )}

      {/* ─────────────── 1. itens ─────────────── */}
      {!vazia && passoAtual === 'sacola' && (
        <ul className="flex flex-col gap-4">
          {lines.map((line) => {
            const product = lineProduct(line);
            if (!product) return null;
            return (
              <li
                key={line.productId}
                className="flex gap-4 border-b border-white/20 pb-4 last:border-0"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                  <ProductImage product={product} sizes="80px" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold leading-tight text-white">{product.name}</h3>
                    <button
                      type="button"
                      onClick={() => remove(line.productId)}
                      aria-label={`Remover ${product.name}`}
                      className="shrink-0 text-xs font-bold text-muted underline underline-offset-2 hover:text-white"
                    >
                      remover
                    </button>
                  </div>

                  <p className="mt-0.5 text-sm font-extrabold text-white">
                    {formatPrice(product.price * line.qty)}
                  </p>

                  <div className="mt-2 flex w-fit items-center gap-1 rounded-full bg-white/15 p-1 ring-1 ring-inset ring-white/35">
                    <button
                      type="button"
                      onClick={() => setQty(line.productId, line.qty - 1)}
                      aria-label={`Diminuir ${product.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full font-bold text-white hover:bg-white/25"
                    >
                      −
                    </button>
                    <span
                      aria-live="polite"
                      className="w-7 text-center text-sm font-extrabold text-white"
                    >
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(line.productId, line.qty + 1)}
                      aria-label={`Aumentar ${product.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full font-bold text-white hover:bg-white/25"
                    >
                      +
                    </button>
                  </div>

                  <input
                    value={line.note}
                    onChange={(e) => setNote(line.productId, e.target.value)}
                    maxLength={200}
                    placeholder="Observação deste item"
                    aria-label={`Observação para ${product.name}`}
                    className="mt-2 w-full rounded-xl bg-white/12 px-3 py-2 text-xs text-white placeholder:text-white/55 ring-1 ring-inset ring-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              onClick={clear}
              className="text-xs font-bold text-muted underline underline-offset-2 hover:text-white"
            >
              Esvaziar sacola
            </button>
          </li>
        </ul>
      )}

      {/* ─────────────── 2. entrega ou retirada ─────────────── */}
      {!vazia && passoAtual === 'modo' && (
        <div className="flex flex-col gap-5">
          <fieldset>
            <legend className="mb-3 text-sm font-bold text-white">Como você prefere?</legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { id: 'entrega', rotulo: 'Entrega', dica: 'Levamos até você' },
                  { id: 'retirada', rotulo: 'Retirada', dica: 'Você busca na casa' },
                ] as { id: FulfillmentMode; rotulo: string; dica: string }[]
              ).map((opcao) => (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => setMode(opcao.id)}
                  aria-pressed={mode === opcao.id}
                  className={`rounded-2xl px-4 py-4 text-center transition-all ${
                    mode === opcao.id
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

          {mode === 'retirada' ? (
            <p className="rounded-2xl bg-white/12 px-4 py-3 text-sm leading-relaxed text-white/90 ring-1 ring-inset ring-white/28">
              <strong className="font-extrabold text-white">Retirada no local.</strong> Você busca
              o pedido na lanchonete — não pedimos endereço.
            </p>
          ) : (
            <p className="rounded-2xl bg-white/12 px-4 py-3 text-sm leading-relaxed text-white/90 ring-1 ring-inset ring-white/28">
              No próximo passo pedimos o endereço da entrega.
            </p>
          )}
        </div>
      )}

      {/* ─────────────── 3. identificação ─────────────── */}
      {!vazia && passoAtual === 'login' && (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-white/90">
            Falta pouco. Entre para a casa lembrar do seu pedido na próxima, ou siga como
            convidado — o pedido sai igual dos dois jeitos.
          </p>
          <LoginStep onDone={() => setPasso(proximoDepoisDoLogin())} />
          <button
            type="button"
            onClick={() => setPasso('modo')}
            className="text-sm font-bold text-white/80 underline underline-offset-4 hover:text-white"
          >
            Voltar
          </button>
        </div>
      )}

      {/* ─────────────── 4. endereço (só na entrega) ─────────────── */}
      {!vazia && passoAtual === 'endereco' && (
        <AddressStep onDone={() => setPasso('pagamento')} onBack={() => setPasso('login')} />
      )}

      {/* ─────────────── 5. pagamento ─────────────── */}
      {!vazia && passoAtual === 'pagamento' && (
        <PaymentStep
          lines={lines}
          mode={mode}
          onlineDisponivel={onlineDisponivel}
          onBack={() => setPasso(mode === 'entrega' ? 'endereco' : 'login')}
          onDone={() => {
            setErro('');
            setPasso('revisao');
          }}
        />
      )}

      {/* ─────────────── 6. revisão ─────────────── */}
      {!vazia && passoAtual === 'revisao' && (
        <ReviewStep
          note={orderNote}
          onNote={setOrderNote}
          onEdit={setPasso}
          onBack={() => setPasso('pagamento')}
          onSubmit={finalizar}
          enviando={enviando}
          erro={erro}
        />
      )}

      {/* ─────────────── 7. confirmação ─────────────── */}
      {passoAtual === 'confirmado' && (
        <ConfirmStep referencia={referencia} whatsappUrl={urlWhatsapp} onClose={fecharTudo} />
      )}
    </Sheet>
  );
}

/**
 * Referência curta do pedido: data em base 36 + sufixo aleatório.
 *
 * Serve para o cliente e a casa falarem do mesmo pedido, e é o
 * `external_reference` que o Mercado Pago usa para não processar o mesmo
 * pagamento duas vezes.
 */
function novaReferencia(): string {
  const tempo = Date.now().toString(36).toUpperCase().slice(-6);
  const acaso = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${tempo}-${acaso}`;
}

export function WhatsappFinishButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} size="lg" className="w-full">
      <WhatsAppIcon className="h-5 w-5" />
      Finalizar pelo WhatsApp
    </Button>
  );
}
