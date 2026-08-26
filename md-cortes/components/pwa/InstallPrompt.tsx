'use client';

import { motion } from 'framer-motion';
import { Icone } from '@/components/ui/Icone';
import { useInstalacao } from '@/lib/hooks/use-pwa';

/**
 * "Adicionar à Tela de Início".
 *
 * No Android o botão abre o convite do próprio Chrome. No iPhone não existe
 * esse convite, então o que cabe é explicar o caminho — e é o que ele faz, em
 * vez de mostrar um botão que não faria nada.
 */
export function InstallPrompt() {
  const { podeInstalar, instalado, ehIos, instalar } = useInstalacao();

  if (instalado) {
    return (
      <div className="cartao flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ouro/30 bg-ouro/8 text-ouro">
          <Icone nome="check" tamanho={18} strokeWidth={2.4} />
        </span>
        <div>
          <p className="text-[0.9rem] font-semibold text-neve">Instalado neste aparelho</p>
          <p className="text-[0.78rem] text-fumaca-fraca">
            O MD_cortes já abre pelo ícone, em tela cheia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cartao p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ouro/30 bg-ouro/8 text-ouro">
          <Icone nome="celular" tamanho={18} />
        </span>
        <div className="min-w-0">
          <p className="text-[0.9rem] font-semibold text-neve">Instalar no celular</p>
          <p className="text-[0.78rem] leading-snug text-fumaca-fraca">
            Abre em tela cheia, direto do ícone, sem barra de navegador.
          </p>
        </div>
      </div>

      {podeInstalar ? (
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => void instalar()}
          className="btn-ouro mt-3.5 flex h-12 w-full items-center justify-center gap-2 text-[0.95rem]"
        >
          <Icone nome="nuvem" tamanho={18} />
          Adicionar à Tela de Início
        </motion.button>
      ) : (
        <p className="mt-3 rounded-xl border border-grafite bg-carvao-alto px-3 py-2.5 text-[0.78rem] leading-relaxed text-fumaca">
          {ehIos ? (
            <>
              No iPhone: toque em <strong className="text-neve">Compartilhar</strong> na barra do
              Safari e escolha <strong className="text-neve">Adicionar à Tela de Início</strong>.
            </>
          ) : (
            <>
              Abra o menu do navegador e escolha{' '}
              <strong className="text-neve">Instalar aplicativo</strong> ou{' '}
              <strong className="text-neve">Adicionar à tela inicial</strong>.
            </>
          )}
        </p>
      )}
    </div>
  );
}
