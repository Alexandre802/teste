'use client';

/**
 * Cartão de horários.
 *
 * O selo ABERTO/FECHADO é calculado a partir de data/businessHours.ts, no fuso
 * da unidade, e só depois da montagem — o horário do servidor não pinta a
 * primeira renderização (evita descompasso de hidratação) e o relógio do
 * visitante não muda o resultado.
 *
 * Enquanto o horário de abertura não estiver confirmado no arquivo de dados, o
 * cartão mostra o fechamento confirmado e um caminho para confirmar no
 * WhatsApp, em vez de afirmar que está aberto agora.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { mensagens, whatsapp } from '@/data/academy';
import { estadoAgora, horarios, notaHorario, ordemDias, rotulosDia, type EstadoAgora } from '@/data/businessHours';
import { cn } from '@/lib/utils';

const textoDia = (abre: string | null, fecha: string | null, fechado?: boolean) => {
  if (fechado) return 'Fechado';
  const fim = fecha === '00:00' ? 'meia-noite' : fecha;
  if (abre && fecha) return `${abre} — ${fim}`;
  if (fecha) return `até ${fim}`;
  return 'a confirmar';
};

export function Hours({ className }: { className?: string }) {
  const [situacao, setSituacao] = useState<EstadoAgora | null>(null);

  useEffect(() => {
    const atualizar = () => setSituacao(estadoAgora());
    atualizar();
    const relogio = window.setInterval(atualizar, 60_000);
    return () => window.clearInterval(relogio);
  }, []);

  const aberto = situacao?.estado === 'aberto';
  const fechado = situacao?.estado === 'fechado';

  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Clock size={17} className="text-ciano" aria-hidden />
          <h3 className="font-display text-lg font-bold text-white">Horários</h3>
        </div>

        <AnimatePresence mode="wait">
          <motion.span
            key={situacao?.estado ?? 'carregando'}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.1em]',
              aberto && 'border-lima/40 bg-lima/10 text-lima',
              fechado && 'border-white/15 bg-white/5 text-cinza',
              !aberto && !fechado && 'border-ciano/30 bg-ciano/10 text-ciano',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                aberto ? 'bg-lima shadow-[0_0_8px_var(--color-lima)]' : 'bg-current',
              )}
            />
            {aberto ? 'Aberto agora' : fechado ? 'Fechado agora' : notaHorario}
          </motion.span>
        </AnimatePresence>
      </div>

      <ul className="mt-5 divide-y divide-white/6">
        {ordemDias.map((dia) => {
          const horario = horarios[dia];
          return (
            <li key={dia} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm text-white/85">{rotulosDia[dia]}</span>
              <span
                className={cn(
                  'text-sm tabular-nums',
                  horario.abre || horario.fecha ? 'text-white' : 'text-cinza',
                )}
              >
                {textoDia(horario.abre, horario.fecha, horario.fechado)}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-xs leading-relaxed text-white/45">
        O fechamento à meia-noite é o horário publicado no perfil da academia. Para
        confirmar o horário de abertura do dia em que você pretende treinar,{' '}
        <a
          href={whatsapp(mensagens.horarios)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-white/80 underline decoration-ciano/60 underline-offset-4 hover:text-white"
        >
          chame a equipe no WhatsApp
        </a>
        .
      </p>
    </div>
  );
}
