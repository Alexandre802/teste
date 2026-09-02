import {
  BarChart3,
  Banknote,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  TrendingDown,
  Users,
  Wallet,
} from "lucide-react";

/** Um item do menu do painel. */
export type ItemMenu = {
  nome: string;
  href: string;
  icone: typeof LayoutDashboard;
};

export const MENU: ItemMenu[] = [
  { nome: "Resumo", href: "/admin", icone: LayoutDashboard },
  { nome: "Pedidos", href: "/admin/pedidos", icone: ShoppingBag },
  { nome: "Receitas", href: "/admin/receitas", icone: Receipt },
  { nome: "Despesas", href: "/admin/despesas", icone: TrendingDown },
  { nome: "Relatórios", href: "/admin/relatorios", icone: BarChart3 },
  { nome: "Caixa", href: "/admin/caixa", icone: Banknote },
  { nome: "Produtos", href: "/admin/produtos", icone: Package },
  { nome: "Clientes", href: "/admin/clientes", icone: Users },
  { nome: "Configurações", href: "/admin/configuracoes", icone: Settings },
];

export const ICONE_CARTEIRA = Wallet;
