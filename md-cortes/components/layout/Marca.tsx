import { Icone } from '@/components/ui/Icone';

interface Props {
  tamanho?: 'pequeno' | 'medio' | 'grande';
  className?: string;
}

const ESCALA = {
  pequeno: { texto: 'text-[1.05rem]', icone: 18 },
  medio: { texto: 'text-[1.5rem]', icone: 26 },
  grande: { texto: 'text-[2.1rem]', icone: 36 },
} as const;

/** A marca da barbearia: tesoura e o nome em dourado. */
export function Marca({ tamanho = 'pequeno', className = '' }: Props) {
  const e = ESCALA[tamanho];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Icone nome="tesoura" tamanho={e.icone} className="text-ouro" />
      <span className={`texto-ouro font-extrabold tracking-tight ${e.texto}`}>MD_cortes</span>
    </span>
  );
}
