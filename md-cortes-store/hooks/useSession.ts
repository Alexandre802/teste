"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Usuário logado no navegador. `carregando` evita piscar a tela de login. */
export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  // Sem Supabase não há o que carregar: o estado inicial já diz isso, em vez
  // de um setState logo na entrada do efeito.
  const [carregando, setCarregando] = useState(isSupabaseConfigured);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let vivo = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!vivo) return;
      setUser(data.user ?? null);
      setCarregando(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCarregando(false);
    });

    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, carregando };
}
