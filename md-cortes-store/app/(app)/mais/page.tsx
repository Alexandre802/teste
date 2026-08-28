"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  FileBarChart,
  LogOut,
  Receipt,
  ReceiptText,
  Search,
  Settings,
  Truck,
} from "lucide-react";
import type { ReactNode } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import { ScreenTitle } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SyncStatus } from "@/components/layout/SyncStatus";
import { BRAND } from "@/lib/brand";

const ITENS: { href: string; icone: ReactNode; titulo: string }[] = [
  { href: "/vendas", icone: <ReceiptText size={18} />, titulo: "Histórico de vendas" },
  { href: "/despesas", icone: <Receipt size={18} />, titulo: "Despesas" },
  { href: "/relatorios", icone: <FileBarChart size={18} />, titulo: "Relatórios" },
  { href: "/busca", icone: <Search size={18} />, titulo: "Busca" },
  { href: "/mais/fornecedores", icone: <Truck size={18} />, titulo: "Fornecedores" },
  { href: "/mais/lembretes", icone: <Bell size={18} />, titulo: "Lembretes" },
  { href: "/mais/configuracoes", icone: <Settings size={18} />, titulo: "Configurações" },
];

export default function MaisPage() {
  const router = useRouter();
  const ownerName = useStore((s) => s.ownerName);
  const reset = useStore((s) => s.reset);

  async function sair() {
    const supabase = getSupabase();
    // O espelho local sai junto: o aparelho pode não ser só dele.
    await reset();
    await supabase?.auth.signOut();
    router.replace("/login");
  }

  return (
    <>
      <ScreenTitle title="Mais" subtitle={`Conta de ${ownerName}`} action={<SyncStatus compacto />} />

      <Card>
        <ul>
          {ITENS.map((item) => (
            <li key={item.href} className="border-b border-borda last:border-b-0">
              <Link href={item.href} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-areia">
                <span className="text-ouro">{item.icone}</span>
                <span className="flex-1 text-[15px] text-tinta">{item.titulo}</span>
                <ChevronRight size={17} className="text-cinza-claro" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Button variant="perigo" size="md" full className="mt-5" onClick={sair}>
        <LogOut size={17} />
        Sair
      </Button>

      <p className="marca mt-8 text-center text-[13px] text-cinza-claro">{BRAND.name}</p>
    </>
  );
}
