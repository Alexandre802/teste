import type { Metadata } from 'next';
import { provedoresLigados } from '@/auth';
import { temBancoDeUsuarios } from '@/lib/usuarios';
import LoginForm from '@/components/account/LoginForm';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua conta da Casa de Ração Bandeira Branca.',
  robots: { index: false, follow: true },
};

const mensagensDeErro: Record<string, string> = {
  OAuthAccountNotLinked: 'Esse e-mail já entrou por outro caminho. Use o mesmo de antes.',
  AccessDenied: 'O acesso foi negado pelo provedor. Tente novamente.',
  Configuration: 'O login ainda não está configurado. Fale com a gente pelo WhatsApp.',
  CredentialsSignin: 'E-mail ou senha incorretos.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <Header />
      <main id="conteudo" className="shell flex justify-center py-10 sm:py-14">
        <LoginForm
          google={provedoresLigados.google}
          facebook={provedoresLigados.facebook}
          contaPorEmailDisponivel={temBancoDeUsuarios()}
          erroDaUrl={error ? (mensagensDeErro[error] ?? 'Não foi possível entrar. Tente de novo.') : undefined}
        />
      </main>
      <Footer />
    </>
  );
}
