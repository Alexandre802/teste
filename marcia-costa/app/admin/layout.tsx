import type { Metadata } from "next";

import { CascaAdmin } from "@/components/admin/CascaAdmin";
import { usuarioDoPainel } from "@/lib/supabase/server";
import { supabaseConfigurado } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Fluxo de caixa",
  robots: { index: false, follow: false },
};

const ROTULO_PAPEL = {
  owner: "Proprietária",
  manager: "Gerente",
  cashier: "Caixa",
} as const;

/**
 * Segundo portão de acesso: o proxy.ts já barrou quem não tem sessão, e aqui
 * conferimos de novo, no servidor, se o usuário está mesmo liberado no painel.
 * A RLS confere pela terceira vez, no banco.
 *
 * O login e a tela de configuração ficam fora dessa casca, e por isso têm
 * layout próprio dentro de cada page.
 */
export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!supabaseConfigurado) {
    return <>{children}</>;
  }

  const usuario = await usuarioDoPainel();

  // Sem sessão, o proxy.ts já redirecionou; se chegou aqui sem usuário é
  // porque estamos na própria tela de login.
  if (!usuario) {
    return <>{children}</>;
  }

  return (
    <CascaAdmin nome={usuario.nome} papel={ROTULO_PAPEL[usuario.role]}>
      {children}
    </CascaAdmin>
  );
}

export const dynamic = "force-dynamic";
