"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { getSupabase } from "@/lib/supabase/client";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setEnviando(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?destino=/redefinir-senha`,
    });
    // A resposta é a mesma exista ou não a conta: não confirma e-mail cadastrado.
    setEnviado(true);
    setEnviando(false);
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-branco px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex justify-center">
          <Logo size={110} priority />
        </div>

        {enviado ? (
          <div className="mt-10 text-center">
            <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-verde-suave text-verde">
              <MailCheck size={22} />
            </span>
            <h1 className="text-[22px] font-bold text-tinta">Confira seu e-mail</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-cinza">
              Se existir uma conta com esse endereço, o link para criar uma senha nova chega em instantes.
            </p>
          </div>
        ) : (
          <>
            <h1 className="mt-9 text-center text-[24px] font-bold text-tinta">Recuperar senha</h1>
            <p className="mt-2 text-center text-[15px] text-cinza">
              Informe o e-mail da conta e enviaremos um link para criar uma senha nova.
            </p>
            <form onSubmit={enviar} className="mt-7 space-y-4">
              <Field label="E-mail">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  autoComplete="username"
                />
              </Field>
              <Button type="submit" variant="principal" size="lg" full loading={enviando}>
                Enviar link
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 flex justify-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-[15px] font-medium text-ouro hover:underline">
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
