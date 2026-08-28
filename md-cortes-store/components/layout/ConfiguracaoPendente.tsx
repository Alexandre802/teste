import { Database } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

/**
 * Sem Supabase configurado o app não entra. Não existe login de mentira aqui:
 * ou a chave está no ambiente, ou a tela explica o que falta.
 */
export function ConfiguracaoPendente() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-branco px-6 text-center">
      <Logo size={92} priority />
      <span className="flex size-12 items-center justify-center rounded-full bg-ouro-suave text-ouro">
        <Database size={22} />
      </span>
      <div className="max-w-sm">
        <h1 className="text-[19px] font-bold text-tinta">Falta conectar o banco de dados</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-cinza">
          Defina <code className="rounded bg-areia px-1.5 py-0.5 text-[13px]">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
          <code className="rounded bg-areia px-1.5 py-0.5 text-[13px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no
          ambiente e rode as migrações de <code className="rounded bg-areia px-1.5 py-0.5 text-[13px]">supabase/migrations</code>.
          O passo a passo está no README.
        </p>
      </div>
    </div>
  );
}
