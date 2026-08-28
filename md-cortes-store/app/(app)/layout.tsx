"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useDataSync } from "@/hooks/useDataSync";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useStore } from "@/lib/store";
import { BottomNav } from "@/components/layout/BottomNav";
import { ReminderDialog } from "@/components/layout/ReminderDialog";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ConfiguracaoPendente } from "@/components/layout/ConfiguracaoPendente";

/**
 * Casca das telas internas: sessão, sincronização, barra inferior e lembrete.
 *
 * O conteúdo tem largura máxima e fica centralizado — no desktop o app vira um
 * painel, não uma tela de celular esticada.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, carregando } = useSession();

  useServiceWorker();
  useDataSync(user);

  const ready = useStore((s) => s.ready);
  const onboarded = useStore((s) => s.settings.onboarded);
  const lastSyncAt = useStore((s) => s.lastSyncAt);

  useEffect(() => {
    if (!carregando && !user && isSupabaseConfigured) router.replace("/login");
  }, [carregando, user, router]);

  // A boas-vindas só aparece depois da primeira carga do servidor: antes disso
  // "não configurado" pode ser só o espelho local ainda vazio.
  useEffect(() => {
    if (!ready || !user || !lastSyncAt) return;
    if (!onboarded && pathname !== "/bem-vindo") router.replace("/bem-vindo");
  }, [ready, user, lastSyncAt, onboarded, pathname, router]);

  if (!isSupabaseConfigured) return <ConfiguracaoPendente />;

  if (carregando || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-branco">
        <Loader2 className="size-6 animate-spin text-ouro" aria-label="Carregando" />
      </div>
    );
  }

  // A primeira execução é uma tela só: sem barra embaixo, sem lembrete.
  const primeiraExecucao = pathname === "/bem-vindo";

  return (
    <div className="min-h-dvh bg-branco">
      <main
        className="mx-auto w-full max-w-2xl px-4 pt-[env(safe-area-inset-top,0px)] lg:max-w-3xl"
        style={{
          paddingBottom: primeiraExecucao
            ? "calc(var(--area-segura) + 20px)"
            : "calc(var(--altura-barra) + var(--area-segura) + 20px)",
        }}
      >
        {children}
      </main>
      {primeiraExecucao ? null : (
        <>
          <BottomNav />
          <ReminderDialog />
        </>
      )}
    </div>
  );
}
