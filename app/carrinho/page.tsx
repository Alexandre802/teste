import type { Metadata } from 'next';
import CartView from '@/components/cart/CartView';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppFloatingButton from '@/components/ui/WhatsAppFloatingButton';

export const metadata: Metadata = {
  title: 'Meu carrinho',
  description: 'Revise os produtos do seu pedido na Casa de Ração Bandeira Branca.',
  robots: { index: false, follow: true },
};

export default function CarrinhoPage() {
  return (
    <>
      <Header />
      <main id="conteudo" className="shell py-8 sm:py-10">
        <CartView />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
    </>
  );
}
