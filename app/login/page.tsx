import type { Metadata } from 'next';
import LoginForm from '@/components/account/LoginForm';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse sua conta da Casa de Ração Bandeira Branca.',
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main id="conteudo" className="shell flex justify-center py-10 sm:py-14">
        <LoginForm />
      </main>
      <Footer />
    </>
  );
}
