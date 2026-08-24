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
      <div className="relative -mx-6 -mt-5 mb-5 aspect-[16/10] overflow-hidden">
        <ProductImage product={product} sizes="(max-width: 640px) 100vw, 42rem" priority />
      </div>

      <p className="text-3xl font-extrabold text-gold">{formatPrice(product.price)}</p>

      {product.description && (
        <p className="mt-3 leading-relaxed text-muted">{product.description}</p>
      )}

      {!product.available && (
        <p className="mt-4 rounded-2xl bg-ember-deep/40 px-4 py-3 text-sm font-bold text-gold">
          Este item está esgotado no momento.
        </p>
      )}

      <div className="mt-6">
        <span id="qty-label" className="mb-2 block text-sm font-bold text-cream">
          Quantidade
        </span>
        <div
          role="group"
          aria-labelledby="qty-label"
          className="flex w-fit items-center gap-1 rounded-full bg-ink-3 p-1.5 ring-1 ring-inset ring-flame/25"
        >
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Diminuir quantidade"
            className="grid h-10 w-10 place-items-center rounded-full text-xl font-bold text-gold transition-colors hover:bg-flame/20"
          >
            −
          </button>
          <span aria-live="polite" className="w-10 text-center text-lg font-extrabold text-cream">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(30, q + 1))}
            aria-label="Aumentar quantidade"
            className="grid h-10 w-10 place-items-center rounded-full text-xl font-bold text-gold transition-colors hover:bg-flame/20"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="obs" className="mb-2 block text-sm font-bold text-cream">
          Observações <span className="font-normal text-muted">(opcional)</span>
        </label>
        <textarea
          id="obs"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={280}
          placeholder="Ex.: sem cebola, capricha no bacon, ponto da carne…"
          className="w-full resize-none rounded-2xl bg-ink-3 px-4 py-3 text-sm text-cream placeholder:text-muted/55 ring-1 ring-inset ring-flame/25 focus:ring-2 focus:ring-gold"
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
