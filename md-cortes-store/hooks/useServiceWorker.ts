"use client";

import { useEffect } from "react";

/** Registra o service worker (PWA, offline e Web Push). */
export function useServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const registrar = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Sem service worker o app continua funcionando, só perde o modo offline.
      });
    };
    if (document.readyState === "complete") registrar();
    else window.addEventListener("load", registrar, { once: true });
  }, []);
}
