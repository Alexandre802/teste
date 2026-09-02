import type { Metadata } from "next";
import Link from "next/link";
import { Database, KeyRound, Terminal } from "lucide-react";

import { supabaseConfigurado } from "@/lib/supabase/config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Conectar o painel",
  robots: { index: false, follow: false },
};

/**
 * Tela honesta para quando o Supabase ainda não foi conectado. O painel não
 * inventa um login que não teria banco atrás.
 */
export default function PaginaConfigurar() {
  if (supabaseConfigurado) redirect("/admin");

  const passos = [
    {
      icone: Database,
      titulo: "Crie o projeto no Supabase",
      texto:
        "Um projeto novo, exclusivo da Comida Caseira. Anote a URL e a chave anônima em Project Settings → API.",
    },
    {
      icone: Terminal,
      titulo: "Rode as migrations",
      texto:
        "Aplique os arquivos de supabase/migrations na ordem, pelo SQL Editor ou pela CLI do Supabase. Depois rode npm run sincronizar-produtos para levar o cardápio e os custos para o banco.",
    },
    {
      icone: KeyRound,
      titulo: "Preencha o .env.local",
      texto:
        "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. Depois crie o usuário da Márcia em Authentication e libere o acesso inserindo a linha dela em comida_caseira_users com role 'owner'.",
    },
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="fonte-titulo text-2xl font-extrabold text-tinta">
        O painel ainda não está conectado
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-tinta-media">
        O fluxo de caixa guarda pedidos, receitas e despesas no Supabase. Sem
        esse projeto configurado não há onde gravar nada, então o painel avisa
        em vez de mostrar números vazios como se fossem reais. O site de
        pedidos continua funcionando normalmente.
      </p>

      <ol className="mt-8 space-y-3">
        {passos.map((passo, indice) => {
          const Icone = passo.icone;
          return (
            <li
              key={passo.titulo}
              className="flex gap-4 rounded-bloco border border-borda bg-white p-5 shadow-carta"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-creme">
                <Icone className="h-5 w-5 text-laranja" aria-hidden="true" />
              </div>
              <div>
                <h2 className="fonte-titulo text-[16px] font-bold text-tinta">
                  {indice + 1}. {passo.titulo}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-tinta-media">
                  {passo.texto}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-sm text-tinta-media">
        O passo a passo completo está no <code>README.md</code> do projeto.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex min-h-[48px] items-center rounded-carta border border-borda bg-white px-5 text-[15px] font-semibold text-tinta hover:border-laranja hover:text-laranja"
      >
        Voltar para o site
      </Link>
    </main>
  );
}
