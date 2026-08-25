import { business, MENSAGEM_WHATSAPP } from '@/data/business';

/**
 * Monta o link do WhatsApp da casa. Sem texto, usa a mensagem padrão do site.
 * `wa.me` é o formato que funciona igual no app e no navegador.
 */
export function linkWhatsApp(texto: string = MENSAGEM_WHATSAPP): string {
  return `https://wa.me/${business.whatsappE164}?text=${encodeURIComponent(texto)}`;
}

/** Link já com o produto citado, usado no card e na página do carrinho. */
export function linkWhatsAppProduto(nomeProduto: string): string {
  return linkWhatsApp(
    `Olá! Vim pelo site da Casa de Ração Bandeira Branca e gostaria de saber sobre: ${nomeProduto}.`,
  );
}
