'use client';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { usePathname } from 'next/navigation';

import { ProvedorDeSessao } from '@/lib/hooks/use-sessao';
import { ProvedorDeToasts } from '@/lib/hooks/use-toasts';
import { PilhaDeToasts } from '@/components/ui/ToastNotification';

import Abertura from '@/app/page';
import PaginaDeLogin from '@/app/login/page';
import LayoutPrivado from '@/app/(privado)/layout';
import PaginaInicio from '@/app/(privado)/inicio/page';
import PaginaLancamentos from '@/app/(privado)/lancamentos/page';
import PaginaEquipe from '@/app/(privado)/equipe/page';
import PaginaPerfil from '@/app/(privado)/perfil/page';

/**
 * Entrada da prévia de página única.
 *
 * Monta exatamente os mesmos componentes que o site publicado monta — as
 * páginas são importadas dos próprios arquivos de rota. O que muda é só a
 * casca: no lugar do roteador do Next, um switch sobre a rota guardada em
 * memória, e no lugar do layout raiz, este arquivo com os mesmos provedores.
 *
 * Fica de fora o service worker: numa página avulsa não há o que instalar nem
 * o que guardar offline.
 */

const PRIVADAS: Record<string, () => React.ReactElement | null> = {
  '/inicio': PaginaInicio,
  '/lancamentos': PaginaLancamentos,
  '/equipe': PaginaEquipe,
  '/perfil': PaginaPerfil,
};

function Rotas() {
  // Mesma fonte que os componentes usam para saber a aba ativa.
  const rota = usePathname().replace(/\/+$/, '') || '/';

  if (rota === '/login') return <PaginaDeLogin />;

  const Privada = PRIVADAS[rota];
  if (Privada) {
    return (
      <LayoutPrivado>
        <Privada />
      </LayoutPrivado>
    );
  }

  return <Abertura />;
}

const raiz = document.getElementById('md-cortes');
if (raiz) {
  createRoot(raiz).render(
    <StrictMode>
      <ProvedorDeToasts>
        <ProvedorDeSessao>
          <Rotas />
          <PilhaDeToasts />
        </ProvedorDeSessao>
      </ProvedorDeToasts>
    </StrictMode>,
  );
}
