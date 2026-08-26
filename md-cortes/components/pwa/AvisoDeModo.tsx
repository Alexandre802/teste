'use client';

import { Icone } from '@/components/ui/Icone';
import { useSessao } from '@/lib/hooks/use-sessao';

/**
 * Diz, sem rodeio, onde os dados estão.
 *
 * No modo local o app funciona inteiro, mas guarda tudo num aparelho só — e
 * quem estiver usando precisa saber disso antes de contar com o histórico.
 */
export function AvisoDeModo() {
  const { modo } = useSessao();
  if (modo === 'nuvem') return null;

  return (
    <p className="flex items-start gap-2.5 rounded-2xl border border-grafite bg-carvao/70 px-3.5 py-3 text-[0.76rem] leading-snug text-fumaca-fraca">
      <Icone nome="celular" tamanho={15} className="mt-0.5 shrink-0 text-ouro/70" />
      <span>
        <strong className="font-semibold text-fumaca">Modo local.</strong> Os lançamentos ficam
        guardados só neste aparelho. Para que o Maicon acompanhe em tempo real do celular dele,
        configure o Supabase — o passo a passo está no README do projeto.
      </span>
    </p>
  );
}
