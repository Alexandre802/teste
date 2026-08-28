"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { getSupabase } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    if (senha.length < 8) {
      setErro("A senha precisa de pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As duas senhas precisam ser iguais.");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setErro("Não foi possível salvar. Peça um link novo e tente de novo.");
      setEnviando(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-branco px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex justify-center">
          <Logo size={110} priority />
        </div>
        <h1 className="mt-9 text-center text-[24px] font-bold text-tinta">Criar senha nova</h1>
        <form onSubmit={salvar} className="mt-7 space-y-4">
          <Field label="Nova senha" hint="mínimo 8 caracteres">
            <Input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Repita a senha" error={erro}>
            <Input
              type="password"
              required
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
          <Button type="submit" variant="principal" size="lg" full loading={enviando}>
            Salvar senha
          </Button>
        </form>
      </div>
    </div>
  );
}
