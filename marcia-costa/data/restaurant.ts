/**
 * Ficha da casa. TODO dado comercial do site sai daqui -- nada de endereco,
 * telefone ou horario escrito dentro de componente.
 *
 * O que ainda nao foi confirmado pela Marcia fica como string vazia ou null.
 * O site nunca preenche o buraco com suposicao: a tela mostra
 * "Informacao a cadastrar" e o recurso que depende do dado fica desativado.
 */

const env = (chave: string) => (process.env[chave] ?? "").trim();

export type OpeningHour = {
  /** Rotulo do dia ou faixa de dias, por exemplo "Segunda a sexta". */
  dias: string;
  /** Horario ja formatado, por exemplo "11h as 15h". Vazio = nao confirmado. */
  horario: string;
};

export const restaurant = {
  name: "Comida Caseira da Márcia Costa",
  shortName: "Comida Caseira",
  tagline: "Sabor de comida caseira de verdade",
  description:
    "Marmitas frescas, preparadas todos os dias com ingredientes selecionados e muito amor.",

  logo: "/images/brand/logo.png",

  /**
   * So digitos, com DDI e DDD. Vem de NEXT_PUBLIC_WHATSAPP.
   * Enquanto estiver vazio, o botao de enviar pedido nao finge que funciona:
   * ele explica que o numero ainda nao foi cadastrado e oferece copiar a
   * mensagem pronta.
   */
  whatsapp: env("NEXT_PUBLIC_WHATSAPP"),

  /** Perfil do Instagram sem @. Vazio = secao some do site. */
  instagram: env("NEXT_PUBLIC_INSTAGRAM"),

  /** Endereco da cozinha, usado tambem na retirada. Vazio = a cadastrar. */
  address: env("NEXT_PUBLIC_ENDERECO"),

  /**
   * Chave do Google Maps Embed API. Sem ela o site nao mostra mapa embutido:
   * mostra o endereco e um link que abre o Google Maps. Iframe sem chave
   * carrega uma vez e depois passa a devolver erro -- seria um mapa quebrado
   * na cara do cliente.
   */
  googleMapsKey: env("NEXT_PUBLIC_GOOGLE_MAPS_KEY"),

  /**
   * Link do perfil da casa no Google (Maps ou Busca), para o cliente avaliar.
   * Vazio = o botao de avaliar nao aparece.
   */
  googleAvaliacoes: env("NEXT_PUBLIC_GOOGLE_AVALIACOES"),

  /** Cidades atendidas, confirmadas nas pecas da propria casa. */
  cities: ["Jacareí - SP", "São José dos Campos - SP"] as const,

  /**
   * Horarios. Nenhum horario foi confirmado ate agora, entao a lista esta
   * vazia e a secao Informacoes mostra "Informacao a cadastrar".
   * Para publicar, preencha assim:
   *   { dias: "Segunda a sábado", horario: "11h às 15h" }
   */
  openingHours: [] as OpeningHour[],

  /** Links de marketplace. Vazio = o link some da tela. */
  instadelivery: env("NEXT_PUBLIC_INSTADELIVERY"),
  ifood: env("NEXT_PUBLIC_IFOOD"),

  siteUrl: env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000",
} as const;

/** Formas de pagamento aceitas na entrega/retirada. */
export const paymentMethods = [
  { id: "pix", label: "Pix", icon: "QrCode" },
  { id: "dinheiro", label: "Dinheiro", icon: "Banknote" },
  { id: "debito", label: "Débito", icon: "CreditCard" },
  { id: "credito", label: "Crédito", icon: "CreditCard" },
] as const;

export const temWhatsapp = restaurant.whatsapp.length >= 12;
export const temInstagram = restaurant.instagram.length > 0;
export const temEndereco = restaurant.address.length > 0;
export const temMapa = temEndereco && restaurant.googleMapsKey.length > 0;
export const temLinkDeAvaliacao = restaurant.googleAvaliacoes.length > 0;
export const temHorarios = restaurant.openingHours.length > 0;

export const INFORMACAO_A_CADASTRAR = "Informação a cadastrar";
