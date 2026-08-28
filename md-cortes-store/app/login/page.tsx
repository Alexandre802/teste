"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ConfiguracaoPendente } from "@/components/layout/ConfiguracaoPendente";
import { BRAND } from "@/lib/brand";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}

function Login() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!isSupabaseConfigured) return <ConfiguracaoPendente />;

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    setEnviando(true);
    setErro(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      // A mensagem é genérica de propósito: dizer "e-mail não existe" entrega
      // a quem tentar adivinhar quais contas existem.
      setErro("E-mail ou senha incorretos.");
      setEnviando(false);
      return;
    }

    router.replace(parametros.get("de") ?? "/");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-branco px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-sm"
      >
        <div className="flex justify-center">
          <Logo size={150} priority />
        </div>

        <h1 className="mt-9 text-center text-[30px] font-bold leading-tight tracking-[-0.02em] text-tinta">
          Acesse sua conta
        </h1>
        <p className="mt-2 text-center text-[15px] text-cinza">{BRAND.tagline}</p>

        <form onSubmit={entrar} className="mt-8 space-y-3">
          <div className="relative">
            <Mail size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ouro" />
            <input
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              aria-label="E-mail"
              className="h-[58px] w-full rounded-card border border-borda bg-branco pl-13 pr-4 text-[16px] text-tinta placeholder:text-cinza-claro focus:border-ouro-borda focus:outline-none focus:ring-2 focus:ring-ouro/15"
            />
          </div>

          <div className="relative">
            <Lock size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ouro" />
            <input
              type={verSenha ? "text" : "password"}
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              aria-label="Senha"
              className="h-[58px] w-full rounded-card border border-borda bg-branco pl-13 pr-13 text-[16px] text-tinta placeholder:text-cinza-claro focus:border-ouro-borda focus:outline-none focus:ring-2 focus:ring-ouro/15"
            />
            <button
              type="button"
              onClick={() => setVerSenha((v) => !v)}
              aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ouro hover:bg-ouro-suave"
            >
              {verSenha ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {erro ? (
            <p role="alert" className="rounded-suave bg-vermelho-suave px-4 py-3 text-[14px] text-vermelho">
              {erro}
            </p>
          ) : null}

          <Button type="submit" variant="principal" size="xl" full loading={enviando} className="mt-1">
            {enviando ? null : <ArrowRight size={20} />}
            Entrar
          </Button>
        </form>

        <div className="mt-5 flex justify-center">
          <Link
            href="/recuperar-senha"
            className="inline-flex items-center gap-2 text-[15px] font-medium text-ouro hover:underline"
          >
            <Lock size={15} />
            Esqueci minha senha
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
