'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

interface EventoDeInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Caminho base quando o site é publicado em subpasta (GitHub Pages). */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const semAssinatura = () => () => {};

/**
 * Instalação na tela de início.
 *
 * O Chrome no Android guarda o evento `beforeinstallprompt` e deixa a gente
 * abrir o convite na hora certa. O Safari do iPhone não tem esse evento: lá o
 * caminho é Compartilhar → Adicionar à Tela de Início, e o app explica isso.
 *
 * O que já é verdade no navegador — se o app está aberto em modo aplicativo,
 * se o aparelho é iPhone — é lido com `useSyncExternalStore` em vez de efeito:
 * assim a build estática e a hidratação combinam, sem um quadro piscando com o
 * valor errado.
 */
export function useInstalacao() {
  const [evento, setEvento] = useState<EventoDeInstalacao | null>(null);
  const [instalouAgora, setInstalouAgora] = useState(false);

  const abertoComoApp = useSyncExternalStore(
    (avisar) => {
      const consulta = window.matchMedia('(display-mode: standalone)');
      consulta.addEventListener('change', avisar);
      return () => consulta.removeEventListener('change', avisar);
    },
    () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true,
    () => false,
  );

  const ehIos = useSyncExternalStore(
    semAssinatura,
    () => /iphone|ipad|ipod/i.test(window.navigator.userAgent),
    () => false,
  );

  useEffect(() => {
    const capturar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoDeInstalacao);
    };
    const instalou = () => {
      setInstalouAgora(true);
      setEvento(null);
    };
    window.addEventListener('beforeinstallprompt', capturar);
    window.addEventListener('appinstalled', instalou);
    return () => {
      window.removeEventListener('beforeinstallprompt', capturar);
      window.removeEventListener('appinstalled', instalou);
    };
  }, []);

  const instalar = useCallback(async () => {
    if (!evento) return false;
    await evento.prompt();
    const escolha = await evento.userChoice;
    if (escolha.outcome === 'accepted') setInstalouAgora(true);
    setEvento(null);
    return escolha.outcome === 'accepted';
  }, [evento]);

  return {
    podeInstalar: Boolean(evento),
    instalado: abertoComoApp || instalouAgora,
    ehIos,
    instalar,
  };
}

/** Registra o service worker. Sem ele não há instalação nem uso offline. */
export function useServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    // file:// não permite service worker — o app continua funcionando, só não instala.
    if (window.location.protocol === 'file:') return;
    const registrar = () => {
      navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` }).catch(() => {
        /* navegador sem permissão, aba privada: o app segue normalmente. */
      });
    };
    if (document.readyState === 'complete') registrar();
    else window.addEventListener('load', registrar, { once: true });
  }, []);
}

export type EstadoDoAviso = 'indisponivel' | 'negado' | 'permitido' | 'pendente';

function lerPermissao(): EstadoDoAviso {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'indisponivel';
  const atual = Notification.permission;
  return atual === 'granted' ? 'permitido' : atual === 'denied' ? 'negado' : 'pendente';
}

/**
 * Avisos do sistema operacional.
 *
 * Sem servidor próprio não há Web Push de verdade (ele exige uma chave VAPID
 * guardada fora do navegador e alguém para disparar a mensagem). O que dá para
 * fazer sem hospedagem, e é o que está aqui, é o aviso local: com a permissão
 * concedida, o service worker mostra a notificação assim que o corte chega pelo
 * Realtime, mesmo com o app em segundo plano no mesmo aparelho.
 *
 * A estrutura já está pronta para o Push de verdade: quando existir um servidor,
 * basta assinar `pushManager.subscribe` com a chave VAPID e o `sw.js` já tem o
 * ouvinte de `push` esperando.
 */
export function useAvisosDoSistema() {
  // O navegador não emite evento quando a permissão muda, então a releitura é
  // provocada por esta versão, que só o próprio pedido incrementa.
  const [versao, setVersao] = useState(0);

  const estado = useSyncExternalStore(
    semAssinatura,
    // A versão entra na chave da leitura: sem ela, o snapshot ficaria congelado.
    () => `${versao}:${lerPermissao()}`,
    () => '0:indisponivel',
  ).split(':')[1] as EstadoDoAviso;

  const pedirPermissao = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      const resposta = await Notification.requestPermission();
      setVersao((v) => v + 1);
      return resposta === 'granted';
    } catch {
      return false;
    }
  }, []);

  const avisar = useCallback(
    async (titulo: string, corpo: string) => {
      if (estado !== 'permitido' || typeof window === 'undefined') return;
      try {
        const registro = await navigator.serviceWorker?.ready;
        if (registro) {
          await registro.showNotification(titulo, {
            body: corpo,
            icon: `${BASE}/icones/icone-192.png`,
            badge: `${BASE}/icones/badge-72.png`,
            tag: 'md-cortes-novo-corte',
            // Um corte não é urgente a ponto de vibrar por cima de tudo.
            silent: false,
          });
        }
      } catch {
        /* sem service worker pronto: o toast dentro do app já cobriu o aviso. */
      }
    },
    [estado],
  );

  return { estado, pedirPermissao, avisar };
}
