import type { ReactNode } from 'react';
import { Icone, type NomeDoIcone } from './Icone';

interface Props {
  icone?: NomeDoIcone;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

/** O que a tela mostra quando ainda não há nada — nunca um painel quebrado. */
export function EstadoVazio({ icone = 'tesoura', titulo, descricao, acao }: Props) {
  return (
    <div className="flex flex-col items-center px-6 py-9 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ouro/20 bg-ouro/5 text-ouro">
        <Icone nome={icone} tamanho={24} />
      </span>
      <p className="mt-3.5 text-[0.95rem] font-semibold text-neve">{titulo}</p>
      {descricao ? (
        <p className="mt-1 max-w-[16rem] text-[0.82rem] leading-snug text-fumaca">{descricao}</p>
      ) : null}
      {acao ? <div className="mt-4">{acao}</div> : null}
    </div>
  );
}
