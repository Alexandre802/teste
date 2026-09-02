import { SessaoProvider } from '@/components/admin/SessaoProvider';
import Shell from '@/components/admin/Shell';

/**
 * Moldura das telas autenticadas.
 *
 * O login fica FORA deste grupo de rotas, em `app/admin/login`: ele não pode
 * herdar o menu nem o provedor de sessão — seria menu de painel numa tela de
 * quem ainda não entrou.
 */
export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessaoProvider>
      <Shell>{children}</Shell>
    </SessaoProvider>
  );
}
