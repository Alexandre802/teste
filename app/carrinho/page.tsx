import type { Metadata } from 'next';
import CartView from '@/components/cart/CartView';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Meu carrinho',
  description: 'Revise os produtos do seu pedido na Casa de Ração Bandeira Branca.',
  robots: { index: false, follow: true },
};

/* Sem o botão flutuante do WhatsApp aqui de propósito: a ação principal desta
   página já é "Fechar pedido no WhatsApp", e a bolha ficava por cima dela. */
export default function CarrinhoPage() {
  return (
    <>
      <Header />
      <main id="conteudo" className="shell py-8 sm:py-10">
        <CartView />
      </main>
      <Footer />
    </>
  );
}
