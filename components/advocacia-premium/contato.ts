/**
 * Dados de contato da peça demonstrativa.
 *
 * Centralizados aqui porque é o primeiro arquivo que quem for personalizar o
 * site vai abrir: trocar número, cidade e horário aqui muda o site inteiro.
 *
 * Telefone e horário são placeholders declarados — o rodapé diz isso na tela.
 * O WhatsApp é o único número real, e é o de quem apresenta a demonstração.
 */

export const WHATSAPP_NUMERO = '5512991865893';

export const WHATSAPP_MENSAGEM =
  'Olá, gostaria de obter informações sobre o atendimento jurídico.';

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
  WHATSAPP_MENSAGEM,
)}`;

export const ESCRITORIO = {
  cidade: 'Jacareí',
  estado: 'SP',
  atendimento: 'Segunda a sexta, 09:00 às 18:00',
  telefoneExibicao: '(12) 9 0000-0000',
  mapaEmbed: 'https://www.google.com/maps?q=Jacare%C3%AD%20SP&output=embed',
  mapaLink: 'https://www.google.com/maps/search/?api=1&query=Jacare%C3%AD%20SP',
} as const;
