"use client";

import type { ProductDraft } from "@/lib/store";

/**
 * Dados de demonstração.
 *
 * NÃO são dados da loja: são exemplos, carregados só quando Maicon toca no
 * botão em Configurações, para ele ver o app funcionando antes de cadastrar o
 * catálogo de verdade. Nada disso entra sozinho — a loja começa vazia.
 *
 * Os nomes e valores vieram das telas de referência do projeto.
 */
export const PRODUTOS_DEMONSTRACAO: ProductDraft[] = [
  {
    name: "Camiseta Oversized MD",
    category: "camiseta",
    supplierId: null,
    sku: "CMD-OV-001",
    costCents: 4500,
    priceCents: 9990,
    minStock: 3,
    variants: [
      {
        colorName: "Preta",
        colorHex: "#111111",
        imageUrl: null,
        sku: null,
        quantities: { P: 4, M: 8, G: 3, GG: 1 },
      },
      {
        colorName: "Branca",
        colorHex: "#F5F5F3",
        imageUrl: null,
        sku: null,
        quantities: { P: 2, M: 4, G: 3, GG: 1 },
      },
    ],
  },
  {
    name: "Bermuda Cargo MD",
    category: "bermuda",
    supplierId: null,
    sku: "BMD-CG-002",
    costCents: 5500,
    priceCents: 12990,
    minStock: 3,
    variants: [
      {
        colorName: "Bege",
        colorHex: "#D8C3A5",
        imageUrl: null,
        sku: null,
        quantities: { P: 3, M: 5, G: 3, GG: 1 },
      },
    ],
  },
  {
    name: "Boné MD",
    category: "bone",
    supplierId: null,
    sku: "BON-MD-003",
    costCents: 3000,
    priceCents: 6990,
    minStock: 5,
    variants: [
      {
        colorName: "Preta",
        colorHex: "#111111",
        imageUrl: null,
        sku: null,
        quantities: { Único: 25 },
      },
    ],
  },
  {
    name: "Camiseta Básica MD",
    category: "camiseta",
    supplierId: null,
    sku: "CMD-BS-004",
    costCents: 3500,
    priceCents: 7990,
    minStock: 4,
    variants: [
      {
        colorName: "Preta",
        colorHex: "#111111",
        imageUrl: null,
        sku: null,
        quantities: { P: 1, M: 2, G: 1, GG: 1 },
      },
    ],
  },
];

export const FORNECEDOR_DEMONSTRACAO = {
  name: "MD Confecções",
  phone: null,
  notes: "Fornecedor de exemplo — troque pelos seus.",
};
