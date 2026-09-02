'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Banknote, LogOut, Menu, Plus, Receipt } from 'lucide-react';
import { caixaConfigurado } from '@/lib/admin/config';
import { MENU, MENU_CELULAR, ehRotaAtiva } from './navegacao';
import { useSessao } from './SessaoProvider';
import { PedidosAoVivoProvider } from './PedidosAoVivo';
import IndicadorConexao from './IndicadorConexao';
import MarcaPainel from './MarcaPainel';
import { Modal } from './ui/Modal';
import { Botao } from './ui/Botao';
import { Esqueleto } from './ui/Estados';
import FormularioReceita from './formularios/FormularioReceita';
import FormularioDespesa from './formularios/FormularioDespesa';

/**
 * Moldura do painel.
 *
 *   computador → menu lateral fixo à esquerda, conteúdo à direita;
 *   celular    → barra inferior com cinco lugares, o do meio sendo o "+".
 *
 * O celular vem primeiro no CSS porque é onde o painel vai ser usado de
 * verdade: a dona confere venda no telefone, entre um pedido e outro, e não
 * sentada num computador.
 */
export default function Shell({ children }: { children: React.ReactNode }) {
  const { carregando, usuario, perfil, autorizado, sair } = useSessao();

  if (!caixaConfigurado) return <PainelSemBanco />;
  if (carregando) return <PainelCarregando />;
  if (!usuario) return <PrecisaEntrar />;
  if (!autorizado) return <SemAcesso email={usuario.email ?? ''} aoSair={sair} />;

  return (
    <PedidosAoVivoProvider>
      <Moldura nome={perfil?.name || usuario.email || ''} aoSair={sair}>
        {children}
      </Moldura>
    </PedidosAoVivoProvider>
  );
}

function Moldura({
  children,
  nome,
  aoSair,
}: {
  children: React.ReactNode;
  nome: string;
  aoSair: () => Promise<void>;
}) {
  const caminho = usePathname();
  const [maisAberto, setMaisAberto] = useState(false);
  const [novoAberto, setNovoAberto] = useState(false);
  const [formulario, setFormulario] = useState<'receita' | 'despesa' | null>(null);

  const abrirFormulario = (qual: 'receita' | 'despesa') => {
    setNovoAberto(false);
    setFormulario(qual);
  };

  const noRodape = MENU.filter((i) => MENU_CELULAR.includes(i.href));
  const noMais = MENU.filter((i) => !MENU_CELULAR.includes(i.href));

  return (
    <div className="admin-app">
      {/* ─────────────── menu lateral (computador) ─────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-[var(--admin-borda)] bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <MarcaPainel />
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold leading-tight text-[var(--admin-tinta)]">
              COMIDA CASEIRA
            </p>
            <p className="truncate text-xs text-[var(--admin-tinta-suave)]">Fluxo de caixa</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Menu do painel">
          <ul className="flex flex-col gap-0.5">
            {MENU.map(({ href, rotulo, icone: Icone }) => {
              const ativo = ehRotaAtiva(href, caminho);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={ativo ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      ativo
                        ? 'bg-[var(--admin-laranja-claro)] text-[var(--admin-laranja)]'
                        : 'text-[var(--admin-tinta-suave)] hover:bg-slate-50 hover:text-[var(--admin-tinta)]'
                    }`}
                  >
                    <Icone className="h-4.5 w-4.5 shrink-0" aria-hidden />
                    {rotulo}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[var(--admin-borda)] p-3">
          <p className="truncate px-3 pb-2 text-xs text-[var(--admin-tinta-suave)]" title={nome}>
            {nome}
          </p>
          <button
            type="button"
            onClick={() => void aoSair()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--admin-tinta-suave)] transition-colors hover:bg-rose-50 hover:text-[var(--admin-vermelho)]"
          >
            <LogOut className="h-4.5 w-4.5" aria-hidden />
            Sair
          </button>
        </div>
      </aside>

      {/* ─────────────── conteúdo ─────────────── */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--admin-borda)] bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:justify-end">
          <div className="flex items-center gap-2.5 lg:hidden">
            <MarcaPainel />
            <span className="text-sm font-extrabold text-[var(--admin-tinta)]">
              COMIDA CASEIRA
            </span>
          </div>
          <IndicadorConexao />
        </header>

        {/*
          `pb-28` no celular: a barra inferior é fixa e cobriria o último item
          de qualquer lista sem essa folga.
        */}
        <main className="px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:pb-10">{children}</main>
      </div>

      {/* ─────────────── barra inferior (celular) ─────────────── */}
      <nav
        aria-label="Menu do painel"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 items-center border-t border-[var(--admin-borda)] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {noRodape.slice(0, 2).map((item) => (
          <BotaoRodape key={item.href} item={item} caminho={caminho} />
        ))}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setNovoAberto(true)}
            aria-label="Novo lançamento"
            className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-[var(--admin-laranja)] text-white shadow-lg shadow-orange-500/30 transition-transform active:scale-95"
          >
            <Plus className="h-6 w-6" aria-hidden />
          </button>
        </div>

        {noRodape.slice(2).map((item) => (
          <BotaoRodape key={item.href} item={item} caminho={caminho} />
        ))}

        <button
          type="button"
          onClick={() => setMaisAberto(true)}
          className="flex flex-col items-center gap-0.5 py-2.5 text-[var(--admin-tinta-suave)]"
        >
          <Menu className="h-5 w-5" aria-hidden />
          <span className="text-[11px] font-semibold">Mais</span>
        </button>
      </nav>

      {/* ─────────────── "Mais": o resto do menu ─────────────── */}
      <Modal aberto={maisAberto} aoFechar={() => setMaisAberto(false)} titulo="Menu">
        <ul className="flex flex-col gap-1">
          {noMais.map(({ href, rotulo, icone: Icone }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMaisAberto(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--admin-tinta)] transition-colors hover:bg-slate-50"
              >
                <Icone className="h-5 w-5 text-[var(--admin-tinta-suave)]" aria-hidden />
                {rotulo}
              </Link>
            </li>
          ))}
          <li className="mt-1 border-t border-[var(--admin-borda)] pt-1">
            <button
              type="button"
              onClick={() => {
                setMaisAberto(false);
                void aoSair();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--admin-vermelho)] transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-5 w-5" aria-hidden />
              Sair
            </button>
          </li>
        </ul>
      </Modal>

      {/* ─────────────── "+": novo lançamento ─────────────── */}
      <Modal
        aberto={novoAberto}
        aoFechar={() => setNovoAberto(false)}
        titulo="Novo lançamento"
        descricao="O que você quer registrar agora?"
        largura="sm"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => abrirFormulario('receita')}
            className="flex flex-col items-start gap-2 rounded-xl border border-[var(--admin-borda)] p-4 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
              <Banknote className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-bold text-[var(--admin-tinta)]">Nova receita</span>
            <span className="text-xs text-[var(--admin-tinta-suave)]">
              Dinheiro que entrou fora do site
            </span>
          </button>

          <button
            type="button"
            onClick={() => abrirFormulario('despesa')}
            className="flex flex-col items-start gap-2 rounded-xl border border-[var(--admin-borda)] p-4 text-left transition-colors hover:border-rose-300 hover:bg-rose-50"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-rose-100 text-rose-700">
              <Receipt className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-bold text-[var(--admin-tinta)]">Nova despesa</span>
            <span className="text-xs text-[var(--admin-tinta-suave)]">
              Compra, conta ou pagamento
            </span>
          </button>
        </div>
      </Modal>

      <FormularioReceita
        aberto={formulario === 'receita'}
        aoFechar={() => setFormulario(null)}
        aoSalvar={() => setFormulario(null)}
      />
      <FormularioDespesa
        aberto={formulario === 'despesa'}
        aoFechar={() => setFormulario(null)}
        aoSalvar={() => setFormulario(null)}
      />
    </div>
  );
}

function BotaoRodape({
  item,
  caminho,
}: {
  item: (typeof MENU)[number];
  caminho: string;
}) {
  const ativo = ehRotaAtiva(item.href, caminho);
  const Icone = item.icone;
  return (
    <Link
      href={item.href}
      aria-current={ativo ? 'page' : undefined}
      className={`flex flex-col items-center gap-0.5 py-2.5 ${
        ativo ? 'text-[var(--admin-laranja)]' : 'text-[var(--admin-tinta-suave)]'
      }`}
    >
      <Icone className="h-5 w-5" aria-hidden />
      <span className="text-[11px] font-semibold">{item.rotulo}</span>
    </Link>
  );
}

/* ─────────────────────── estados fora do comum ─────────────────────── */

function PainelCarregando() {
  return (
    <div className="admin-app p-6" role="status" aria-label="Carregando o painel">
      <Esqueleto className="h-10 w-48" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Esqueleto key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
      <Esqueleto className="mt-4 h-64 w-full rounded-2xl" />
    </div>
  );
}

/**
 * Ambiente sem Supabase.
 *
 * Diz exatamente o que falta em vez de mostrar um painel de mentira com
 * números zerados — que é o mesmo visual de "hoje não vendi nada".
 */
function PainelSemBanco() {
  return (
    <main className="admin-app grid min-h-dvh place-items-center px-4">
      <div className="admin-card max-w-md p-6 text-center">
        <MarcaPainel tamanho="grande" />
        <h1 className="mt-4 text-lg font-extrabold text-[var(--admin-tinta)]">
          Fluxo de caixa não configurado
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--admin-tinta-suave)]">
          O painel precisa de um banco de dados para funcionar. Defina
          <code className="mx-1 rounded bg-slate-100 px-1 text-xs">NEXT_PUBLIC_SUPABASE_URL</code>
          e
          <code className="mx-1 rounded bg-slate-100 px-1 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          nas variáveis de ambiente e rode as migrations de
          <code className="mx-1 rounded bg-slate-100 px-1 text-xs">supabase/migrations</code>.
        </p>
        <p className="mt-3 text-xs text-[var(--admin-tinta-suave)]">
          Enquanto isso, o site de pedidos continua funcionando normalmente pelo WhatsApp.
        </p>
      </div>
    </main>
  );
}

function PrecisaEntrar() {
  return (
    <main className="admin-app grid min-h-dvh place-items-center px-4">
      <div className="admin-card max-w-sm p-6 text-center">
        <h1 className="text-lg font-extrabold text-[var(--admin-tinta)]">Sessão encerrada</h1>
        <p className="mt-2 text-sm text-[var(--admin-tinta-suave)]">
          Entre de novo para continuar no painel.
        </p>
        <Link href="/admin/login" className="mt-4 inline-block">
          <Botao>Ir para o login</Botao>
        </Link>
      </div>
    </main>
  );
}

/**
 * Autenticado, mas sem permissão.
 *
 * Estado real e comum: a conta foi criada no Supabase e ninguém rodou o
 * segundo passo, que liga o usuário à casa. Sem esta tela, a pessoa entraria
 * e veria todas as listas vazias, achando que perdeu os dados.
 */
function SemAcesso({ email, aoSair }: { email: string; aoSair: () => Promise<void> }) {
  return (
    <main className="admin-app grid min-h-dvh place-items-center px-4">
      <div className="admin-card max-w-md p-6 text-center">
        <h1 className="text-lg font-extrabold text-[var(--admin-tinta)]">
          Esta conta ainda não tem acesso ao caixa
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--admin-tinta-suave)]">
          O login de <strong className="font-semibold">{email}</strong> funcionou, mas a conta não
          está liberada no painel. Quem libera é a proprietária, em Configurações → Usuários.
        </p>
        <div className="mt-4">
          <Botao variante="secundario" onClick={() => void aoSair()}>
            Sair
          </Botao>
        </div>
      </div>
    </main>
  );
}
