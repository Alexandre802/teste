import type { SVGProps } from 'react';

/**
 * Conjunto de ícones do MD_cortes.
 *
 * Desenhados aqui em vez de virem de uma biblioteca: são poucos, o traço fica
 * igual em todos, e o app não carrega um pacote inteiro no 4G da barbearia.
 * Todos usam a mesma grade de 24, traço de 1.75 e pontas arredondadas.
 */

export type NomeDoIcone =
  | 'calendario'
  | 'semana'
  | 'barras'
  | 'dinheiro'
  | 'tesoura'
  | 'barba'
  | 'navalha'
  | 'pente'
  | 'mais'
  | 'seta-direita'
  | 'seta-esquerda'
  | 'seta-baixo'
  | 'casa'
  | 'lista'
  | 'pessoa'
  | 'equipe'
  | 'sino'
  | 'olho'
  | 'olho-fechado'
  | 'cadeado'
  | 'usuario'
  | 'check'
  | 'alerta'
  | 'fechar'
  | 'filtro'
  | 'sair'
  | 'nuvem'
  | 'celular'
  | 'escudo'
  | 'coroa'
  | 'relogio';

const TRACOS: Record<NomeDoIcone, React.ReactNode> = {
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </>
  ),
  semana: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18M8 14h3" />
    </>
  ),
  barras: <path d="M5 20V11M12 20V4M19 20v-6" />,
  dinheiro: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M14.6 9.4A2.4 2.4 0 0 0 12.4 8h-.8a2 2 0 0 0 0 4h.8a2 2 0 0 1 0 4h-.8a2.4 2.4 0 0 1-2.2-1.4" />
    </>
  ),
  tesoura: (
    <>
      <circle cx="6.5" cy="18" r="2.6" />
      <circle cx="17.5" cy="18" r="2.6" />
      <path d="M8.4 16.1 18.5 3.5M15.6 16.1 5.5 3.5" />
    </>
  ),
  barba: (
    <>
      <path d="M5.5 4.5c0 4 .2 7.4.9 9.6C7.2 17 9.3 19 12 19s4.8-2 5.6-4.9c.7-2.2.9-5.6.9-9.6" />
      <path d="M9 10.5c1.3-.7 4.7-.7 6 0" />
      <path d="M10.2 14.8c.9.6 2.7.6 3.6 0" />
    </>
  ),
  navalha: (
    <>
      <path d="M8.6 16.4 18.7 6.3a2.4 2.4 0 0 0-3.4-3.4L5.2 13z" />
      <path d="m7.4 17.6-4 4" />
    </>
  ),
  pente: (
    <>
      <path d="M3.5 6.5h17v3.6h-17z" />
      <path d="M6.5 10.1v6M10 10.1v6M14 10.1v6M17.5 10.1v6" />
    </>
  ),
  mais: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8.5v7M8.5 12h7" />
    </>
  ),
  'seta-direita': <path d="m9 5 7 7-7 7" />,
  'seta-esquerda': <path d="m15 5-7 7 7 7" />,
  'seta-baixo': <path d="m6 9 6 6 6-6" />,
  casa: <path d="M4 10.5 12 4l8 6.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />,
  lista: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  pessoa: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  equipe: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19.5a6 6 0 0 1 12 0" />
      <path d="M16 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.4a6 6 0 0 1 3.5 5.1" />
    </>
  ),
  sino: (
    <>
      <path d="M18 9a6 6 0 1 0-12 0c0 4.5-1.5 5.5-1.5 5.5h15S18 13.5 18 9" />
      <path d="M10.3 18a2 2 0 0 0 3.4 0" />
    </>
  ),
  olho: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'olho-fechado': (
    <>
      <path d="M4 4.5 20 19.5" />
      <path d="M9.8 6.1A8.6 8.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.2 3.9M6.3 8.2A17.6 17.6 0 0 0 2.5 12S6 18.5 12 18.5c1 0 1.9-.2 2.7-.5" />
    </>
  ),
  cadeado: (
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="3" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="2.8" />
      <path d="M6.8 18.5a6 6 0 0 1 10.4 0" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alerta: (
    <>
      <path d="M12 3.8 21 19.5H3z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  filtro: <path d="M3.5 5.5h17l-6.5 7.6V20l-4-2.2v-4.7z" />,
  sair: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h11" />,
  nuvem: (
    <>
      <path d="M7 18.5a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17.3 9.8 3.8 3.8 0 0 1 17 18.5" />
      <path d="M12 20v-8M9.2 14.2 12 11.4l2.8 2.8" />
    </>
  ),
  celular: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M10.8 18.5h2.4" />
    </>
  ),
  escudo: (
    <>
      <path d="M12 3.2 19 6v5.5c0 4.3-2.9 7.4-7 9.3-4.1-1.9-7-5-7-9.3V6z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  coroa: <path d="M4 17.5h16M4.5 7l3.6 3.4L12 5l3.9 5.4L19.5 7l-1.3 8.5H5.8z" />,
  relogio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.4l3.4 2" />
    </>
  ),
};

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  nome: NomeDoIcone;
  tamanho?: number;
  /** Ícones cheios (check dentro de círculo, por exemplo) preferem preenchimento. */
  preenchido?: boolean;
}

export function Icone({ nome, tamanho = 20, preenchido = false, ...resto }: Props) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill={preenchido ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...resto}
    >
      {TRACOS[nome]}
    </svg>
  );
}

/** Escolhe o ícone que combina com o serviço lançado. */
export function iconeDoServico(servico: string): NomeDoIcone {
  const s = servico.toLowerCase();
  if (s.includes('barba')) return s.includes('corte') || s.includes('+') ? 'navalha' : 'barba';
  if (s.includes('sobrancelha') || s.includes('acabamento')) return 'pente';
  return 'tesoura';
}
