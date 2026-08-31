'use client';

import { useState } from 'react';
import { formatPrice, type Product } from '@/lib/catalog';
import { useShop } from '@/lib/store';
import { ProductImage } from '../ui/ProductImage';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';

/**
 * Corpo do modal. Vive numa `key` igual ao id do produto, então trocar de
 * produto remonta e zera quantidade e observação — sem efeito de reset.
 */
function ModalBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const add = useShop((s) => s.add);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');

  return (
    <>
      {/* Foto primeiro no celular, lado a lado no desktop.

          A proporção 3/2 é a nativa das fotografias da casa: com ela o
          `object-cover` não corta nada — nem o topo do pão nem a tábua. Antes
          era 16/10, que comia uma faixa do enquadramento. */}
      <div className="-mx-6 -mt-5 mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:gap-6">
        <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden sm:w-[47%] sm:self-start sm:rounded-r-[var(--radius-card)]">
          <ProductImage
            product={product}
            sizes="(max-width: 640px) 100vw, 20rem"
            priority
          />
        </div>

        <div className="px-6 sm:px-0 sm:pr-6 sm:pt-1">
          <p className="text-3xl font-extrabold text-white tabular-nums">
            {formatPrice(product.price)}
          </p>
          {product.description && (
            <p className="mt-3 leading-relaxed text-muted">{product.description}</p>
          )}
        </div>
      </div>

      {!product.available && (
        <p className="mt-4 rounded-2xl bg-ember-deep/45 px-4 py-3 text-sm font-bold text-white">
          Este item está esgotado no momento.
        </p>
      )}

      <div className="mt-6">
        <span id="qty-label" className="mb-2 block text-sm font-bold text-white">
          Quantidade
        </span>
        <div
          role="group"
          aria-labelledby="qty-label"
          className="flex w-fit items-center gap-1 rounded-full bg-white/15 p-1.5 ring-1 ring-inset ring-white/35"
        >
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
            className="grid h-10 w-10 place-items-center rounded-full text-xl font-bold text-white transition-colors hover:bg-white/25"
          >
            −
          </button>
          <span aria-live="polite" className="w-10 text-center text-lg font-extrabold text-white">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(30, q + 1))}
            aria-label="Aumentar quantidade"
            className="grid h-10 w-10 place-items-center rounded-full text-xl font-bold text-white transition-colors hover:bg-white/25"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="obs" className="mb-2 block text-sm font-bold text-white">
          Observações <span className="font-normal text-muted">(opcional)</span>
        </label>
        <textarea
          id="obs"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={280}
          placeholder="Ex.: sem cebola, capricha no bacon, ponto da carne…"
          className="w-full resize-none rounded-2xl bg-white/15 px-4 py-3 text-sm text-white placeholder:text-white/60 ring-1 ring-inset ring-white/35 focus:ring-2 focus:ring-white"
        />
      </div>

      <div className="mt-7">
        <Button
          onClick={() => {
            add(product.id, qty, note);
            onClose();
          }}
          disabled={!product.available}
          size="lg"
          className="w-full"
        >
          Adicionar {qty > 1 ? `${qty} · ` : ''}
          {formatPrice(product.price * qty)}
        </Button>
      </div>
    </>
  );
}

/**
 * `product` continua preenchido enquanto o painel anima a saída — quem
 * controla a visibilidade é `open`. Sem isso o conteúdo some antes de o
 * modal terminar de fechar.
 */
export default function ProductModal({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!product) return null;

  return (
    <Sheet open={open} onClose={onClose} title={product.name} centered>
      <ModalBody key={product.id} product={product} onClose={onClose} />
    </Sheet>
  );
}
