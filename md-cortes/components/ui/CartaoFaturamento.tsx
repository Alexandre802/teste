'use client';

import { motion } from 'framer-motion';
import { ContadorAnimado } from './AnimatedCounter';
import { Icone } from './Icone';
import { Minigrafico } from '@/components/graficos/Minigrafico';
import { moeda } from '@/lib/format';

interface Props {
  rotulo: string;
  valor: number;
  serie: number[];
  ordem?: number;
}

/** A faixa larga do faturamento, com a linha da semana ao lado. */
export function CartaoFaturamento({ rotulo, valor, serie, ordem = 3 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: ordem * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="cartao-ouro flex items-center gap-3.5 p-4"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ouro/35 bg-ouro/10 text-ouro">
        <Icone nome="dinheiro" tamanho={23} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[0.8rem] text-fumaca">{rotulo}</p>
        <ContadorAnimado
          valor={valor}
          formatar={moeda}
          className="numero mt-1 block text-[1.55rem] font-extrabold text-ouro-claro"
        />
      </div>

      <div className="shrink-0 opacity-90">
        <Minigrafico valores={serie} />
      </div>
    </motion.div>
  );
}
