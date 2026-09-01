"use client";

/** Substitui `next/navigation` no build de demonstração. */
import { navegar, useRota } from "./roteador";

export function useRouter() {
  return {
    push: (destino: string) => navegar(destino),
    replace: (destino: string) => navegar(destino, true),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => {},
    prefetch: () => {},
  };
}

export function usePathname(): string {
  return useRota().caminho;
}

export function useSearchParams(): URLSearchParams {
  return useRota().busca;
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return useRota().parametros as T;
}

export function redirect(destino: string): never {
  navegar(destino, true);
  throw new Error("redirecionado");
}

export function notFound(): never {
  throw new Error("não encontrado");
}
