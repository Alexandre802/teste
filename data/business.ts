/**
 * Dados da casa. Nada aqui pode ser inventado: telefone, WhatsApp e cidade
 * saem da peça de referência aprovada. O que a loja ainda não confirmou fica
 * como `null` e o site simplesmente não mostra aquele campo — é melhor não
 * exibir do que exibir errado.
 *
 * Para completar: preencha `enderecoCompleto`, `horarios` e `siteUrl` assim
 * que a loja passar os dados. O rodapé e o JSON-LD reagem sozinhos.
 */

export type Horario = { dias: string; abre: string; fecha: string };

export const business = {
  nome: 'Casa de Ração Bandeira Branca',
  nomeLinha1: 'CASA DE RAÇÃO',
  nomeLinha2: 'BANDEIRA BRANCA',
  marcaDestaque: { nome: 'PremieR', selo: 'SUPER PREMIUM' },

  descricao:
    'Rações, acessórios, higiene, brinquedos e produtos para cães, gatos e outros pets em Jacareí.',

  telefone: '(12) 3962-5246',
  telefoneLink: 'tel:+551239625246',

  whatsapp: '(12) 98167-6145',
  whatsappE164: '5512981676145',

  cidade: 'Jacareí',
  estado: 'SP',
  cidadeUf: 'Jacareí - SP',

  /** Endereço completo ainda não confirmado pela loja. */
  enderecoCompleto: null as string | null,

  /** Horário de funcionamento ainda não confirmado pela loja. */
  horarios: [] as Horario[],

  /** Trocar pelo domínio próprio quando existir. */
  siteUrl: 'https://casaderacaobandeirabranca.com.br',

  entrega: {
    chamada: 'Entrega rápida em Jacareí',
    prazo: 'Pedidos em até 1 hora*',
    /** O asterisco da referência precisa de uma nota. Esta é ela. */
    observacao: '*Prazo sujeito à região de entrega e à disponibilidade do item.',
  },
} as const;

/** Mensagem padrão dos botões de WhatsApp do site. */
export const MENSAGEM_WHATSAPP =
  'Olá! Vim pelo site da Casa de Ração Bandeira Branca e gostaria de fazer um pedido.';
