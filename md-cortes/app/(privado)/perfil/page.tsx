'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icone } from '@/components/ui/Icone';
import { Marca } from '@/components/layout/Marca';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { useCentral } from '@/lib/hooks/use-central';
import { useSessao } from '@/lib/hooks/use-sessao';
import { useToasts } from '@/lib/hooks/use-toasts';

/** Perfil: quem está logado, como o app está instalado, avisos e saída. */
export default function PaginaPerfil() {
  const router = useRouter();
  const { perfil, ehAdmin, modo, sair } = useSessao();
  const { avisos, naoLidas } = useCentral();
  const { mostrar } = useToasts();

  if (!perfil) return null;

  const pedirAvisos = async () => {
    const permitido = await avisos.pedirPermissao();
    mostrar(
      permitido
        ? {
            tipo: 'sucesso',
            titulo: 'Avisos ligados',
            descricao: 'Este aparelho vai avisar quando entrar um corte novo.',
          }
        : {
            tipo: 'aviso',
            titulo: 'Avisos não autorizados',
            descricao: 'A central de notificações continua funcionando dentro do app.',
          },
    );
  };

  return (
    <>
      <header className="topo-seguro px-4 pb-1">
        <h1 className="flex items-center gap-2 text-[1.4rem] font-extrabold text-neve">
          <Icone nome="pessoa" tamanho={21} className="text-ouro" />
          Perfil
        </h1>
      </header>

      <div className="mt-4 flex flex-col gap-3.5 px-4">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="cartao-ouro flex items-center gap-3.5 p-4"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-ouro/45 bg-carvao-alto text-ouro">
            <Icone nome={ehAdmin ? 'escudo' : 'pessoa'} tamanho={24} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[1.15rem] font-extrabold text-neve">{perfil.name}</p>
            <p className="text-[0.82rem] text-ouro">{perfil.jobTitle ?? 'Funcionário'}</p>
            <p className="mt-0.5 truncate text-[0.75rem] text-fumaca-fraca">{perfil.email}</p>
          </div>
        </motion.section>

        <section className="cartao divide-y divide-grafite/70">
          <Linha
            icone="escudo"
            rotulo="Permissão"
            valor={ehAdmin ? 'Acesso total' : 'Registrar e ver os próprios cortes'}
          />
          <Linha
            icone="nuvem"
            rotulo="Dados"
            valor={modo === 'nuvem' ? 'Supabase (sincroniza entre aparelhos)' : 'Somente neste aparelho'}
          />
          {ehAdmin ? (
            <Linha icone="sino" rotulo="Não lidas" valor={`${naoLidas}`} />
          ) : null}
        </section>

        <InstallPrompt />

        {ehAdmin ? (
          <section className="cartao p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ouro/30 bg-ouro/8 text-ouro">
                <Icone nome="sino" tamanho={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.9rem] font-semibold text-neve">
                  Receber notificações neste dispositivo
                </p>
                <p className="text-[0.78rem] leading-snug text-fumaca-fraca">
                  {avisos.estado === 'permitido'
                    ? 'Autorizado. Os avisos aparecem mesmo com o app em segundo plano.'
                    : avisos.estado === 'negado'
                      ? 'Bloqueado nas configurações do navegador. A central dentro do app continua funcionando.'
                      : avisos.estado === 'indisponivel'
                        ? 'Este navegador não oferece avisos do sistema.'
                        : 'Ligue para ser avisado assim que o Gabriel ou o Nino registrar um corte.'}
                </p>
              </div>
            </div>

            {avisos.estado === 'pendente' ? (
              <button
                type="button"
                onClick={() => void pedirAvisos()}
                className="btn-ouro-fantasma mt-3.5 flex h-11 w-full items-center justify-center gap-2 text-[0.9rem]"
              >
                <Icone nome="sino" tamanho={16} />
                Ativar avisos
              </button>
            ) : null}
          </section>
        ) : null}

        <button
          type="button"
          onClick={async () => {
            await sair();
            router.replace('/login');
          }}
          className="flex items-center justify-center gap-2 rounded-campo border border-alerta/35 bg-alerta/8 py-3.5 text-[0.92rem] font-semibold text-alerta transition-colors hover:bg-alerta/12"
        >
          <Icone nome="sair" tamanho={18} />
          Sair da conta
        </button>

        <div className="flex flex-col items-center gap-1.5 pt-2 pb-1">
          <Marca tamanho="pequeno" className="opacity-70" />
          <p className="text-[0.7rem] text-fumaca-fraca">Controle de cortes da barbearia</p>
        </div>
      </div>
    </>
  );
}

function Linha({
  icone,
  rotulo,
  valor,
}: {
  icone: React.ComponentProps<typeof Icone>['nome'];
  rotulo: string;
  valor: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icone nome={icone} tamanho={17} className="shrink-0 text-ouro/80" />
      <span className="text-[0.85rem] text-fumaca">{rotulo}</span>
      <span className="ml-auto text-right text-[0.85rem] font-medium text-neve">{valor}</span>
    </div>
  );
}
