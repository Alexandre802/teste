import type { Aparencia } from '@/lib/admin/rotulos';

/** Etiqueta de status. Cor e texto vêm juntos de `lib/admin/rotulos`. */
export function Pilula({ aparencia, className = '' }: { aparencia: Aparencia; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${aparencia.classe} ${className}`}
    >
      {aparencia.rotulo}
    </span>
  );
}
