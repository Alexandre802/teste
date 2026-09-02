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
 *    bebidas), a forma de pedir e as cidades atendidas. Os pratos citados
 *    sao os que existem em data/menu-original.json, o cardapio oficial.
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
    id: "marmitex",
    titulo: "Marmitex e pratos",
    chamada:
      "Marmitex feito na hora, com arroz, feijão e o prato do dia escolhido por você.",
    termos: [
      "marmitex",
      "marmita",
      "marmitex irresistível",
      "marmita delivery",
      "marmitex delivery",
      "bife a cavalo",
      "bife acebolado",
      "parmegiana de bife",
      "filé de frango grelhado",
      "filé de frango parmegiana",
      "filé de frango milanesa",
      "frango grelhado",
      "frango à parmegiana",
      "frango à milanesa",
      "omelete",
      "arroz e feijão",
      "batata rústica",
      "farofa",
      "marmitex tamanho P",
      "marmitex tamanho M",
      "marmitex tamanho G",
      "quentinha",
      "comida caseira",
      "almoço caseiro",
    ],
  },
  {
    id: "refeicao",
    titulo: "Refeição pronta",
    chamada:
      "Almoço e janta resolvidos, para comer em casa, no trabalho ou levar para viagem.",
    termos: [
      "refeição pronta",
      "almoço pronto",
      "jantar pronto",
      "marmita para viagem",
      "marmita para o trabalho",
      "comida de casa",
      "comida feita na hora",
      "marmita fresca",
      "almoço rápido",
      "janta rápida",
      "comida caseira delivery",
      "marmita quentinha",
      "prato feito",
      "refeição completa",
      "comida de verdade",
      "almoço em casa",
    ],
  },
  {
    id: "bebidas",
    titulo: "Bebidas",
    chamada: "Refrigerante gelado para acompanhar, na lata, mini ou dois litros.",
    termos: [
      "bebidas",
      "refrigerante",
      "refrigerante gelado",
      "refrigerante lata",
      "refrigerante 2 litros",
      "Coca Cola",
      "Coca Cola lata",
      "Coca Cola 2L",
      "Coca Cola mini",
      "Fanta Laranja",
      "Fanta Laranja 2L",
      "Frutuba 2L",
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
      "pedir marmitex online",
      "pagamento no pix",
      "pagamento em dinheiro",
      "pagamento no cartão",
    ],
  },
  {
    id: "jacarei",
    titulo: "Entrega em Jacareí",
    chamada:
      "A cozinha fica na Av. Augusto Rodrigues, no Jardim Maria Amélia, e entregamos em Jacareí.",
    termos: [
      "Jacareí",
      "marmitex Jacareí",
      "marmita Jacareí",
      "comida caseira Jacareí",
      "delivery Jacareí",
      "delivery de marmita Jacareí",
      "almoço Jacareí",
      "quentinha Jacareí",
      "comida delivery Jacareí",
      "restaurante delivery Jacareí",
      "marmitex delivery Jacareí",
      "Jardim Maria Amélia",
      "Av. Augusto Rodrigues",
      "almoço no Jardim Maria Amélia",
      "marmita Jardim Maria Amélia",
      "onde comer em Jacareí",
    ],
  },
  {
    id: "sjc",
    titulo: "Entrega em São José dos Campos",
    chamada: "Também entregamos em São José dos Campos, no Vale do Paraíba.",
    termos: [
      "São José dos Campos",
      "marmitex São José dos Campos",
      "marmita São José dos Campos",
      "comida caseira São José dos Campos",
      "delivery São José dos Campos",
      "almoço São José dos Campos",
      "quentinha São José dos Campos",
      "comida delivery São José dos Campos",
      "marmita delivery SJC",
      "delivery SJC",
      "comida caseira SJC",
      "onde comer em São José dos Campos",
    ],
  },
  {
    id: "regiao",
    titulo: "Região e marca",
    chamada:
      "Comida Caseira da Márcia Costa, cozinha de família no Vale do Paraíba.",
    termos: [
      "Vale do Paraíba",
      "marmitex Vale do Paraíba",
      "Comida Caseira da Márcia Costa",
      "Márcia Costa",
    ],
  },
];

/** As 100 palavras, em lista única. */
export const palavrasChave: string[] = gruposDePalavras.flatMap(
  (grupo) => grupo.termos,
);
