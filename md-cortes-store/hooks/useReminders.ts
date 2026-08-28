"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { isReminderDue, msUntilNextCheck } from "@/lib/reminders";
import { BRAND } from "@/lib/brand";

/**
 * Relógio do lembrete enquanto o app está aberto.
 *
 * A regra de quando avisar mora em lib/reminders.ts e é a mesma usada pela
 * rota de Web Push — assim o aviso na tela e o aviso no celular nunca
 * discordam. Aqui só se decide *mostrar*, e o horário do aviso é gravado para
 * o próximo contar a partir dele.
 */
export function useReminders() {
  const ready = useStore((s) => s.ready);
  const settings = useStore((s) => s.settings);
  const saveSettings = useStore((s) => s.saveSettings);
  const [aberto, setAberto] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = {
    enabled: settings.remindersEnabled,
    intervalMinutes: settings.reminderIntervalMinutes,
    quietStart: settings.quietStart,
    quietEnd: settings.quietEnd,
  };
  const atividade = {
    lastSaleAt: settings.lastSaleAt,
    lastStockUpdateAt: settings.lastStockUpdateAt,
    lastReminderAt: settings.lastReminderAt,
  };

  const mostrarNoSistema = useCallback(async () => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    try {
      const registro = await navigator.serviceWorker.ready;
      await registro.showNotification(BRAND.name, {
        body: settings.reminderMessage,
        icon: BRAND.logo.icon192,
        badge: BRAND.logo.icon192,
        tag: "lembrete-md",
        data: { url: "/venda" },
      });
    } catch {
      // Aparelho sem suporte: o aviso dentro do app já cobre.
    }
  }, [settings.reminderMessage]);

  useEffect(() => {
    if (!ready || aberto) return;
    if (!settings.remindersEnabled) return;

    const checar = () => {
      if (isReminderDue(config, atividade)) {
        setAberto(true);
        void mostrarNoSistema();
        return;
      }
      timer.current = setTimeout(checar, msUntilNextCheck(config, atividade));
    };

    checar();
    const aoVoltar = () => {
      if (document.visibilityState === "visible") checar();
    };
    document.addEventListener("visibilitychange", aoVoltar);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
    // As dependências são os campos que mudam o cálculo do próximo lembrete.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ready,
    aberto,
    settings.remindersEnabled,
    settings.reminderIntervalMinutes,
    settings.quietStart,
    settings.quietEnd,
    settings.lastSaleAt,
    settings.lastStockUpdateAt,
    settings.lastReminderAt,
    mostrarNoSistema,
  ]);

  const dispensar = useCallback(() => {
    setAberto(false);
    void saveSettings({ lastReminderAt: new Date().toISOString() });
  }, [saveSettings]);

  return { aberto, dispensar, mensagem: settings.reminderMessage };
}
