/**
 * Dados da academia. É o único lugar do site onde eles existem — nenhuma
 * informação da casa é escrita dentro de JSX.
 *
 * Tudo aqui foi transcrito das referências enviadas pelo cliente (perfil da
 * Allp Fit no Google e fotos da unidade). Nada foi estimado: o que não veio
 * confirmado está como `null` e a interface trata a ausência.
 */

export const academy = {
  nome: 'Allp Fit',
  nomeCompleto: 'Allp Fit Academia',
  segmento: 'Academia',

  endereco: {
    rua: 'Av. Celso Garcia Cid, 231',
    bairro: 'Centro',
    cidade: 'Londrina',
    estado: 'PR',
    cep: '86010-490',
  },

  /** Telefone único, usado para ligação e para o WhatsApp. */
  telefone: {
    exibicao: '(43) 98855-4334',
    /** formato E.164, sem sinais — usado em tel: e wa.me */
    e164: '5543988554334',
  },

  site: 'https://allpfit.com.br',

  /**
   * Nota do perfil no Google, exatamente como aparece na referência.
   * Ao atualizar, mexa só nestes dois números.
   */
  avaliacao: {
    nota: 4.7,
    quantidade: 385,
    fonte: 'Google',
  },

  /** Perfis sociais: preencher quando o cliente confirmar os endereços. */
  redes: {
    instagram: null as string | null,
    facebook: null as string | null,
  },

  /** Domínio de produção — usado no canonical, no sitemap e no Open Graph. */
  urlCanonica: 'https://allpfit.com.br',
} as const;

export const enderecoCompleto = [
  academy.endereco.rua,
  academy.endereco.bairro,
  `${academy.endereco.cidade} - ${academy.endereco.estado}`,
  academy.endereco.cep,
].join(', ');

/** Consulta de mapa/rota reaproveitada pelo iframe e pelo botão "Como chegar". */
const consultaMapa = encodeURIComponent(`${academy.nomeCompleto}, ${enderecoCompleto}`);

export const links = {
  telefone: `tel:+${academy.telefone.e164}`,
  mapaEmbed: `https://www.google.com/maps?q=${consultaMapa}&z=16&hl=pt-BR&output=embed`,
  rota: `https://www.google.com/maps/dir/?api=1&destination=${consultaMapa}`,
  perfilMaps: `https://www.google.com/maps/search/?api=1&query=${consultaMapa}`,
};

/**
 * Monta o link do WhatsApp com a mensagem já escrita.
 * A mensagem entra codificada — acentos e quebras de linha inclusos.
 */
export function whatsapp(mensagem?: string): string {
  const base = `https://wa.me/${academy.telefone.e164}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

/** Mensagens padrão dos botões, num só lugar para ajustar o tom de voz. */
export const mensagens = {
  geral: 'Olá! Vi o site da Allp Fit e gostaria de mais informações.',
  planos: 'Olá! Gostaria de conhecer os planos da Allp Fit.',
  matricula: 'Olá! Quero fazer minha matrícula na Allp Fit.',
  experimental: 'Olá! Gostaria de agendar uma aula experimental na Allp Fit.',
  horarios: 'Olá! Gostaria de confirmar os horários de funcionamento da Allp Fit.',
};
