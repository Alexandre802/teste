'use client';

import { formatPrice, products, productsById } from '@/lib/catalog';
import { topProducts, useShop } from '@/lib/store';
import { useHydrated } from '@/lib/use-hydrated';
import { Button } from '../ui/Button';
import { ProductImage } from '../ui/ProductImage';
import { Reveal } from '../ui/Reveal';

/**
 * A parte "memorável": quem já pediu antes volta e encontra o último pedido
 * pronto para repetir, o que mais pede e uma sugestão.
 *
 * Tudo sai do histórico salvo no navegador (localStorage), então funciona sem
 * backend nenhum. O limite é conhecido: é por aparelho — trocou de celular,
 * o histórico não vai junto. Para acompanhar o cliente entre dispositivos é
 * preciso guardar o histórico no servidor, com login de verdade.
 */
export default function ClienteDeVolta() {
  const customer = useShop((s) => s.customer);
  const history = useShop((s) => s.history);
  const add = useShop((s) => s.add);
  const hydrated = useHydrated();

  if (!hydrated || !customer || history.length === 0) return null;

  const last = history[0];
  const favoritos = topProducts(history, 4);
  const firstName = customer.name.split(' ')[0];

  // sugestão: algo que ele ainda não pediu, na categoria que mais pede
  const jaPediu = new Set(history.flatMap((o) => o.lines.map((l) => l.productId)));
  const categoriaPreferida = favoritos[0]?.category;
  const sugestao = products.find(
    (p) => p.available && p.category === categoriaPreferida && !jaPediu.has(p.id),
  );

  const repetirPedido = () => {
    for (const line of last.lines) add(line.productId, line.qty, line.note);
  };

  return (
    <section aria-label="Seus pedidos" className="py-14">
      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8">
        <Reveal className="glass rounded-[var(--radius-card)] p-6 sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-flame-soft">
            Que bom te ver de novo
          </p>
          <h2 className="mt-2 text-[clamp(1.6rem,4vw,2.5rem)] font-extrabold leading-tight text-cream">
            Oi, {firstName}.
          </h2>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            {/* último pedido */}
            <div className="rounded-3xl bg-ink-2/70 p-5 ring-1 ring-inset ring-flame/20">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-gold">
                Seu último pedido
              </h3>
              <p className="mt-1 text-xs text-muted">
                {new Date(last.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                })}{' '}
                · {last.mode === 'entrega' ? 'Entrega' : 'Retirada'}
              </p>

              <ul className="mt-4 flex flex-col gap-1.5 text-sm text-cream/90">
                {last.lines.map((line) => {
                  const p = productsById.get(line.productId);
                  return p ? (
                    <li key={line.productId} className="flex justify-between gap-4">
                      <span>
                        {line.qty}× {p.name}
                      </span>
                      <span className="shrink-0 text-muted">{formatPrice(p.price * line.qty)}</span>
                    </li>
                  ) : null;
                })}
              </ul>

              <p className="mt-3 border-t border-flame/15 pt-3 text-right text-lg font-extrabold text-gold">
                {formatPrice(last.total)}
              </p>

              <Button onClick={repetirPedido} className="mt-4 w-full">
                Pedir de novo
              </Button>
            </div>

            {/* mais pedidos + sugestão */}
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-gold">
                O que você mais pede
              </h3>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {favoritos.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => add(p.id, 1)}
                      className="group w-full text-left"
                    >
                      <span className="relative block aspect-square overflow-hidden rounded-2xl ring-1 ring-inset ring-flame/20">
                        <ProductImage product={p} sizes="120px" className="transition-transform duration-500 group-hover:scale-110" />
                      </span>
                      <span className="mt-2 block text-xs font-bold leading-tight text-cream">
                        {p.name}
                      </span>
                      <span className="block text-xs text-gold">{formatPrice(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {sugestao && (
                <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/8 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-gold">
                    Já que você gosta dessa linha
                  </p>
                  <p className="mt-1.5 text-sm text-cream">
                    Experimenta o <strong className="font-extrabold">{sugestao.name}</strong> —{' '}
                    {formatPrice(sugestao.price)}.
                  </p>
                  <button
                    type="button"
                    onClick={() => add(sugestao.id, 1)}
                    className="mt-2 text-xs font-bold text-gold underline underline-offset-2"
                  >
                    adicionar à sacola
                  </button>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
