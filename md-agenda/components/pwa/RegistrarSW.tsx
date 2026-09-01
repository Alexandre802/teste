'use client'

import { useEffect } from 'react'

/**
 * Registro do service worker e atualização.
 *
 * Nova versão publicada precisa chegar sozinha: procuramos atualização ao
 * abrir, ao voltar do segundo plano e ao recuperar a conexão. Quando o novo
 * worker assume, a página recarrega uma vez — ninguém precisa reinstalar o PWA.
 */
export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    let registration: ServiceWorkerRegistration | null = null
    let refreshing = false

    // Na primeira visita o worker assume o controle sozinho (clients.claim) e
    // isso dispara controllerchange. Recarregar aí interromperia a navegação
    // em curso — só recarregamos quando a página JÁ era controlada e o
    // controlador trocou, que é o caso de versão nova publicada.
    const eraControlada = Boolean(navigator.serviceWorker.controller)

    function onControllerChange() {
      if (!eraControlada || refreshing) return
      refreshing = true
      window.location.reload()
    }

    function checkForUpdate() {
      if (document.visibilityState !== 'visible') return
      void registration?.update()
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((current) => {
        registration = current
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

        current.addEventListener('updatefound', () => {
          const installing = current.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            // Só assume quando já existe um controlador: na primeira visita o
            // recarregamento seria visível sem motivo.
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              installing.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      })
      .catch(() => {
        // Sem service worker o site continua funcionando online.
      })

    document.addEventListener('visibilitychange', checkForUpdate)
    window.addEventListener('online', checkForUpdate)

    return () => {
      document.removeEventListener('visibilitychange', checkForUpdate)
      window.removeEventListener('online', checkForUpdate)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  return null
}
