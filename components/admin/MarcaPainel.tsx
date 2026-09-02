import { ChefHat } from 'lucide-react';

/**
 * Marca do painel.
 *
 * Símbolo neutro de propósito. A logomarca da casa é um arquivo que a
 * proprietária ainda vai enviar (Configurações → Dados da empresa); até lá,
 * este selo ocupa o lugar sem inventar identidade visual e sem pegar
 * emprestada a de outro projeto.
 */
export default function MarcaPainel({
  tamanho = 'normal',
}: {
  tamanho?: 'normal' | 'grande';
}) {
  const medidas = tamanho === 'grande' ? 'h-14 w-14 rounded-2xl' : 'h-9 w-9 rounded-xl';
  const icone = tamanho === 'grande' ? 'h-7 w-7' : 'h-5 w-5';

  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center bg-[var(--admin-laranja)] text-white shadow-sm ${medidas}`}
    >
      <ChefHat className={icone} />
    </span>
  );
}
