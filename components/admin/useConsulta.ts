'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useSupabase } from './SessaoProvider';

/**
 * Carregar dados com os quatro estados que uma tela precisa ter.
 *
 * Devolve `dados`, `carregando`, `erro` e `recarregar`. Repetir esses quatro
 * `useState` em cada tela é como uma delas acaba sem tratamento de erro — e
 * uma consulta que falha em silêncio vira "hoje não teve venda".
 *
 * `carregando` é DERIVADO, não um estado próprio: é verdade enquanto o
 * resultado guardado não for o da consulta atual. Ligar um `setCarregando(true)`
 * no início do efeito custaria uma renderização extra a cada troca de filtro,
 * e é justamente o que o React desaconselha.
 *
 * A corrida entre requisições se resolve sozinha por causa disso: se a pessoa
 * troca o filtro rápido, a resposta velha chega com a chave velha e é
 * descartada em vez de sobrescrever a nova na tela.
 */
export function useConsulta<T>(
  consulta: (sb: SupabaseClient) => Promise<T>,
  dependencias: unknown[],
): {
  dados: T | null;
  carregando: boolean;
  erro: string;
  recarregar: () => void;
} {
  const supabase = useSupabase();
  const [gatilho, setGatilho] = useState(0);

  /**
   * Identidade da consulta atual, como texto.
   *
   * Uma string comparada por valor faz o papel da lista de dependências —
   * e permite que a tela informe quantas dependências quiser sem espalhar
   * `eslint-disable` de tamanho de lista por todo lado.
   */
  const chave = `${gatilho}|${JSON.stringify(dependencias)}`;

  const [resultado, setResultado] = useState<{ chave: string; dados: T | null; erro: string }>({
    chave: '',
    dados: null,
    erro: '',
  });

  const recarregar = useCallback(() => setGatilho((g) => g + 1), []);

  useEffect(() => {
    let cancelado = false;

    consulta(supabase)
      .then((dados) => {
        if (!cancelado) setResultado({ chave, dados, erro: '' });
      })
      .catch((e: unknown) => {
        if (cancelado) return;
        setResultado({
          chave,
          dados: null,
          erro: e instanceof Error ? e.message : 'Não foi possível carregar os dados.',
        });
      });

    return () => {
      cancelado = true;
    };
    // `consulta` é recriada a cada renderização; quem controla a repetição é a
    // chave, montada a partir das dependências que a tela informou.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, chave]);

  const carregando = resultado.chave !== chave;

  return {
    // durante o recarregamento os dados anteriores continuam na tela, em vez
    // de piscar vazio a cada troca de filtro
    dados: resultado.dados,
    carregando,
    erro: carregando ? '' : resultado.erro,
    recarregar,
  };
}
