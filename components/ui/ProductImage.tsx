import Image from 'next/image';
import type { Produto } from '@/data/products';
import { fotos, ilustracoes } from '@/data/fotos';
import { icones, type NomeIcone } from './Icons';

/** Que ícone representa a categoria quando ainda não há foto do produto. */
const iconePorCategoria: Record<string, NomeIcone> = {
  'racao-cachorro': 'racao',
  'racao-gato': 'racao',
  'petisco-cachorro': 'petisco',
  'petisco-gato': 'petisco',
  'brinquedo-cachorro': 'brinquedo',
  'brinquedo-gato': 'brinquedo',
  'higiene-cachorro': 'higiene',
  'higiene-gato': 'higiene',
  coleiras: 'coleira',
  camas: 'cama',
  peixes: 'peixe',
  aves: 'ave',
  coelhos: 'coelho',
  repteis: 'reptil',
  saude: 'saude',
};

/**
 * Imagem do produto, em quatro tentativas nesta ordem:
 *   1. o `imagem` escrito à mão em data/products.ts;
 *   2. a foto real em /public/produtos/ com o nome do id do produto;
 *   3. a ilustração da casa em /public/ilustracoes/ (npm run ilustracoes);
 *   4. o placeholder — ícone da categoria e nome do fabricante.
 *
 * A ordem é o que importa: soltar a foto real em /public/produtos faz ela
 * substituir a ilustração na hora, sem apagar nem editar nada.
 */
export default function ProductImage({
  produto,
  sizes = '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px',
  priority = false,
}: {
  produto: Produto;
  sizes?: string;
  priority?: boolean;
}) {
  const src = produto.imagem ?? fotos[produto.id] ?? ilustracoes[produto.id] ?? null;

  if (src) {
    return (
      <Image
        src={src}
        alt={produto.nome}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain"
      />
    );
  }

  const Icone = icones[iconePorCategoria[produto.categoria] ?? 'pata'];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg bg-surface-3 px-2">
      <Icone className="h-10 w-10 text-brand-300" />
      <span className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-brand-300">
        {produto.marca}
      </span>
    </div>
  );
}
