'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icone } from '@/components/ui/Icone';
import { dados } from '@/lib/data';
import { PERFIS_LOCAIS } from '@/lib/data/local';

interface Props {
  aoConcluir: () => void;
}

/**
 * Primeiro acesso do modo local.
 *
 * Nenhuma senha vem escrita no código — nem aqui, nem no repositório. Quem
 * instala define a de cada perfil neste momento, e o que fica guardado é o
 * hash PBKDF2, não o texto. Depois disso esta tela nunca mais aparece.
 */
export function PrimeiroAcesso({ aoConcluir }: Props) {
  const [senhas, setSenhas] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await dados.configurar(senhas);
      aoConcluir();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar as senhas.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="w-full" noValidate>
      <h1 className="text-center text-[1.7rem] leading-tight font-extrabold text-neve">
        Primeiro acesso
      </h1>
      <p className="mx-auto mt-2 max-w-[19rem] text-center text-[0.85rem] leading-snug text-fumaca">
        Defina a senha de cada perfil. Elas ficam guardadas cifradas neste aparelho e podem ser
        diferentes entre si.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {PERFIS_LOCAIS.map((perfil, i) => (
          <motion.div
            key={perfil.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07 }}
            className="cartao p-3.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ouro/35 text-ouro">
                <Icone nome={perfil.role === 'developer' ? 'escudo' : 'pessoa'} tamanho={16} />
              </span>
              <div>
                <p className="text-[0.9rem] font-semibold text-neve">{perfil.name}</p>
                <p className="text-[0.72rem] text-fumaca-fraca">{perfil.jobTitle}</p>
              </div>
            </div>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Senha (mínimo 4 caracteres)"
              value={senhas[perfil.id] ?? ''}
              onChange={(e) => setSenhas((s) => ({ ...s, [perfil.id]: e.target.value }))}
              className="campo mt-2.5"
              aria-label={`Senha de ${perfil.name}`}
            />
          </motion.div>
        ))}
      </div>

      {erro ? (
        <p role="alert" className="mt-3 flex items-center justify-center gap-1.5 text-[0.82rem] text-alerta">
          <Icone nome="alerta" tamanho={14} />
          {erro}
        </p>
      ) : null}

      <motion.button
        type="submit"
        disabled={salvando}
        whileTap={{ scale: 0.985 }}
        className="btn-ouro mt-5 flex h-[3.25rem] w-full items-center justify-center gap-2 text-[1rem] disabled:opacity-90"
      >
        <Icone nome="check" tamanho={18} strokeWidth={2.4} />
        {salvando ? 'Salvando…' : 'Salvar e continuar'}
      </motion.button>
    </form>
  );
}
