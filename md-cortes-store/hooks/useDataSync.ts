"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";

/**
 * Liga o estado local ao Supabase.
 *
 * Ordem: espelho local primeiro (a tela abre com dados na hora), depois a
 * sincronização. Enquanto isso, três gatilhos mantêm tudo em dia sem refresh
 * manual: mudança no banco (tempo real), volta da conexão e volta do app para
 * o primeiro plano — que é o caso comum de quem deixa o app aberto o dia todo.
 */
export function useDataSync(user: User | null) {
  const hydrate = useStore((s) => s.hydrate);
  const attach = useStore((s) => s.attach);
  const setOnline = useStore((s) => s.setOnline);
  const sync = useStore((s) => s.sync);
  const ready = useStore((s) => s.ready);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const supabase = getSupabase();
    attach(supabase, user?.id ?? null);
    if (ready && user) void sync();
  }, [attach, sync, ready, user]);

  useEffect(() => {
    const online = () => setOnline(true);
    const offline = () => setOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, [setOnline]);

  useEffect(() => {
    if (!user) return;
    const aoVoltar = () => {
      if (document.visibilityState === "visible") void sync({ silent: true });
    };
    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("focus", aoVoltar);
    return () => {
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("focus", aoVoltar);
    };
  }, [sync, user]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !user) return;

    let agendado: ReturnType<typeof setTimeout> | null = null;
    const aoMudar = () => {
      if (agendado) clearTimeout(agendado);
      // Uma venda dispara vários eventos (venda, itens, estoque): espera o
      // último antes de recarregar, em vez de recarregar quatro vezes.
      agendado = setTimeout(() => void sync({ silent: true }), 600);
    };

    const canal = supabase
      .channel("md-cortes-store")
      .on("postgres_changes", { event: "*", schema: "public", filter: `user_id=eq.${user.id}` }, aoMudar)
      .subscribe();

    return () => {
      if (agendado) clearTimeout(agendado);
      void supabase.removeChannel(canal);
    };
  }, [sync, user]);
}
