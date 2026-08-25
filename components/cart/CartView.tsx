'use client';

import Link from 'next/link';
import { linhasDoCarrinho, subtotal, totalDeItens, useCarrinho } from '@/lib/cart';
import { useHydrated } from '@/lib/use-hydrated';
import { moeda, precoVisivel } from '@/lib/format';
import { linkWhatsApp } from '@/lib/whatsapp';
import ProductImage from '@/components/ui/ProductImage';
import QuantitySelector from '@/components/ui/QuantitySelector';
import { IconeCarrinho, IconeLixeira, IconeWhatsApp } from '@/components/ui/Icons';

/**
 * Página do carrinho. Enquanto não há back-end, o pedido é fechado pelo
 * WhatsApp: o botão abre a conversa já com a lista escrita.
 *
 * Sem preços confirmados (ver data/products.ts) o subtotal aparece como
 * "a combinar" em vez de somar valores que a loja não confirmou.
 */
export default function CartView() {
  const itens = useCarrinho((e) => e.itens);
  const definirQuantidade = useCarrinho((e) => e.definirQuantidade);
  const remover = useCarrinho((e) => e.remover);
  const limpar = useCarrinho((e) => e.limpar);
  const hidratado = useHydrated();

  // até hidratar, o localStorage ainda não foi lido: mostra o estado vazio
  const linhas = hidratado ? linhasDoCarrinho(itens) : [];
  const total = hidratado ? totalDeItens(itens) : 0;
  const soma = subtotal(linhas);

  if (!hidratado || linhas.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-surface-2">
          <IconeCarrinho className="h-8 w-8 text-brand-300" />
        </span>
        <h1 className="mt-4 text-xl font-extrabold tracking-tight text-ink">
          {hidratado ? 'Seu carrinho está vazio' : 'Carregando seu carrinho...'}
        </h1>
        {hidratado ? (
          <>
            <p className="mt-1.5 text-[14px] text-ink-3">
              Escolha as rações, petiscos e acessórios do seu pet e eles aparecem aqui.
            </p>
            <Link
              href="/#departamentos"
              className="mt-6 inline-block rounded-full bg-brand-500 px-7 py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-700"
            >
              Ver produtos
            </Link>
          </>
        ) : null}
      </div>
    );
  }

  const textoPedido = [
    'Olá! Vim pelo site da Casa de Ração Bandeira Branca e gostaria de fazer este pedido:',
    '',
    ...linhas.map(({ produto, quantidade }) => {
      const preco = precoVisivel(produto);
      const valor = preco !== null ? ` — ${moeda(preco * quantidade)}` : '';
      return `• ${quantidade}x ${produto.nome}${produto.medida ? ` ${produto.medida}` : ''}${valor}`;
    }),
    '',
    soma !== null ? `Subtotal: ${moeda(soma)}` : 'Poderiam me confirmar os valores, por favor?',
  ].join('\n');

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            Meu carrinho
            <span className="ml-2 text-[14px] font-semibold text-ink-3">
              {total} {total === 1 ? 'item' : 'itens'}
            </span>
          </h1>
          <button
            type="button"
            onClick={limpar}
            className="text-[13px] font-semibold text-ink-3 hover:text-brand-500 hover:underline"
          >
            Esvaziar carrinho
          </button>
        </div>

        <ul className="space-y-2.5">
          {linhas.map(({ produto, quantidade }) => {
            const preco = precoVisivel(produto);
            return (
              <li key={produto.id} className="card-flat flex gap-3 p-3 sm:gap-4 sm:p-4">
                <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line sm:h-24 sm:w-24">
                  <ProductImage produto={produto} sizes="96px" />
                </span>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="clamp-2 text-[14px] leading-snug text-ink-2">
                        {produto.nome} {produto.medida ?? ''}
                      </h2>
                      <p className="mt-0.5 text-[12px] text-ink-3">{produto.marca}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remover(produto.id)}
                      aria-label={`Remover ${produto.nome} do carrinho`}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-3 transition-colors hover:bg-surface-2 hover:text-brand-500"
                    >
                      <IconeLixeira className="h-[18px] w-[18px]" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <QuantitySelector
                      quantidade={quantidade}
                      aoAlterar={(nova) => definirQuantidade(produto.id, nova)}
                      rotulo={produto.nome}
                      minimo={0}
                    />
                    <span className="text-[15px] font-bold text-brand-500">
                      {preco !== null ? moeda(preco * quantidade) : 'Consultar preço'}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="card-flat p-4 sm:p-5 lg:sticky lg:top-44">
        <h2 className="text-[15px] font-bold text-ink">Resumo do pedido</h2>

        <dl className="mt-3 space-y-2 text-[14px]">
          <div className="flex items-center justify-between">
            <dt className="text-ink-3">Itens</dt>
            <dd className="font-semibold text-ink-2">{total}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-2">
            <dt className="font-bold text-ink">Subtotal</dt>
            <dd className="text-lg font-bold text-brand-500">
              {soma !== null ? moeda(soma) : 'A combinar'}
            </dd>
          </div>
        </dl>

        <p className="mt-2 text-[12px] leading-snug text-ink-3">
          {soma !== null
            ? 'A entrega é combinada no WhatsApp, conforme a sua região.'
            : 'Os valores são confirmados no atendimento, junto com a entrega da sua região.'}
        </p>

        <a
          href={linkWhatsApp(textoPedido)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-wa px-4 py-3 text-[15px] font-bold text-white transition-colors hover:bg-wa-dark"
        >
          <IconeWhatsApp className="h-5 w-5" />
          Fechar pedido no WhatsApp
        </a>

        <Link
          href="/#departamentos"
          className="mt-2 block rounded-full border border-brand-500 px-4 py-3 text-center text-[15px] font-bold text-brand-500 transition-colors hover:bg-brand-50"
        >
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}
