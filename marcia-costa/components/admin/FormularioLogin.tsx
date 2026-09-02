"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

import { criarClienteNavegador } from "@/lib/supabase/client";
import { restaurant } from "@/data/restaurant";

/**
 * Entrada do painel. Não existe criação pública de conta: a dona cadastra o
 * usuário no Supabase e libera o acesso na tabela comida_caseira_users.
 */
export function FormularioLogin() {
  const router = useRouter();
  const parametros = useSearchParams();
  const destino = parametros.get("de") ?? "/admin";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const entrar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (enviando) return;

    setErro(null);
    setEnviando(true);

    const supabase = criarClienteNavegador();
    if (!supabase) {
      setErro("O painel ainda não está conectado ao banco de dados.");
      setEnviando(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      // Mensagem genérica de propósito: dizer "esse e-mail não existe"
      // entrega a lista de quem tem acesso a quem estiver tentando adivinhar.
      setErro("E-mail ou senha incorretos.");
      setEnviando(false);
      return;
    }

    router.replace(destino.startsWith("/admin") ? destino : "/admin");
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm rounded-gigante border border-borda bg-white p-7 shadow-carta">
      <div className="flex flex-col items-center text-center">
        <Image
          src={restaurant.logo}
          alt=""
          width={72}
          height={72}
          className="h-16 w-16"
        />
        <h1 className="fonte-titulo mt-3 text-xl font-extrabold text-laranja">
          Comida Caseira
        </h1>
        <p className="text-sm font-semibold text-tinta-media">
          Painel Administrativo
        </p>
      </div>

      <form onSubmit={entrar} className="mt-7 space-y-4">
        <div>
          <label
            htmlFor="admin-email"
            className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
          >
            E-mail
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            className="min-h-[48px] w-full rounded-carta border border-borda bg-white px-4 text-[15px] text-tinta"
          />
        </div>

        <div>
          <label
            htmlFor="admin-senha"
            className="mb-1.5 block text-[13px] font-semibold text-tinta-media"
          >
            Senha
          </label>
          <div className="relative">
            <input
              id="admin-senha"
              type={mostrarSenha ? "text" : "password"}
              required
              autoComplete="current-password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              className="min-h-[48px] w-full rounded-carta border border-borda bg-white px-4 pr-14 text-[15px] text-tinta"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((atual) => !atual)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-tinta-media hover:bg-nevoa"
            >
              {mostrarSenha ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {erro && (
          <p
            role="alert"
            className="rounded-carta border border-vermelho/25 bg-vermelho/5 px-4 py-3 text-sm text-vermelho"
          >
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-carta bg-laranja text-base font-semibold text-white transition-colors hover:bg-laranja-forte disabled:cursor-not-allowed disabled:opacity-70"
        >
          {enviando ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Entrando…
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" aria-hidden="true" />
              Entrar
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[12px] leading-relaxed text-tinta-suave">
        Acesso restrito à equipe da casa. O cadastro de novos usuários é feito
        pela proprietária.
      </p>
    </div>
  );
}
