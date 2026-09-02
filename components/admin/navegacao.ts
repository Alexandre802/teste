import {
  BarChart3,
  Banknote,
  LayoutDashboard,
  ListOrdered,
  Package,
  Receipt,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface ItemMenu {
  href: string;
  rotulo: string;
  icone: LucideIcon;
}

/**
 * O menu, num arquivo só.
 *
 * A barra de baixo (celular) e a lateral (computador) leem daqui. Duas
 * listas separadas seria como um item novo aparece num lugar e some no outro.
 */
export const MENU: ItemMenu[] = [
  { href: '/admin', rotulo: 'Resumo', icone: LayoutDashboard },
  { href: '/admin/pedidos', rotulo: 'Pedidos', icone: ListOrdered },
  { href: '/admin/receitas', rotulo: 'Receitas', icone: Banknote },
  { href: '/admin/despesas', rotulo: 'Despesas', icone: Receipt },
  { href: '/admin/relatorios', rotulo: 'Relatórios', icone: BarChart3 },
  { href: '/admin/caixa', rotulo: 'Caixa', icone: Wallet },
  { href: '/admin/produtos', rotulo: 'Produtos', icone: Package },
  { href: '/admin/clientes', rotulo: 'Clientes', icone: Users },
  { href: '/admin/configuracoes', rotulo: 'Configurações', icone: Settings },
];

/** Os quatro do rodapé no celular. O quinto lugar é o botão "Mais". */
export const MENU_CELULAR = ['/admin', '/admin/pedidos', '/admin/despesas'];

/**
 * O item ativo.
 *
 * `/admin` casa exato; o resto casa por prefixo, para `/admin/pedidos/abc`
 * continuar acendendo "Pedidos". Sem o caso especial, `/admin` ficaria aceso
 * em todas as telas, já que toda rota começa com ele.
 */
export function ehRotaAtiva(href: string, caminho: string): boolean {
  return href === '/admin' ? caminho === '/admin' : caminho.startsWith(href);
}
