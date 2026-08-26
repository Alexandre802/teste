'use client';

import { motion } from 'framer-motion';
import { Icone, type NomeDoIcone } from './Icone';
import { ContadorAnimado } from './AnimatedCounter';

interface Props {
  rotulo: string;
  valor: number;
  /** Sem isso o número sai inteiro. Passe `moeda` para faturamento. */
  formatar?: (n: number) => string;
  unidade?: string;
  icone: NomeDoIcone;
  /** Índice na grade — escalona a entrada dos cartões. */
  ordem?: number;
  destaque?: boolean;
}

/**
 * O quadradinho de indicador do topo do painel: rótulo pequeno, número grande,
 * unidade embaixo. É a peça que mais se repete no app.
 */
export function CartaoIndicador({
  rotulo,
  valor,
  formatar,
  unidade,
  icone,
  ordem = 0,
  destaque = false,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: ordem * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`${destaque ? 'cartao-ouro' : 'cartao'} flex flex-col gap-2 p-3.5`}
    >
      <span className="flex items-start gap-1.5 text-[0.78rem] leading-tight font-medium text-fumaca">
        <Icone nome={icone} tamanho={15} className="mt-px shrink-0 text-ouro" />
        <span>{rotulo}</span>
      </span>
      <ContadorAnimado
        valor={valor}
        formatar={formatar}
        className={`numero text-[1.9rem] font-extrabold ${destaque ? 'texto-ouro' : 'text-neve'}`}
      />
      {unidade ? (
        <span className="-mt-1 text-[0.78rem] text-fumaca-fraca">{unidade}</span>
      ) : null}
    </motion.div>
  );
}
