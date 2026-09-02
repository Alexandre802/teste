/**
 * Dados comerciais confirmados na fonte pública oficial da Comida Caseira da
 * Márcia Costa (InstaDelivery). Variáveis de ambiente ainda podem sobrescrever
 * os canais quando a casa desejar trocar algum dado sem novo deploy.
 */
const env = (chave: string) => (process.env[chave] ?? "").trim();

export type OpeningHour = {
  dias: string;
  horario: string;
};

export const restaurant = {
  name: "Comida Caseira da Márcia Costa",
  shortName: "Comida Caseira",
  tagline: "Sabor de comida caseira de verdade",
  description:
    "Marmitas frescas e saborosas, com pedidos para entrega ou retirada.",
  logo: "/images/brand/logo.png",

  whatsapp: env("NEXT_PUBLIC_WHATSAPP") || "5512996011026",
  phone: "5512981892680",
  instagram: env("NEXT_PUBLIC_INSTAGRAM"),

  /**
   * Endereco da cozinha, usado tambem na retirada. O valor padrao veio da
   * pagina oficial da casa no InstaDelivery; a variavel de ambiente continua
   * podendo sobrescrever sem mexer no codigo.
   */
  address:
    env("NEXT_PUBLIC_ENDERECO") ||
    "Av. Augusto Rodrigues, 511 - Jardim Maria Amelia, Jacareí - SP",

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
  openingHours: [
    { dias: "Todos os dias", horario: "08:30 às 15:00" },
    { dias: "Domingo a quinta", horario: "16:00 às 23:00" },
    { dias: "Sexta e sábado", horario: "16:00 às 23:30" },
  ] as OpeningHour[],
  instadelivery:
    env("NEXT_PUBLIC_INSTADELIVERY") ||
    "https://instadelivery.com.br/comidacaseiradamarciacosta",
  ifood: env("NEXT_PUBLIC_IFOOD"),
  siteUrl: env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000",
  retiradaDisponivel: true,
  tempoEstimadoMinutos: 30,
} as const;

/** Métodos confirmados no cardápio original. O checkout próprio usa os quatro
 * tipos já suportados pelo fluxo financeiro; vale-refeição/alimentação fica
 * documentado em acceptedPaymentLabels até o caixa ganhar esse enum. */
export const paymentMethods = [
  { id: "pix", label: "Pix", icon: "QrCode" },
  { id: "dinheiro", label: "Dinheiro", icon: "Banknote" },
  { id: "debito", label: "Débito", icon: "CreditCard" },
  { id: "credito", label: "Crédito", icon: "CreditCard" },
] as const;

export const acceptedPaymentLabels = [
  "Dinheiro",
  "PIX (chave exibida após o envio)",
  "Cartão de Débito - Maquininha",
  "Cartão de Crédito - Maquininha",
  "Vale Refeição / Alimentação",
] as const;

export const temWhatsapp = restaurant.whatsapp.length >= 12;
export const temInstagram = restaurant.instagram.length > 0;
export const temEndereco = restaurant.address.length > 0;
export const temMapa = temEndereco && restaurant.googleMapsKey.length > 0;
export const temLinkDeAvaliacao = restaurant.googleAvaliacoes.length > 0;
export const temHorarios = restaurant.openingHours.length > 0;
export const INFORMACAO_A_CADASTRAR = "Informação a cadastrar";
