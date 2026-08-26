'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type TipoToast = 'sucesso' | 'erro' | 'aviso';

export interface Toast {
  id: string;
  tipo: TipoToast;
  titulo: string;
  descricao?: string;
}

interface ValorToasts {
  toasts: Toast[];
  mostrar: (toast: Omit<Toast, 'id'>) => void;
  fechar: (id: string) => void;
}

const Contexto = createContext<ValorToasts | null>(null);

/** Quanto tempo cada aviso fica na tela antes de sair sozinho. */
const DURACAO = 4200;

export function ProvedorDeToasts({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const temporizadores = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const fechar = useCallback((id: string) => {
    setToasts((atual) => atual.filter((t) => t.id !== id));
    const t = temporizadores.current.get(id);
    if (t) {
      clearTimeout(t);
      temporizadores.current.delete(id);
    }
  }, []);

  const mostrar = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      // No máximo três de cada vez: mais que isso vira parede em tela de celular.
      setToasts((atual) => [...atual.slice(-2), { ...toast, id }]);
      temporizadores.current.set(
        id,
        setTimeout(() => fechar(id), DURACAO),
      );
    },
    [fechar],
  );

  const valor = useMemo(() => ({ toasts, mostrar, fechar }), [toasts, mostrar, fechar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useToasts(): ValorToasts {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useToasts precisa estar dentro de <ProvedorDeToasts>.');
  return valor;
}
