'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { dados } from '@/lib/data';
import type { Modo } from '@/lib/data/adapter';
import type { Profile } from '@/lib/types';

interface ValorSessao {
  perfil: Profile | null;
  carregando: boolean;
  modo: Modo;
  ehAdmin: boolean;
  entrar: (identificador: string, senha: string) => Promise<Profile>;
  sair: () => Promise<void>;
}

const Contexto = createContext<ValorSessao | null>(null);

export function ProvedorDeSessao({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Profile | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    dados
      .sessaoAtual()
      .then((p) => {
        if (vivo) setPerfil(p);
      })
      .catch(() => {
        if (vivo) setPerfil(null);
      })
      .finally(() => {
        if (vivo) setCarregando(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  // A sessão pode cair sem o app pedir: token expirado, saída noutra aba,
  // renovação recusada. Quando isso acontece, o perfil vira null e o portão
  // das telas internas manda a pessoa de volta para o login.
  useEffect(() => {
    if (!dados.aoMudarAutenticacao) return;
    return dados.aoMudarAutenticacao((p) => {
      setPerfil(p);
      setCarregando(false);
    });
  }, []);

  const entrar = useCallback(async (identificador: string, senha: string) => {
    const p = await dados.entrar(identificador, senha);
    setPerfil(p);
    return p;
  }, []);

  const sair = useCallback(async () => {
    await dados.sair();
    setPerfil(null);
  }, []);

  const valor = useMemo<ValorSessao>(
    () => ({
      perfil,
      carregando,
      modo: dados.modo,
      ehAdmin: perfil?.role === 'developer',
      entrar,
      sair,
    }),
    [perfil, carregando, entrar, sair],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessao(): ValorSessao {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useSessao precisa estar dentro de <ProvedorDeSessao>.');
  return valor;
}
