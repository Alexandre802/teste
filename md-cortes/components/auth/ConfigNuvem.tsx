'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icone } from '@/components/ui/Icone';
import {
  apagarConfigNuvem,
  configVeioDoAparelho,
  gravarConfigNuvem,
  lerConfigNuvem,
  montarConvite,
  recarregarApos,
  validar,
} from '@/lib/data';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
/** Ligado só na prévia de página única, que não tem saída para a internet. */
const PREVIA = process.env.NEXT_PUBLIC_PREVIA === '1';

interface Props {
  aberto: boolean;
  aoFechar: () => void;
}

/**
 * "Conectar à nuvem" — o passo que tira o MD_cortes de um celular só.
 *
 * Fica no próprio aplicativo, e não num arquivo de configuração, porque quem
 * vai fazer isso é a barbearia: cola dois valores do painel do Supabase e
 * pronto, sem gerar o site de novo nem publicar de novo.
 *
 * Feito isso, o botão de convite empacota a mesma configuração num endereço.
 * O segundo celular abre o link e já entra conectado — ninguém digita chave
 * de banco na tela de um telefone.
 */
export function ConfigNuvem({ aberto, aoFechar }: Props) {
  const atual = lerConfigNuvem();
  const noAparelho = configVeioDoAparelho();

  const [url, setUrl] = useState(atual?.url ?? '');
  const [chave, setChave] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const salvar = (evento: React.FormEvent) => {
    evento.preventDefault();
    const config = validar(url, chave);
    if (!config) {
      setErro(
        'Confira os dois campos. O endereço tem a forma https://xxxx.supabase.co e a chave é a "anon public" do painel.',
      );
      return;
    }
    gravarConfigNuvem(config);
    recarregarApos();
  };

  const copiarConvite = async () => {
    if (!atual) return;
    const link = montarConvite(atual, `${window.location.origin}${BASE}`);
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Sem permissão de área de transferência: mostra o link para copiar à mão.
      window.prompt('Copie o link de convite:', link);
    }
  };

  const desconectar = () => {
    apagarConfigNuvem();
    recarregarApos();
  };

  return (
    <AnimatePresence>
      {aberto ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={aoFechar}
            className="fixed inset-0 z-40 bg-noite/80 backdrop-blur-[2px]"
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-label="Conectar à nuvem"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-grafite bg-noite px-4 pt-4 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[26rem] sm:rounded-3xl sm:border"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
          >
            <header className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ouro/30 bg-ouro/8 text-ouro">
                <Icone nome="nuvem" tamanho={18} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[1.05rem] font-bold text-neve">Conectar à nuvem</h2>
                <p className="text-[0.78rem] text-fumaca-fraca">
                  Para os três celulares verem os mesmos cortes
                </p>
              </div>
              <button
                type="button"
                onClick={aoFechar}
                aria-label="Fechar"
                className="rounded-full border border-grafite p-2 text-fumaca transition-colors hover:text-neve"
              >
                <Icone nome="fechar" tamanho={15} />
              </button>
            </header>

            {atual ? (
              <section className="mt-4 rounded-2xl border border-ouro/25 bg-ouro/[0.05] p-3.5">
                <p className="flex items-center gap-2 text-[0.85rem] font-semibold text-ouro">
                  <Icone nome="check" tamanho={15} strokeWidth={2.5} />
                  Conectado
                </p>
                <p className="mt-1 truncate text-[0.75rem] text-fumaca-fraca">{atual.url}</p>

                <button
                  type="button"
                  onClick={() => void copiarConvite()}
                  className="btn-ouro mt-3 flex h-11 w-full items-center justify-center gap-2 text-[0.9rem]"
                >
                  <Icone nome={copiado ? 'check' : 'celular'} tamanho={16} />
                  {copiado ? 'Link copiado' : 'Copiar link para o outro celular'}
                </button>
                <p className="mt-2 text-[0.72rem] leading-snug text-fumaca-fraca">
                  Quem abrir esse link já entra conectado, sem digitar nada. Ele leva só o
                  endereço e a chave pública do projeto — quem guarda as senhas é o Supabase.
                </p>

                {noAparelho ? (
                  <button
                    type="button"
                    onClick={desconectar}
                    className="mt-3 w-full rounded-campo border border-grafite py-2.5 text-[0.82rem] font-medium text-fumaca transition-colors hover:text-neve"
                  >
                    Desconectar deste aparelho
                  </button>
                ) : null}
              </section>
            ) : null}

            {PREVIA ? (
              <p className="mt-4 rounded-2xl border border-grafite bg-carvao px-3.5 py-3 text-[0.8rem] leading-relaxed text-fumaca">
                Esta é uma prévia de página única e ela não tem saída para a internet, então não
                dá para conectar um projeto Supabase por aqui. No aplicativo publicado, é neste
                lugar que entram o endereço do projeto e a chave <strong className="text-neve">anon
                public</strong> — e o botão ao lado passa esse acesso para o outro celular.
              </p>
            ) : (
            <form onSubmit={salvar} className="mt-4 flex flex-col gap-3" noValidate>
              <p className="text-[0.8rem] leading-relaxed text-fumaca">
                No painel do Supabase, em <strong className="text-neve">Project Settings → API</strong>,
                copie os dois valores abaixo.
              </p>

              <label className="text-[0.72rem] text-fumaca-fraca">
                Endereço do projeto (Project URL)
                <input
                  type="url"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="https://xxxxxxxx.supabase.co"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setErro(null);
                  }}
                  className="campo mt-1 text-[0.9rem]"
                />
              </label>

              <label className="text-[0.72rem] text-fumaca-fraca">
                Chave pública (anon public)
                <textarea
                  rows={3}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="eyJhbGciOi…"
                  value={chave}
                  onChange={(e) => {
                    setChave(e.target.value);
                    setErro(null);
                  }}
                  className="campo mt-1 resize-none font-mono text-[0.78rem] leading-snug"
                />
              </label>

              {erro ? (
                <p role="alert" className="flex items-start gap-1.5 text-[0.78rem] leading-snug text-alerta">
                  <Icone nome="alerta" tamanho={14} className="mt-0.5 shrink-0" />
                  {erro}
                </p>
              ) : null}

              <button
                type="submit"
                className="btn-ouro-fantasma flex h-12 items-center justify-center gap-2 text-[0.92rem]"
              >
                <Icone nome="nuvem" tamanho={17} />
                {atual ? 'Trocar de projeto' : 'Conectar'}
              </button>

              <p className="text-[0.72rem] leading-snug text-fumaca-fraca">
                Nunca cole aqui a chave <strong className="text-fumaca">service_role</strong>. Ela
                ignora todas as permissões do banco. A que entra aqui é a{' '}
                <strong className="text-fumaca">anon public</strong>, feita para ficar no aplicativo.
              </p>
            </form>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
