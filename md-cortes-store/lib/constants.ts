import type {
  CategoryGroup,
  CategoryId,
  ExpenseCategory,
  PaymentMethod,
} from "@/types";

export const CATEGORIES: { id: CategoryId; label: string; group: CategoryGroup }[] = [
  { id: "camiseta", label: "Camiseta", group: "roupas" },
  { id: "bermuda", label: "Bermuda", group: "roupas" },
  { id: "calca", label: "Calça", group: "roupas" },
  { id: "bone", label: "Boné", group: "acessorios" },
  { id: "tenis", label: "Tênis", group: "calcados" },
  { id: "acessorio", label: "Acessório", group: "acessorios" },
  { id: "outros", label: "Outros", group: "roupas" },
];

export const CATEGORY_GROUPS: { id: CategoryGroup | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "roupas", label: "Roupas" },
  { id: "acessorios", label: "Acessórios" },
  { id: "calcados", label: "Calçados" },
];

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? "Outros";
}

export function categoryGroup(id: CategoryId): CategoryGroup {
  return CATEGORIES.find((c) => c.id === id)?.group ?? "roupas";
}

/** Tamanhos sugeridos. O produto pode ter os seus próprios. */
export const DEFAULT_SIZES = ["P", "M", "G", "GG", "XG"] as const;
export const SHOE_SIZES = ["37", "38", "39", "40", "41", "42", "43", "44"] as const;
export const SINGLE_SIZE = "Único";

const SIZE_ORDER = ["PP", "P", "M", "G", "GG", "XG", "XGG", SINGLE_SIZE];

/** P antes de M antes de G; número de calçado na ordem numérica; resto alfabético. */
export function compareSizes(a: string, b: string): number {
  const ia = SIZE_ORDER.indexOf(a);
  const ib = SIZE_ORDER.indexOf(b);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.localeCompare(b, "pt-BR");
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "pix", label: "Pix" },
  { id: "dinheiro", label: "Dinheiro" },
  { id: "debito", label: "Débito" },
  { id: "credito", label: "Crédito" },
];

export function paymentLabel(id: PaymentMethod): string {
  return PAYMENT_METHODS.find((p) => p.id === id)?.label ?? id;
}

export const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string }[] = [
  { id: "mercadoria", label: "Compra de mercadoria" },
  { id: "embalagem", label: "Embalagem" },
  { id: "frete", label: "Frete" },
  { id: "marketing", label: "Marketing" },
  { id: "aluguel", label: "Aluguel" },
  { id: "transporte", label: "Transporte" },
  { id: "outros", label: "Outros" },
];

export function expenseCategoryLabel(id: ExpenseCategory): string {
  return EXPENSE_CATEGORIES.find((c) => c.id === id)?.label ?? "Outros";
}

/** Cores mais comuns na loja, para o cadastro não virar digitação. */
export const COLOR_PRESETS: { name: string; hex: string }[] = [
  { name: "Preta", hex: "#111111" },
  { name: "Branca", hex: "#F5F5F3" },
  { name: "Bege", hex: "#D8C3A5" },
  { name: "Cinza", hex: "#9CA3AF" },
  { name: "Azul", hex: "#1E3A8A" },
  { name: "Verde", hex: "#166534" },
  { name: "Vermelha", hex: "#B91C1C" },
  { name: "Marrom", hex: "#6B4423" },
  { name: "Rosa", hex: "#EC9EC0" },
  { name: "Amarela", hex: "#E8B84B" },
];

export const REMINDER_INTERVALS = [60, 120, 180, 240] as const;

/** Dias sem venda a partir dos quais a peça entra na lista de paradas. */
export const STALE_PRODUCT_DAYS = 30;
