'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import Link from 'next/link';
import { Bell, X } from 'lucide-react';
import { reais } from '@/lib/admin/dinheiro';
import type { Pedido } from '@/lib/admin/tipos';
import { useSessao } from './SessaoProvider';
import { preferenciaSom } from './preferencias';
import { tocarAvisoDePedido } from './som';

/**
 * Pedido novo, ao vivo.
 *
 * Assina a inserção em `comida_caseira_orders` pelo Realtime do Supabase.
 * Quando entra pedido, três coisas acontecem:
 *
 *   1. um aviso aparece no canto, com número e valor;
 *   2. toca o som, se a pessoa tiver ligado nas Configurações;
 *   3. `versao` avança — as telas que dependem dela recarregam sozinhas,
 *      sem ninguém precisar puxar para atualizar.
 *
 * A preferência do som mora no aparelho, não no banco (ver `preferencias.ts`).
 */

interface AoVivo {
  /** Avança a cada pedido novo. Sirva de dependência para recarregar listas. */
  versao: number;
  avisos: Pedido[];
  dispensar: (id: string) => void;
  somLigado: boolean;
  alternarSom: (ligado: boolean) => void;
  /** Falso quando o canal caiu ou nunca conectou. */
  conectado: boolean;
}

const Contexto = createContext<AoVivo | null>(null);

export function PedidosAoVivoProvider({ children }: { children: React.ReactNode }) {
  const { supabase, autorizado } = useSessao();
  const [versao, setVersao] = useState(0);
  const [avisos, setAvisos] = useState<Pedido[]>([]);
  const [conectado, setConectado] = useState(false);

  const somLigado = useSyncExternalStore(
    preferenciaSom.inscrever,
    preferenciaSom.ler,
    preferenciaSom.lerNoServidor,
  );

  const alternarSom = useCallback((ligado: boolean) => preferenciaSom.gravar(ligado), []);

  useEffect(() => {
    if (!supabase || !autorizado) return;

    const canal = supabase
      .channel('comida-caseira-pedidos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comida_caseira_orders' },
        (payload) => {
          const pedido = payload.new as Pedido;
          setVersao((v) => v + 1);
          // no máximo três avisos na tela: uma pilha de dez tapa o painel
          setAvisos((atuais) => [pedido, ...atuais].slice(0, 3));
          if (somLigado) void tocarAvisoDePedido();
        },
      )
      .subscribe((status) => setConectado(status === 'SUBSCRIBED'));

    return () => {
      void supabase.removeChannel(canal);
      setConectado(false);
    };
  }, [supabase, autorizado, somLigado]);

  const dispensar = useCallback((id: string) => {
    setAvisos((atuais) => atuais.filter((a) => a.id !== id));
  }, []);

  const valor = useMemo<AoVivo>(
    () => ({ versao, avisos, dispensar, somLigado, alternarSom, conectado }),
    [versao, avisos, dispensar, somLigado, alternarSom, conectado],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      <AvisosDePedido avisos={avisos} aoDispensar={dispensar} />
    </Contexto.Provider>
  );
}

export function useAoVivo(): AoVivo {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useAoVivo precisa estar dentro de <PedidosAoVivoProvider>');
  return ctx;
}

/**
 * Os avisos.
 *
 * Ficam acima da barra de navegação do celular (`bottom-24`), senão o último
 * aviso cobre justamente o botão "Pedidos" que a pessoa quer tocar.
 */
function AvisosDePedido({
  avisos,
  aoDispensar,
}: {
  avisos: Pedido[];
  aoDispensar: (id: string) => void;
}) {
  if (avisos.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-24 z-[110] flex flex-col gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-80"
    >
      {avisos.map((pedido) => (
        <div
          key={pedido.id}
          className="pointer-events-auto flex items-center gap-3 rounded-xl border border-[var(--admin-borda)] bg-white p-3 shadow-lg"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--admin-laranja-claro)] text-[var(--admin-laranja)]">
            <Bell className="h-4 w-4" aria-hidden />
          </span>

          <Link
            href={`/admin/pedidos/${pedido.id}`}
            onClick={() => aoDispensar(pedido.id)}
            className="min-w-0 flex-1"
          >
            <p className="text-sm font-bold text-[var(--admin-tinta)]">
              Novo pedido #{pedido.order_number}
            </p>
            <p className="text-sm text-[var(--admin-tinta-suave)]">{reais(pedido.total_cents)}</p>
          </Link>

          <button
            type="button"
            onClick={() => aoDispensar(pedido.id)}
            aria-label={`Dispensar aviso do pedido ${pedido.order_number}`}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
