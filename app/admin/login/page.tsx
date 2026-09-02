import type { Metadata } from 'next';
import FormularioLogin from '@/components/admin/FormularioLogin';

export const metadata: Metadata = {
  title: 'Entrar no painel',
  // painel administrativo nunca vai para buscador
  robots: { index: false, follow: false },
};

export default function PaginaLogin() {
  return <FormularioLogin />;
}
