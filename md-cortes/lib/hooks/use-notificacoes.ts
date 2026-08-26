'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dados } from '@/lib/data';
import type { AppNotification } from '@/lib/types';

export interface RetornoNotificacoes {
  notificacoes: AppNotification[];
  naoLidas: number;
  carregando: boolean;
  marcarLida: (id: string) => Promise<void>;
  marcarTodasLidas: () => Promise<void>;
}

const VAZIA: AppNotification[] = [];

/**
 * A caixa de entrada do Maicon.
 *
 * @param ativo     só carrega para quem tem caixa (o desenvolvedor).
 * @param aoChegar  chamado quando uma notificação nova entra pelo tempo real —
 *                  é o gancho do toast e do aviso do sistema operacional.
 */
export function useNotificacoes({
  ativo = true,
  aoChegar,
}: { ativo?: boolean; aoChegar?: (n: AppNotification) => void } = {}): RetornoNotificacoes {
  const [lista, setLista] = useState<AppNotification[] | null>(null);

  // Guardado numa ref para o efeito de escuta não reassinar a cada render.
  // A escrita fica dentro de um efeito: durante o render, a ref é intocada.
  const aoChegarRef = useRef(aoChegar);
  useEffect(() => {
    aoChegarRef.current = aoChegar;
  }, [aoChegar]);

  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    dados
      .notificacoes()
      .then((n) => {
        if (vivo) setLista(n);
      })
      .catch(() => {
        if (vivo) setLista([]);
      });
    return () => {
      vivo = false;
    };
  }, [ativo]);

  useEffect(() => {
    if (!ativo) return;
    return dados.escutar({
      aoNotificar: (nova) => {
        let inedita = false;
        setLista((atual) => {
          const base = atual ?? [];
          if (base.some((n) => n.id === nova.id)) return atual;
          inedita = true;
          return [nova, ...base];
        });
        // O aviso só dispara para notificação que ainda não estava na lista;
        // recarregar a aba não pode fazer o toast tocar de novo.
        if (inedita) aoChegarRef.current?.(nova);
      },
    });
  }, [ativo]);

  const marcarLida = useCallback(async (id: string) => {
    setLista((atual) => atual?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? atual);
    try {
      await dados.marcarLida(id);
    } catch {
      setLista((atual) => atual?.map((n) => (n.id === id ? { ...n, read: false } : n)) ?? atual);
    }
  }, []);

  const marcarTodasLidas = useCallback(async () => {
    let antes: AppNotification[] | null = null;
    setLista((atual) => {
      antes = atual;
      return atual?.map((n) => ({ ...n, read: true })) ?? atual;
    });
    try {
      await dados.marcarTodasLidas();
    } catch {
      setLista(antes);
    }
  }, []);

  const notificacoes = lista ?? VAZIA;
  const naoLidas = useMemo(
    () => notificacoes.reduce((total, n) => (n.read ? total : total + 1), 0),
    [notificacoes],
  );

  return { notificacoes, naoLidas, carregando: ativo && lista === null, marcarLida, marcarTodasLidas };
}
