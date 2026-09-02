/**
 * PALAVRAS-CHAVE DA COMIDA CASEIRA DA MARCIA COSTA
 * ---------------------------------------------------------------------------
 * 100 termos de busca, agrupados por assunto.
 *
 * DUAS COISAS IMPORTANTES SOBRE ESTA LISTA:
 *
 * 1. Ela e usada em CONTEUDO VISIVEL (components/sections/BuscaLocal.tsx).
 *    Texto escondido para buscador e cloaking, e cloaking derruba o dominio.
 *    A meta tag `keywords` tambem recebe a lista, mas o Google a ignora desde
 *    2009 -- quem ranqueia e o texto que o cliente le na tela.
 *
 * 2. Nenhum termo promete prato que a casa nao faz. So entram: os produtos
 *    confirmados no cardapio, as categorias que a casa atende (marmitas,
 *    lanches, acai, bebidas), a forma de pedir e as cidades atendidas.
 *    Colocar "feijoada" aqui sem a casa fazer feijoada e o mesmo tipo de
 *    invencao que a gente evita no resto do site.
 */

export type GrupoDePalavras = {
  id: string;
  titulo: string;
  /** Frase visivel que abre o grupo -- e ela que o buscador le como contexto. */
  chamada: string;
  termos: string[];
};

export const gruposDePalavras: GrupoDePalavras[] = [
  {
    id: "marmitas",
    titulo: "Marmitas e comida caseira",
    chamada:
      "Marmita feita na hora, com arroz, feijão, carne do dia, farofa, legumes e salada.",
    termos: [
      "marmita",
      "marmitex",
      "marmita padrão",
      "marmita especial",
      "marmitex noturna",
      "comida caseira",
      "comida caseira delivery",
      "marmita delivery",
      "almoço caseiro",
      "quentinha",
      "refeição pronta",
      "marmita para viagem",
      "marmita para o trabalho",
      "comida de casa",
      "almoço pronto",
      "jantar pronto",
      "marmita fresca",
      "comida feita na hora",
      "lasanha",
      "lasanha delivery",
    ],
  },
  {
    id: "lanches",
    titulo: "Lanches",
    chamada: "Sanduíches preparados na hora, com pão sírio e fritas crocantes.",
    termos: [
      "lanches",
      "lanche delivery",
      "sanduíche",
      "sanduíche delivery",
      "beirute",
      "beirute com fritas",
      "pão sírio",
      "lanche com fritas",
      "lanche na hora",
      "lanchonete",
      "lanchonete delivery",
      "porção de fritas",
      "batata frita",
      "lanche à noite",
      "lanche rápido",
    ],
  },
  {
    id: "acai",
    titulo: "Açaí e bebidas",
    chamada: "Açaí puro com granola, banana e leite em pó, e bebida gelada para acompanhar.",
    termos: [
      "açaí",
      "açaí 500ml",
      "açaí delivery",
      "açaí no copo",
      "açaí com granola",
      "açaí com banana",
      "tigela de açaí",
      "bebidas",
      "bebida gelada",
      "refrigerante",
      "suco",
      "água",
      "bebida para acompanhar",
    ],
  },
  {
    id: "pedido",
    titulo: "Como pedir",
    chamada:
      "Monte o pedido no cardápio digital e envie pelo WhatsApp. Entrega ou retirada no balcão.",
    termos: [
      "delivery",
      "delivery de comida",
      "entrega de comida",
      "entrega rápida",
      "pedido pelo WhatsApp",
      "pedir pelo WhatsApp",
      "cardápio online",
      "cardápio digital",
      "peça online",
      "retirada no balcão",
      "retirada",
      "pedir almoço online",
      "pedir marmita online",
      "comida por aplicativo",
      "pagamento no pix",
      "pagamento em dinheiro",
      "pagamento no cartão",
    ],
  },
  {
    id: "jacarei",
    titulo: "Entrega em Jacareí",
    chamada: "Levamos marmita, lanche e açaí até você em Jacareí.",
    termos: [
      "Jacareí",
      "marmita Jacareí",
      "marmitex Jacareí",
      "comida caseira Jacareí",
      "delivery Jacareí",
      "delivery de marmita Jacareí",
      "lanches Jacareí",
      "açaí Jacareí",
      "almoço Jacareí",
      "comida delivery Jacareí",
      "quentinha Jacareí",
      "marmita delivery Jacareí",
      "restaurante delivery Jacareí",
    ],
  },
  {
    id: "sjc",
    titulo: "Entrega em São José dos Campos",
    chamada: "Também entregamos em São José dos Campos, no Vale do Paraíba.",
    termos: [
      "São José dos Campos",
      "marmita São José dos Campos",
      "marmitex São José dos Campos",
      "comida caseira São José dos Campos",
      "delivery São José dos Campos",
      "lanches São José dos Campos",
      "açaí São José dos Campos",
      "almoço São José dos Campos",
      "comida delivery São José dos Campos",
      "quentinha São José dos Campos",
      "marmita delivery SJC",
      "delivery SJC",
      "comida caseira SJC",
    ],
  },
  {
    id: "regiao",
    titulo: "Região e marca",
    chamada:
      "Comida Caseira da Márcia Costa, cozinha de família no Vale do Paraíba.",
    termos: [
      "Vale do Paraíba",
      "marmita Vale do Paraíba",
      "comida caseira Vale do Paraíba",
      "delivery Vale do Paraíba",
      "interior de São Paulo",
      "Comida Caseira da Márcia Costa",
      "Márcia Costa",
      "marmita da Márcia",
      "comida caseira da Márcia",
    ],
  },
];

/** As 100 palavras, em lista única. */
export const palavrasChave: string[] = gruposDePalavras.flatMap(
  (grupo) => grupo.termos,
);
