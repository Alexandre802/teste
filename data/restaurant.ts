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
    "Seja bem-vindo(a) à Comida Caseira da Márcia Costa. Faça seu pedido abaixo!",
  logo: "/images/brand/logo.png",

  phone: "5512981892680",
  phoneLabel: "(12) 98189-2680",
  whatsapp: env("NEXT_PUBLIC_WHATSAPP") || "5512996011026",
  whatsappLabel: "(12) 99601-1026",
  instagram: env("NEXT_PUBLIC_INSTAGRAM"),
  address:
    env("NEXT_PUBLIC_ENDERECO") ||
    "Av. Augusto Rodrigues, 511 - Jardim Maria Amelia, Jacareí - SP",
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
  siteUrl:
    env("NEXT_PUBLIC_SITE_URL") ||
    "https://comida-caseira-marcia-costa.vercel.app",
  retiradaDisponivel: true,
  tempoEstimadoMinutos: { minimo: 30, maximo: 50 },
  avaliacaoMedia: 4.73,
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
export const temHorarios = restaurant.openingHours.length > 0;
export const INFORMACAO_A_CADASTRAR = "Informação a cadastrar";
